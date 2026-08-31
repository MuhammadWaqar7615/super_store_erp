const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, authorizeRoles('Admin'), getDashboardMetrics);

module.exports = router;
