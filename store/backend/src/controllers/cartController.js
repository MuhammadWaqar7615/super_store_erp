const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const { createPaymentIntent } = require('../services/stripeService');
const mongoose = require('mongoose');
const StockMovement = require('../models/StockMovement');
const Income = require('../models/Income');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customerId: req.customer._id, status: { $in: ['draft', 'submitted'] } })
      .populate('items.productId')
      .sort({ updatedAt: -1 });
    if (!cart) {
      cart = await Cart.create({ customerId: req.customer._id, items: [], status: 'draft' });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or inactive.' });
    }

    let cart = await Cart.findOne({ customerId: req.customer._id, status: 'draft' });
    if (!cart) {
      cart = new Cart({ customerId: req.customer._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += (quantity || 1);
      cart.items[itemIndex].unitPriceSnapshot = product.sellingPrice;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        quantity: quantity || 1,
        unitPriceSnapshot: product.sellingPrice
      });
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ customerId: req.customer._id, status: 'draft' });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      return res.status(200).json({ success: true, cart });
    } else {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ customerId: req.customer._id, status: 'draft' });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.customer._id, status: 'draft' });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty or not found.' });
    }

    cart.status = 'submitted';
    cart.submittedAt = new Date();
    cart.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCartStatus = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.customer._id, status: { $in: ['submitted', 'finalized', 'cancelled'] } }).sort({ updatedAt: -1 });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'No submitted cart found.' });
    }

    let clientSecret = null;
    let paymentIntentId = null;

    if (cart.status === 'finalized') {
      const sale = await Sale.findOne({ cartId: cart._id });
      if (sale) {
        const payment = await Payment.findOne({ saleId: sale._id });
        if (payment) {
          clientSecret = payment.stripeClientSecret;
          paymentIntentId = payment.stripePaymentIntentId;
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      status: cart.status, 
      clientSecret, 
      paymentIntentId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// TEST ONLY - Simulates cashier finalizing cart
exports.finalizeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findById(id);

    if (!cart || cart.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Cart not found or not submitted.' });
    }

    let subtotal = 0;
    const saleItems = [];

    // Re-validate
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive || product.stockQuantity < item.quantity) {
        cart.status = 'cancelled';
        await cart.save();
        return res.status(400).json({ success: false, message: `Product ${item.productName} is unavailable or price changed.` });
      }
      
      const itemTotal = product.sellingPrice * item.quantity;
      subtotal += itemTotal;
      
      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        purchaseCost: product.purchasePrice,
        total: itemTotal
      });
    }

    cart.status = 'finalized';
    cart.finalizedBy = req.customer._id; // mock as cashier
    await cart.save();

    // Create Sale
    const sale = new Sale({
      invoiceNumber: `INV-${Date.now()}`,
      customerId: cart.customerId,
      cashierId: req.customer._id, // mock
      cartId: cart._id,
      channel: 'self-checkout',
      items: saleItems,
      subtotal,
      total: subtotal,
      status: 'pending',
      paymentStatus: 'pending'
    });
    await sale.save();

    // Create Stripe PaymentIntent
    const paymentIntent = await createPaymentIntent(sale.total, 'pkr', { saleId: sale._id.toString() });

    // Create Payment record
    const payment = new Payment({
      saleId: sale._id,
      amount: sale.total,
      currency: 'pkr',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
    });
    await payment.save();

    res.status(200).json({ success: true, client_secret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


