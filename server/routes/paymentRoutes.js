const express = require("express");

const {
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
} = require("../controllers/paymentController");

const router = express.Router();

// ==========================================
// Create Payment
// ==========================================
router.post("/", createPayment);

// ==========================================
// Create Razorpay Order (supports both endpoint formats)
// ==========================================
router.post("/razorpay/order", createRazorpayOrder);
router.post("/create-razorpay-order", createRazorpayOrder);

// ==========================================
// Verify Razorpay Payment (supports both endpoint formats)
// ==========================================
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/verify-razorpay-payment", verifyRazorpayPayment);

// ==========================================
// Get All Payments
// ==========================================
router.get("/", getPayments);

// ==========================================
// Get Payment By ID
// ==========================================
router.get("/:id", getPaymentById);

// ==========================================
// Update Payment Status
// ==========================================
router.put("/:id/status", updatePaymentStatus);

module.exports = router;
