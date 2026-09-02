const Sale = require('../models/Sale');

exports.getMySales = async (req, res) => {
  try {
    const sales = await Sale.find({ customerId: req.customer._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, sales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, customerId: req.customer._id })
      .populate('items.productId')
      .populate('cashierId', 'name');
    
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }
    
    res.status(200).json({ success: true, sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
