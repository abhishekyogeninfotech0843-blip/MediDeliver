const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Medicine = require("../models/Medicine");
const Notification = require("../models/Notification");

// ==========================================
// Create Order
// ==========================================
const createOrder = async (req, res) => {
  try {
    const { customer, items, deliveryAddress, paymentMethod } = req.body;

    // ==========================================
    // Validate Required Fields
    // ==========================================

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    // ==========================================
    // Validate Payment Method
    // ==========================================

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Use COD or ONLINE",
      });
    }

    // ==========================================
    // Check Customer
    // ==========================================

    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // Check Items
    // ==========================================

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one medicine",
      });
    }

    // ==========================================
    // Calculate Order Total
    // ==========================================

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.medicine) {
        return res.status(400).json({
          success: false,
          message: "Medicine ID is required",
        });
      }

      // Find Medicine
      const medicine = await Medicine.findById(item.medicine);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicine}`,
        });
      }

      // Validate Quantity
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${medicine.name}`,
        });
      }

      // Check Stock
      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available stock: ${medicine.stock}`,
        });
      }

      // Calculate Item Total
      const price = Number(medicine.sellingPrice);
      const total = price * item.quantity;

      totalAmount += total;

      orderItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price,
        total,
      });
    }

    // ==========================================
    // Create Order
    // ==========================================

    const order = await Order.create({
      customer: customerExists._id,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });

    // ==========================================
    // Reduce Medicine Stock
    // ==========================================

    for (const item of items) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // ==========================================
    // Create Order Notification
    // ==========================================

    await Notification.create({
      customer: customerExists._id,
      order: order._id,
      type: "ORDER_PLACED",
      title: "Order Placed Successfully",
      message: `Hi ${customerExists.name}, your medicine order has been placed successfully.`,
    });

    // ==========================================
    // Populate Order
    // ==========================================

    const populatedOrder = await Order.findById(order._id)
      .populate("customer")
      .populate("items.medicine");

    // ==========================================
    // Response
    // ==========================================

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Orders
// ==========================================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("items.medicine")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Order By ID
// ==========================================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("customer")
      .populate("items.medicine");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Order Status
// ==========================================
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    // ==========================================
    // Allowed Statuses
    // ==========================================

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // ==========================================
    // Find Order
    // ==========================================

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // Prevent Changes
    // ==========================================

    if (order.orderStatus === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Delivered order status cannot be changed",
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order status cannot be changed",
      });
    }

    // ==========================================
    // Valid Status Flow
    // ==========================================

    const validTransitions = {
      PLACED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["OUT_FOR_DELIVERY", "CANCELLED"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
    };

    const currentStatus = order.orderStatus;

    if (
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${currentStatus} to ${orderStatus}`,
      });
    }

    // ==========================================
    // Update Status
    // ==========================================

    order.orderStatus = orderStatus;

    await order.save();

    // ==========================================
    // Notification Data
    // ==========================================

    let notificationType;
    let title;
    let message;

    switch (orderStatus) {
      case "CONFIRMED":
        notificationType = "ORDER_CONFIRMED";
        title = "Order Confirmed";
        message = "Your medicine order has been confirmed successfully.";
        break;

      case "OUT_FOR_DELIVERY":
        notificationType = "OUT_FOR_DELIVERY";
        title = "Order Out For Delivery";
        message = "Your medicine order is out for delivery.";
        break;

      case "DELIVERED":
        notificationType = "ORDER_DELIVERED";
        title = "Order Delivered";
        message = "Your medicine order has been delivered successfully.";
        break;

      case "CANCELLED":
        notificationType = "ORDER_CANCELLED";
        title = "Order Cancelled";
        message = "Your medicine order has been cancelled.";
        break;

      default:
        notificationType = null;
    }

    // ==========================================
    // Create Notification
    // ==========================================

    if (notificationType) {
      await Notification.create({
        customer: order.customer,
        order: order._id,
        type: notificationType,
        title,
        message,
      });
    }

    // ==========================================
    // Populate Order
    // ==========================================

    const populatedOrder = await Order.findById(order._id)
      .populate("customer")
      .populate("items.medicine");

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Cancel Order
// ==========================================
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // Find Order
    // ==========================================

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // Check Order Status
    // ==========================================

    if (
      order.orderStatus === "DELIVERED" ||
      order.orderStatus === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is ${order.orderStatus}`,
      });
    }

    // ==========================================
    // Cancel Order
    // ==========================================

    order.orderStatus = "CANCELLED";

    await order.save();

    // ==========================================
    // Restore Medicine Stock
    // ==========================================

    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: {
          stock: item.quantity,
        },
      });
    }

    // ==========================================
    // Create Cancellation Notification
    // ==========================================

    await Notification.create({
      customer: order.customer,
      order: order._id,
      type: "ORDER_CANCELLED",
      title: "Order Cancelled",
      message: "Your medicine order has been cancelled successfully.",
    });

    // ==========================================
    // Populate Order
    // ==========================================

    const populatedOrder = await Order.findById(order._id)
      .populate("customer")
      .populate("items.medicine");

    // ==========================================
    // Response
    // ==========================================

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

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
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
