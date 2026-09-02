const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../webhooks/stripeWebhook');

// Stripe requires the raw body to construct the event
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
