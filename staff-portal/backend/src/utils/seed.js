const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Customer = require('../models/Customer');
const Category = require('../models/Category');
const Product = require('../models/Product');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/superstore';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Customer.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create Admin and Cashier
    await User.create([
      { email: 'admin@superstore.com', password, role: 'Admin' },
      { email: 'cashier@superstore.com', password, role: 'Cashier' }
    ]);
    console.log('Admin and Cashier seeded');

    // Create Categories
    const categories = await Category.create([
      { name: 'Beverages' },
      { name: 'Dairy' },
      { name: 'Bakery' },
      { name: 'Snacks' }
    ]);
    console.log('Categories seeded');

    // Create Products
    await Product.create([
      {
        name: 'Milk 1L',
        category: categories[1]._id, // Dairy
        purchasePrice: 180,
        sellingPrice: 220,
        stockQuantity: 50,
        minimumStock: 10,
        unit: 'L'
      },
      {
        name: 'Bread',
        category: categories[2]._id, // Bakery
        purchasePrice: 100,
        sellingPrice: 150,
        stockQuantity: 20,
        minimumStock: 5,
        unit: 'pcs'
      },
      {
        name: 'Orange Juice',
        category: categories[0]._id, // Beverages
        purchasePrice: 300,
        sellingPrice: 400,
        stockQuantity: 30,
        minimumStock: 5,
        unit: 'L'
      }
    ]);
    console.log('Products seeded');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
