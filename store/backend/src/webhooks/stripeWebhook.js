const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Income = require('../models/Income');

exports.handleStripeWebhook = async (req, res) => {
  console.log('Webhook received!');
  let event;
  try {
    event = JSON.parse(req.body.toString());
    console.log('Event type:', event.type);
  } catch (err) {
    console.log('Webhook parse error:', err.message);
    return res.status(400).send('Webhook error: Invalid JSON');
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const webhookEventId = event.id;

    // Check idempotency
    const existingPayment = await Payment.findOne({ webhookEventId });
    if (existingPayment) {
      return res.status(200).send('Already processed');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id }).session(session);
      if (!payment) {
        await session.abortTransaction();
        return res.status(404).send('Payment not found');
      }

      payment.status = 'succeeded';
      payment.webhookEventId = webhookEventId;
      payment.webhookProcessedAt = new Date();
      payment.paidAt = new Date();
      await payment.save({ session });

      const sale = await Sale.findById(payment.saleId).session(session);
      if (sale) {
        sale.status = 'completed';
        sale.paymentStatus = 'paid';
        await sale.save({ session });

        // Atomic decrement Product.stockQuantity & create StockMovement
        for (const item of sale.items) {
          const product = await Product.findOneAndUpdate(
            { _id: item.productId, stockQuantity: { $gte: item.quantity } },
            { $inc: { stockQuantity: -item.quantity } },
            { new: false, session }
          );

          if (!product) {
            throw new Error(`Insufficient stock for product ${item.productName}`);
          }

          const stockMovement = new StockMovement({
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            previousStock: product.stockQuantity,
            newStock: product.stockQuantity - item.quantity,
            referenceId: sale._id
          });
          await stockMovement.save({ session });
        }

        // Create Income record
        const income = new Income({
          title: `Sale ${sale.invoiceNumber}`,
          source: 'Stripe',
          amount: sale.total,
          referenceType: 'sale',
          referenceId: sale._id,
          date: new Date()
        });
        await income.save({ session });
      }

      await session.commitTransaction();
      res.status(200).send('Success');
    } catch (error) {
      console.error('Transaction error:', error);
      await session.abortTransaction();
      res.status(500).send('Webhook handler failed');
    } finally {
      session.endSession();
    }
  } else {
    res.status(200).send('Unhandled event type');
  }
};
