const jwt = require('jsonwebtoken');

const generateToken = (id, role = null) => {
  // If role is null, it's a customer
  const payload = { id };
  if (role) {
    payload.role = role;
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;
