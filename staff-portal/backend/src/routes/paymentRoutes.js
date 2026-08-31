const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/create-intent', protect, authorizeRoles('Admin', 'Cashier'), createPaymentIntent);

module.exports = router;
