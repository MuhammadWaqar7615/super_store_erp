const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sale = require('./src/models/Sale');
const Product = require('./src/models/Product');
const StockMovement = require('./src/models/StockMovement');

dotenv.config();

const testCreateSale = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create a mock req.user
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Find a real product to use
    const product = await Product.findOne();
    if (!product) {
      console.log('No products found to test with');
      process.exit(1);
    }

    const items = [{ productId: product._id, quantity: 1 }];
    const customerId = null;
    const paymentStatus = 'PAID';

    let subtotal = 0;
    const validatedItems = [];

    for (let item of items) {
      const prod = await Product.findById(item.productId);
      const itemTotal = prod.sellingPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: prod._id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice: prod.sellingPrice,
        purchaseCost: prod.purchasePrice, // wait, what if purchasePrice is undefined?
        total: itemTotal,
        productDoc: prod
      });
    }

    console.log("Validated Items:", validatedItems);

    const sale = new Sale({
      invoiceNumber: `INV-${Date.now()}`,
      customerId: undefined,
      cashierId: mockUserId,
      channel: 'pos',
      items: validatedItems.map(({ productDoc, ...rest }) => rest),
      subtotal,
      total: subtotal,
      paymentStatus
    });

    const error = sale.validateSync();
    if (error) {
      console.error('Mongoose Validation Error:', error);
    } else {
      console.log('Sale object is valid!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

testCreateSale();
