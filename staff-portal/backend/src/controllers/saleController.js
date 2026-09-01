const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const validateCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const total = product.sellingPrice * item.quantity;
      subtotal += total;

      validatedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        purchaseCost: product.purchasePrice,
        total
      });
    }

    res.json({ success: true, data: { items: validatedItems, subtotal, total: subtotal } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createSale = async (req, res) => {
  try {
    const { items, customerId, paymentStatus, stripePaymentIntentId } = req.body;

    let subtotal = 0;
    const validatedItems = [];

    // First validate and prepare items, calculate subtotal
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found` });
      }
      
      const itemTotal = product.sellingPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        purchaseCost: product.purchasePrice,
        total: itemTotal,
        // keep reference to product for stock update
        productDoc: product
      });
    }

    const sale = new Sale({
      invoiceNumber: `INV-${Date.now()}`,
      customerId,
      cashierId: req.user._id,
      channel: 'pos',
      items: validatedItems.map(({ productDoc, ...rest }) => rest), // remove productDoc before saving
      subtotal,
      total: subtotal,
      paymentStatus,
      // store stripe intent if needed, though schema doesn't currently have it
    });

    await sale.save();

    // Now update stock and create movements
    for (let item of validatedItems) {
      const product = item.productDoc;
      const previousStock = product.stockQuantity;
      product.stockQuantity -= item.quantity;
      await product.save();

      await StockMovement.create({
        productId: product._id,
        type: 'SALE',
        quantity: item.quantity,
        previousStock,
        newStock: product.stockQuantity,
        referenceType: 'SALE',
        referenceId: sale._id,
        createdBy: req.user._id,
        reason: `POS Sale ${sale.invoiceNumber}`
      });
    }

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    console.error('Create Sale Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSales = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Cashier') {
      query.cashierId = req.user._id;
    }

    const sales = await Sale.find(query)
      .populate('customerId', 'name')
      .populate('cashierId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customerId', 'name')
      .populate('cashierId', 'name');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { validateCart, createSale, getSales, getSaleById };
