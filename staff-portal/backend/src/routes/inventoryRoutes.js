const express = require('express');
const router = express.Router();
const { getInventory, getLowStock, adjustStock, getMovements } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('Admin'), getInventory);
router.get('/low-stock', protect, authorizeRoles('Admin'), getLowStock);
router.post('/adjustment', protect, authorizeRoles('Admin'), adjustStock);
router.get('/movements', protect, authorizeRoles('Admin'), getMovements);

module.exports = router;
