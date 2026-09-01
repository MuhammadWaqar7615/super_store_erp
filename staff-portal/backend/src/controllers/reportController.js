const Sale = require('../models/Sale');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Product = require('../models/Product');

const getDashboardMetrics = async (req, res) => {
  try {
    // 1. Sales & Orders Aggregation
    const salesData = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          totalCOGS: {
            $sum: {
              $sum: {
                $map: {
                  input: "$items",
                  as: "item",
                  in: { $multiply: ["$$item.quantity", "$$item.purchaseCost"] }
                }
              }
            }
          }
        }
      }
    ]);

    const totalSales = salesData.length > 0 ? salesData[0].totalRevenue : 0;
    const totalOrders = salesData.length > 0 ? salesData[0].totalOrders : 0;
    const totalCOGS = salesData.length > 0 ? salesData[0].totalCOGS : 0;

    // 2. Products Count
    const totalProducts = await Product.countDocuments();

    // 3. Income & Expenses Aggregation
    const incomeData = await Income.aggregate([
      { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
    ]);
    const totalIncome = incomeData.length > 0 ? incomeData[0].totalIncome : 0;

    const expenseData = await Expense.aggregate([
      { $group: { _id: null, totalExpenses: { $sum: "$amount" } } }
    ]);
    const totalExpenses = expenseData.length > 0 ? expenseData[0].totalExpenses : 0;

    // 4. Net Profit Calculation
    const netProfit = totalSales - totalCOGS - totalExpenses;

    // 5. Recent Activity (Latest 5 Sales)
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name')
      .populate('cashierId', 'name');

    // 6. Low Stock Products
    const lowStockProducts = await Product.find({
      $expr: {
        $or: [
          { $lte: ["$stockQuantity", "$minimumStock"] },
          { $eq: ["$stockQuantity", 0] }
        ]
      }
    }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalSales,
          totalOrders,
          totalProducts,
          totalIncome,
          totalExpenses,
          totalCOGS,
          netProfit
        },
        recentSales,
        lowStockProducts
      }
    });

  } catch (error) {
    console.error('Dashboard Metrics Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching metrics' });
  }
};

const getCashierDashboardMetrics = async (req, res) => {
  try {
    const cashierId = req.user._id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Sales & Orders Aggregation for Cashier (Today)
    const salesData = await Sale.aggregate([
      { 
        $match: { 
          cashierId: cashierId,
          createdAt: { $gte: today } 
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          itemsSold: {
             $sum: { $sum: "$items.quantity" }
          }
        }
      }
    ]);

    const totalSales = salesData.length > 0 ? salesData[0].totalRevenue : 0;
    const totalOrders = salesData.length > 0 ? salesData[0].totalOrders : 0;
    const itemsSold = salesData.length > 0 ? salesData[0].itemsSold : 0;

    // 2. Recent Activity (Latest 5 Sales by Cashier)
    const recentSales = await Sale.find({ cashierId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name')
      .populate('cashierId', 'name');

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalSales,
          totalOrders,
          itemsSold
        },
        recentSales
      }
    });

  } catch (error) {
    console.error('Cashier Dashboard Metrics Error:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching cashier metrics' });
  }
};

module.exports = {
  getDashboardMetrics,
  getCashierDashboardMetrics
};
