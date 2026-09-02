const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', customerAuthController.register);
router.post('/verify-otp', customerAuthController.verifyOtp);
router.post('/resend-otp', customerAuthController.resendOtp);
router.post('/login', customerAuthController.login);
router.get('/me', protect, customerAuthController.getMe);

module.exports = router;
