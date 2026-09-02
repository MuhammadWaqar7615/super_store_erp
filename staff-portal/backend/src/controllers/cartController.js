const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

exports.getPendingCarts = async (req, res) => {
  try {
    console.log('[DEBUG] getPendingCarts called by user:', req.user?._id);
    const carts = await Cart.find({ status: 'submitted' })
      .populate('customerId', 'name phone email')
      .sort({ submittedAt: 1 });
    console.log(`[DEBUG] Found ${carts.length} submitted carts.`);
    if (carts.length > 0) {
      console.log('[DEBUG] Cart details:', JSON.stringify(carts, null, 2));
    }
    res.status(200).json({ success: true, data: carts });
  } catch (error) {
    console.error('getPendingCarts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate('customerId', 'name phone email');
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('getCartById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.finalizeCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findById(id);

    if (!cart) {
      return res.status(400).json({ success: false, message: 'This cart has expired and is no longer valid. The customer must submit a new cart.' });
    }
    
    if (cart.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'This cart has already been processed or cancelled.' });
    }

    let subtotal = 0;
    const saleItems = [];

    // Re-validate against current Product data
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive || product.stockQuantity < item.quantity || product.sellingPrice !== item.unitPriceSnapshot) {
        cart.status = 'cancelled';
        await cart.save();
        return res.status(400).json({ success: false, message: `Product ${item.productName} is unavailable, out of stock, or price changed.` });
      }
      
      const itemTotal = product.sellingPrice * item.quantity;
      subtotal += itemTotal;
      
      saleItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        purchaseCost: product.purchasePrice,
        total: itemTotal
      });
    }

    // All valid -> create Sale
    const sale = new Sale({
      invoiceNumber: `INV-${Date.now()}`,
      customerId: cart.customerId,
      cashierId: req.user._id,
      cartId: cart._id,
      channel: 'self-checkout',
      items: saleItems,
      subtotal,
      total: subtotal,
      status: 'pending',
      paymentStatus: 'pending'
    });
    await sale.save();

    cart.status = 'finalized';
    cart.finalizedBy = req.user._id;
    await cart.save();

    let paymentIntent;
    try {
      // Create Stripe PaymentIntent
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(sale.total * 100),
        currency: 'pkr',
        metadata: { saleId: sale._id.toString() }
      });
    } catch (stripeError) {
      // Clean up the created sale and cart status since payment creation failed
      await Sale.findByIdAndDelete(sale._id);
      cart.status = 'cancelled';
      await cart.save();
      return res.status(400).json({ success: false, message: `Stripe Error: ${stripeError.message}` });
    }

    // Create Payment doc
    const payment = new Payment({
      amount: sale.total,
      method: 'STRIPE',
      referenceType: 'SALE',
      referenceId: sale._id,
      saleId: sale._id, // For store app compatibility
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret, // For store app compatibility
      status: 'pending' // using lowercase to match store app
    });
    await payment.save();

    res.status(200).json({ 
      success: true, 
      data: {
        sale,
        clientSecret: paymentIntent.client_secret
      } 
    });
  } catch (error) {
    console.error('finalizeCart error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
