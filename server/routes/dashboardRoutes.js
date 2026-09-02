const express = require("express");

const {
  getDashboardStats,
  getRecentOrders,
  getTopSellingMedicines,
  getLowStockMedicines,
  getRecentPayments,
  getOrderStatusSummary,
  getSalesSummary,
  getAllDashboardDetails,
} = require("../controllers/dashboardController");

const router = express.Router();

// Dashboard Stats
router.get("/", getDashboardStats);

// All Dashboard Details with Date Filter
router.get("/all-details", getAllDashboardDetails);

// Recent Orders
router.get("/recent-orders", getRecentOrders);

// Top Selling Medicines
router.get("/top-selling", getTopSellingMedicines);

// Low Stock Medicines
router.get("/low-stock", getLowStockMedicines);

// Recent Payments
router.get("/recent-payments", getRecentPayments);

// Order Status Summary
router.get("/order-status", getOrderStatusSummary);

// Sales Summary
router.get("/sales-summary", getSalesSummary);

module.exports = router;
