const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, authorizeRoles('Admin', 'Cashier'), getCustomers)
  .post(protect, authorizeRoles('Admin', 'Cashier'), createCustomer);

router.route('/:id')
  .get(protect, authorizeRoles('Admin', 'Cashier'), getCustomerById)
  .put(protect, authorizeRoles('Admin'), updateCustomer)
  .delete(protect, authorizeRoles('Admin'), deleteCustomer);

module.exports = router;
