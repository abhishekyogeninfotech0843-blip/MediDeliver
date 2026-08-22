const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ==========================================
    // Order
    // ==========================================
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    // ==========================================
    // Customer
    // ==========================================
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // ==========================================
    // Amount
    // ==========================================
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // Payment Method
    // ==========================================
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    // ==========================================
    // Payment Status
    // ==========================================
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    // ==========================================
    // General Transaction ID
    // ==========================================
    transactionId: {
      type: String,
      default: null,
    },

    // ==========================================
    // Razorpay Order ID
    // ==========================================
    razorpayOrderId: {
      type: String,
      default: null,
    },

    // ==========================================
    // Razorpay Payment ID
    // ==========================================
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // ==========================================
    // Razorpay Signature
    // ==========================================
    razorpaySignature: {
      type: String,
      default: null,
    },

    // ==========================================
    // Paid At
    // ==========================================
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
