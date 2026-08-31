const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

const getInventory = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getLowStock = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $or: [
          { $lte: ["$stockQuantity", "$minimumStock"] },
          { $eq: ["$stockQuantity", 0] }
        ]
      }
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousStock = product.stockQuantity;
    const newStock = previousStock + Number(quantity);

    if (newStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    product.stockQuantity = newStock;
    await product.save();

    const movement = new StockMovement({
      productId,
      type: 'ADJUSTMENT',
      quantity: Number(quantity),
      previousStock,
      newStock,
      reason,
      createdBy: req.user._id
    });
    await movement.save();

    res.json({ success: true, data: movement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find({})
      .populate('productId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: movements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getInventory, getLowStock, adjustStock, getMovements };
