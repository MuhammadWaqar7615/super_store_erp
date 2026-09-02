const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, saleController.getMySales);
router.get('/:id', protect, saleController.getSaleById);

module.exports = router;
