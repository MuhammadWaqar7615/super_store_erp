const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getCashierDashboardMetrics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, authorizeRoles('Admin'), getDashboardMetrics);
router.get('/cashier-dashboard', protect, authorizeRoles('Cashier'), getCashierDashboardMetrics);

module.exports = router;
