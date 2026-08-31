const express = require('express');
const router = express.Router();
const { validateCart, createSale, getSales, getSaleById } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const staffOnly = authorizeRoles('Admin', 'Cashier');

router.post('/validate', protect, staffOnly, validateCart);
router.post('/', protect, staffOnly, createSale);
router.get('/', protect, staffOnly, getSales);
router.get('/:id', protect, staffOnly, getSaleById);

module.exports = router;
