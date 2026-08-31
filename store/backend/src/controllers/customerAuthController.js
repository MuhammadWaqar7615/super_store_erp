const bcrypt = require('bcrypt');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');

// @desc    Register a new customer (or upgrade walk-in record)
// @route   POST /api/customer-auth/register
// @access  Public
const registerCustomer = async (req, res) => {
  const { name, email, phone, password, address } = req.body;

  try {
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if email is already in use by a registered customer
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Account already exists. Please use Forgot Password to set your password and log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Collision check via Phone (Issue A resolution)
    let customer = await Customer.findOne({ phone });

    if (customer) {
      // If found but already registered, it's a conflict
      if (customer.isRegistered) {
         return res.status(400).json({ success: false, message: 'A registered account with this phone number already exists.' });
      }

      // Upgrade existing unregistered walk-in record
      customer.name = name;
      customer.email = email;
      customer.password = hashedPassword;
      customer.address = address;
      customer.isRegistered = true;
      await customer.save();
    } else {
      // Create entirely new customer
      customer = await Customer.create({
        name,
        email,
        phone,
        password: hashedPassword,
        address,
        isRegistered: true
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        token: generateToken(customer._id), // role is null for customer
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Auth customer & get token
// @route   POST /api/customer-auth/login
// @access  Public
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    if (customer && customer.isRegistered && (await bcrypt.compare(password, customer.password))) {
      res.json({
        success: true,
        data: {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          token: generateToken(customer._id),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get customer profile
// @route   GET /api/customer-auth/me
// @access  Private (Customer)
const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select('-password');
    if (customer) {
      res.json({ success: true, data: customer });
    } else {
      res.status(404).json({ success: false, message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { registerCustomer, loginCustomer, getCustomerProfile };
