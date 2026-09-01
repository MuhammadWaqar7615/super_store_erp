require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

(async () => {
  try {
    const amount = 136;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'pkr',
    });
    console.log("Success:", paymentIntent.client_secret);
  } catch (err) {
    console.error("Stripe Error:", err.message);
  }
})();
