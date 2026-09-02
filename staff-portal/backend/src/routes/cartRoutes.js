const express = require('express');
const router = express.Router();
const { getPendingCarts, getCartById, finalizeCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const cashierOnly = authorizeRoles('Cashier');

router.get('/pending', protect, cashierOnly, getPendingCarts);
router.get('/:id', protect, cashierOnly, getCartById);
router.post('/:id/finalize', protect, cashierOnly, finalizeCart);

module.exports = router;
