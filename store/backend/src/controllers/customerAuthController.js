const bcrypt = require('bcrypt');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    Register a new customer (or upgrade walk-in record)
// @route   POST /api/customer-auth/register
// @access  Public
const registerCustomer = async (req, res) => {
  const { name, email, phone, password, address, otp } = req.body;

  try {
    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields including OTP' });
    }

    if (name.length > 50 || email.length > 100 || password.length > 100 || (address && address.length > 200)) {
      return res.status(400).json({ success: false, message: 'One or more fields exceed the maximum allowed length' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number (10-15 digits)' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'OTP must be exactly 6 digits' });
    }

    const otpDoc = await OTP.findOne({ email });
    if (!otpDoc || otpDoc.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid. Please request a new one.' });
    }

    if (otpDoc.attempts >= 5) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ success: false, message: 'Maximum verification attempts reached. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.otp);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    await OTP.deleteOne({ email });

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

// @desc    Send OTP to email
// @route   POST /api/customer-auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    let otpDoc = await OTP.findOne({ email });

    if (otpDoc) {
      if (otpDoc.requestCount >= 3) {
        return res.status(429).json({ success: false, message: 'Maximum OTP requests reached. Please try again later.' });
      }
      if (Date.now() - otpDoc.lastRequestedAt.getTime() < 60000) {
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another OTP.' });
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    if (otpDoc) {
      otpDoc.otp = hashedOtp;
      otpDoc.attempts = 0;
      otpDoc.requestCount += 1;
      otpDoc.lastRequestedAt = Date.now();
      otpDoc.expiresAt = Date.now() + 15 * 60 * 1000;
      await otpDoc.save();
    } else {
      await OTP.create({
        email,
        otp: hashedOtp,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Super Store" <noreply@superstore.com>',
      to: email,
      subject: 'Your Registration OTP - Super Store',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Super Store</h2>
          <p>Your one-time password for registration is:</p>
          <h1 style="color: #6366f1; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 15 minutes.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eaeaea;" />
          <p style="color: #666; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL if using Ethereal (for testing purposes)
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
      console.log('OTP Email Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending OTP' });
  }
};

module.exports = { registerCustomer, loginCustomer, getCustomerProfile, sendOTP };
