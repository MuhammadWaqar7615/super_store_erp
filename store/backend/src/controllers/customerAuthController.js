const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const OTP = require('../models/OTP');
const { sendOTP } = require('../services/emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Check collision
    let customer = await Customer.findOne({ email });
    
    if (customer && customer.isRegistered) {
      return res.status(409).json({ success: false, message: 'Account already exists. Please login.' });
    }

    if (customer && !customer.isRegistered) {
      // Upgrade walk-in record
      customer.name = name;
      customer.phone = phone || customer.phone;
      customer.password = await bcrypt.hash(password, 10);
      customer.address = address;
      await customer.save();
    } else {
      // New record
      const hashedPassword = await bcrypt.hash(password, 10);
      customer = new Customer({
        name, email, phone, password: hashedPassword, address,
        isVerified: false, isRegistered: false
      });
      await customer.save();
    }

    // OTP Rate limiting
    let otpRecord = await OTP.findOne({ email });
    const now = new Date();
    
    if (otpRecord) {
      if (otpRecord.requestCount >= 3) {
        return res.status(429).json({ success: false, message: 'Max OTP requests reached. Try again later.' });
      }
      
      const timeDiff = now.getTime() - otpRecord.lastRequestedAt.getTime();
      if (timeDiff < 60000) { // 60 seconds cooldown
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new OTP.' });
      }
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(now.getTime() + 15 * 60000); // 15 mins

    if (otpRecord) {
      otpRecord.otp = await bcrypt.hash(otpCode, 10);
      otpRecord.expiresAt = expiresAt;
      otpRecord.lastRequestedAt = now;
      otpRecord.requestCount += 1;
      otpRecord.attempts = 0;
      await otpRecord.save();
    } else {
      otpRecord = new OTP({
        email,
        otp: await bcrypt.hash(otpCode, 10),
        expiresAt,
        lastRequestedAt: now,
        requestCount: 1,
        attempts: 0
      });
      await otpRecord.save();
    }

    await sendOTP(email, otpCode);

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'OTP must be 6 digits.' });
    }

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Max verification attempts reached. Request a new OTP.' });
    }

    otpRecord.attempts += 1;
    await otpRecord.save();

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Verify Success
    await OTP.deleteOne({ _id: otpRecord._id });
    
    const customer = await Customer.findOne({ email });
    customer.isVerified = true;
    customer.isRegistered = true;
    await customer.save();

    res.status(200).json({ success: true, message: 'Account verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    let otpRecord = await OTP.findOne({ email });
    const now = new Date();
    
    if (otpRecord) {
      if (otpRecord.requestCount >= 3) {
        return res.status(429).json({ success: false, message: 'Max OTP requests reached. Try again later.' });
      }
      const timeDiff = now.getTime() - otpRecord.lastRequestedAt.getTime();
      if (timeDiff < 60000) {
        return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new OTP.' });
      }
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(now.getTime() + 15 * 60000);

    if (otpRecord) {
      otpRecord.otp = await bcrypt.hash(otpCode, 10);
      otpRecord.expiresAt = expiresAt;
      otpRecord.lastRequestedAt = now;
      otpRecord.requestCount += 1;
      otpRecord.attempts = 0;
      await otpRecord.save();
    } else {
      otpRecord = new OTP({
        email,
        otp: await bcrypt.hash(otpCode, 10),
        expiresAt,
        lastRequestedAt: now,
        requestCount: 1,
        attempts: 0
      });
      await otpRecord.save();
    }

    await sendOTP(email, otpCode);
    res.status(200).json({ success: true, message: 'OTP resent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer || !customer.isRegistered) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!customer.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your account first.' });
    }

    const token = jwt.sign(
      { customerId: customer._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({ success: true, token, customer: { _id: customer._id, name: customer.name, email: customer.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).select('-password');
    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
