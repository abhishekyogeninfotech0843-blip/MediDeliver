const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// ==========================================
// Create Payment
// ==========================================
const createPayment = async (req, res) => {
  try {
    const { order, paymentMethod } = req.body;

    // Check Order
    const orderExists = await Order.findById(order);

    if (!orderExists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check Customer
    const customerExists = await Customer.findById(orderExists.customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check Payment Method
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Check Existing Payment
    const existingPayment = await Payment.findOne({ order });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this order",
        payment: existingPayment,
      });
    }

    // Create Payment
    const payment = await Payment.create({
      order: orderExists._id,
      customer: customerExists._id,
      amount: orderExists.totalAmount,
      paymentMethod,
      paymentStatus: "PENDING",
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate("order")
      .populate("customer");

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Create Razorpay Order
// ==========================================
const createRazorpayOrder = async (req, res) => {
  try {
    const { order } = req.body;

    // Check Order
    const orderExists = await Order.findById(order);

    if (!orderExists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check Customer
    const customerExists = await Customer.findById(orderExists.customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if Order is already paid
    if (orderExists.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order payment is already completed",
      });
    }

    // Check Existing Payment
    const existingPayment = await Payment.findOne({ order });

    if (existingPayment && existingPayment.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this order",
        payment: existingPayment,
      });
    }

    // Amount in Razorpay is in paise
    const amountInPaise = Math.round(orderExists.totalAmount * 100);

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${orderExists._id}`,
      notes: {
        orderId: orderExists._id.toString(),
        customerId: customerExists._id.toString(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",

      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },

      order: {
        id: orderExists._id,
        amount: orderExists.totalAmount,
        customer: customerExists._id,
      },

      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Verify Razorpay Payment
// ==========================================
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      order,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ==========================================
    // Validate Required Fields
    // ==========================================
    if (
      !order ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "All Razorpay payment details are required",
      });
    }

    // ==========================================
    // Check Order
    // ==========================================
    const orderExists = await Order.findById(order);

    if (!orderExists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // Check Customer
    // ==========================================
    const customerExists = await Customer.findById(orderExists.customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // Fetch Razorpay Order
    // ==========================================
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    if (!razorpayOrder) {
      return res.status(404).json({
        success: false,
        message: "Razorpay order not found",
      });
    }

    // ==========================================
    // Verify Razorpay Order Belongs To Our Order
    // ==========================================
    if (razorpayOrder.receipt !== `order_${orderExists._id}`) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order does not belong to this order",
      });
    }

    // ==========================================
    // Check Amount
    // ==========================================
    const expectedAmount = Math.round(orderExists.totalAmount * 100);

    if (Number(razorpayOrder.amount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order amount",
      });
    }

    // ==========================================
    // Verify Signature
    // ==========================================
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature",
      });
    }

    // ==========================================
    // Check Existing Payment
    // ==========================================
    let payment = await Payment.findOne({ order });

    // Payment already verified
    if (payment && payment.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
        payment,
      });
    }

    // ==========================================
    // Create / Update Payment
    // ==========================================
    if (!payment) {
      payment = await Payment.create({
        order: orderExists._id,
        customer: customerExists._id,
        amount: orderExists.totalAmount,
        paymentMethod: "ONLINE",
        paymentStatus: "PAID",
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      });
    } else {
      payment.paymentMethod = "ONLINE";
      payment.paymentStatus = "PAID";
      payment.transactionId = razorpay_payment_id;
      payment.razorpayOrderId = razorpay_order_id;
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.paidAt = new Date();

      await payment.save();
    }

    // ==========================================
    // Update Order Payment Information
    // ==========================================
    orderExists.paymentMethod = "ONLINE";
    orderExists.paymentStatus = "PAID";

    await orderExists.save();

    // ==========================================
    // Populate Payment
    // ==========================================
    const populatedPayment = await Payment.findById(payment._id)
      .populate("order")
      .populate("customer");

    // ==========================================
    // Success Response
    // ==========================================
    res.status(200).json({
      success: true,
      message: "Razorpay payment verified successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    console.error("Razorpay Payment Verification Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Payments
// ==========================================
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("order")
      .populate("customer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get Payments Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Payment By ID
// ==========================================
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("order")
      .populate("customer");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Payment Status
// ==========================================
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    const allowedStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

    // Validate Status
    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    // Find Payment
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Prevent changing refunded payment
    if (payment.paymentStatus === "REFUNDED") {
      return res.status(400).json({
        success: false,
        message: "Refunded payment status cannot be changed",
      });
    }

    payment.paymentStatus = paymentStatus;

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    if (paymentStatus === "PAID") {
      payment.paidAt = new Date();
    }

    await payment.save();

    // ==========================================
    // Update Order Payment Information
    // ==========================================

    const orderPaymentStatus =
      paymentStatus === "PAID"
        ? "PAID"
        : paymentStatus === "FAILED"
          ? "FAILED"
          : "PENDING";

    const orderUpdate = {
      paymentStatus: orderPaymentStatus,
    };

    // If payment is ONLINE
    if (payment.paymentMethod === "ONLINE") {
      orderUpdate.paymentMethod = "ONLINE";
    }

    // If payment is COD
    if (payment.paymentMethod === "COD") {
      orderUpdate.paymentMethod = "COD";
    }

    await Order.findByIdAndUpdate(payment.order, orderUpdate);

    // ==========================================
    // Populate Payment
    // ==========================================

    const populatedPayment = await Payment.findById(payment._id)
      .populate("order")
      .populate("customer");

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================
module.exports = {
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
};
