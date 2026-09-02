const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, cartController.getCart);
router.post('/items', protect, cartController.addItem);
router.put('/items/:productId', protect, cartController.updateItemQuantity);
router.delete('/items/:productId', protect, cartController.removeItem);
router.post('/submit', protect, cartController.submitCart);
router.get('/status', protect, cartController.getCartStatus);

// TEST ONLY - Simulates cashier finalizing cart
router.post('/:id/finalize-test', protect, cartController.finalizeTest);

module.exports = router;
