const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Amount should be in smallest currency unit, e.g., cents. Assuming amount is in whole rupees, convert to paisa.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'pkr',
    });

    res.json({ success: true, data: { clientSecret: paymentIntent.client_secret } });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create payment intent' });
  }
};

module.exports = { createPaymentIntent };
