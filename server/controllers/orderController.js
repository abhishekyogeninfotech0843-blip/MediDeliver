const mongoose = require("mongoose");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Medicine = require("../models/Medicine");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");

// ==========================================
// Create Order
// ==========================================
const createOrder = async (req, res) => {
  try {
    const { customer, items, deliveryAddress, paymentMethod, customerName, customerPhone, customerEmail } = req.body;

    // ==========================================
    // Validate Required Fields
    // ==========================================

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
    // Check or Auto-Create Customer
    // ==========================================

    let finalName = customerName || "";
    let finalPhone = customerPhone || "";
    let finalEmail = customerEmail || "";

    // Extract name/phone from deliveryAddress if not provided separately
    if (!finalName && deliveryAddress) {
      const parts = deliveryAddress.split(",");
      if (parts.length > 0) finalName = parts[0].trim();
    }

    let customerExists = null;
    if (customer && mongoose.Types.ObjectId.isValid(customer)) {
      try {
        customerExists = await Customer.findById(customer);
      } catch (e) {
        customerExists = null;
      }
    }

    if (!customerExists && finalEmail) {
      customerExists = await Customer.findOne({ email: finalEmail.toLowerCase().trim() });
    }

    if (!customerExists && !finalEmail && finalPhone) {
      customerExists = await Customer.findOne({ phone: finalPhone });
    }

    if (customerExists) {
      if (finalName && (!customerExists.name || customerExists.name === "Pharmacy Customer")) {
        customerExists.name = finalName;
        await customerExists.save();
      }
    } else {
      try {
        customerExists = await Customer.create({
          name: finalName || "Pharmacy Customer",
          phone: finalPhone || `98${Math.floor(10000000 + Math.random() * 90000000)}`,
          email: finalEmail || "",
          address: deliveryAddress.trim(),
        });
      } catch (err) {
        if (finalPhone) {
          customerExists = await Customer.findOne({ phone: finalPhone });
        }
      }
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
      customer: customerExists?._id,
      customerName: finalName || customerExists?.name || "Customer",
      customerPhone: finalPhone || customerExists?.phone || "",
      customerEmail: finalEmail || customerExists?.email || "",
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      trackingId: `TRK-${(finalName ? finalName.slice(0, 3).toUpperCase() : "MED")}-${Math.floor(100000 + Math.random() * 900000)}`,
      deliveryPartner: {
        name: "Ramesh Sharma (MediDeliver Express Partner)",
        phone: "+91 98765 43210",
        vehicle: "Electric Bike (UP 81 AB 4920)",
      },
      estimatedDeliveryTime: "30-45 mins",
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

// Helper to ensure tracking info on existing/legacy orders
const enrichOrderData = (ord) => {
  if (!ord) return ord;
  const obj = ord.toObject ? ord.toObject() : { ...ord };
  if (!obj.trackingId) {
    obj.trackingId = `TRK-${(obj._id || "").toString().slice(-6).toUpperCase()}`;
  }
  if (!obj.deliveryPartner || !obj.deliveryPartner.name) {
    obj.deliveryPartner = {
      name: "Ramesh Sharma (MediDeliver Express Partner)",
      phone: "+91 98765 43210",
      vehicle: "Electric Bike (UP 81 AB 4920)",
    };
  }
  if (!obj.estimatedDeliveryTime) {
    obj.estimatedDeliveryTime = "30-45 mins";
  }
  return obj;
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

    const enrichedOrders = orders.map(enrichOrderData);

    res.status(200).json({
      success: true,
      count: enrichedOrders.length,
      orders: enrichedOrders,
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
      order: enrichOrderData(order),
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
    const { orderStatus, deliveryPartner, estimatedDeliveryTime } = req.body;

    // ==========================================
    // Allowed Statuses
    // ==========================================

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "PACKED",
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

    // Update Status
    order.orderStatus = orderStatus;

    // Update Stage Timestamps
    const now = new Date();
    if (orderStatus === "CONFIRMED") {
      if (!order.confirmedAt) order.confirmedAt = now;
    } else if (orderStatus === "PACKED") {
      if (!order.confirmedAt) order.confirmedAt = now;
      if (!order.packedAt) order.packedAt = now;
    } else if (orderStatus === "OUT_FOR_DELIVERY") {
      if (!order.confirmedAt) order.confirmedAt = now;
      if (!order.packedAt) order.packedAt = now;
      if (!order.outForDeliveryAt) order.outForDeliveryAt = now;
    } else if (orderStatus === "DELIVERED") {
      if (!order.confirmedAt) order.confirmedAt = now;
      if (!order.packedAt) order.packedAt = now;
      if (!order.outForDeliveryAt) order.outForDeliveryAt = now;
      if (!order.deliveredAt) order.deliveredAt = now;
    }

    if (deliveryPartner) {
      order.deliveryPartner = {
        name: deliveryPartner.name || order.deliveryPartner?.name || "Ramesh Sharma",
        phone: deliveryPartner.phone || order.deliveryPartner?.phone || "+91 98765 43210",
        vehicle: deliveryPartner.vehicle || order.deliveryPartner?.vehicle || "Electric Bike (UP 81 AB 4920)",
      };
    }

    if (estimatedDeliveryTime) {
      order.estimatedDeliveryTime = estimatedDeliveryTime;
    }

    // Auto mark payment status as PAID if delivered and sync Payment document
    if (orderStatus === "DELIVERED") {
      order.paymentStatus = "PAID";
      try {
        let paymentDoc = await Payment.findOne({ order: order._id });
        if (paymentDoc) {
          paymentDoc.paymentStatus = "PAID";
          if (!paymentDoc.paidAt) paymentDoc.paidAt = new Date();
          await paymentDoc.save();
        } else if (order.customer) {
          await Payment.create({
            order: order._id,
            customer: order.customer,
            amount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: "PAID",
            paidAt: new Date(),
            transactionId: `TXN-${order._id.toString().slice(-6).toUpperCase()}`,
          });
        }
      } catch (pErr) {
        console.warn("Payment sync error:", pErr.message);
      }
    }

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
        title = "Order Confirmed by Admin";
        message = "Your medicine order has been verified and confirmed by pharmacy admin.";
        break;

      case "PACKED":
        notificationType = "ORDER_PACKED";
        title = "Order Packed & Ready";
        message = "Your medicines have been safely packed and prepared for delivery dispatch.";
        break;

      case "OUT_FOR_DELIVERY":
        notificationType = "OUT_FOR_DELIVERY";
        title = "Order Out For Delivery";
        message = `Your medicine order is out for delivery with ${order.deliveryPartner?.name || "our delivery partner"}.`;
        break;

      case "DELIVERED":
        notificationType = "ORDER_DELIVERED";
        title = "Order Delivered Successfully";
        message = "Your medicine order has been delivered successfully. Thank you!";
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
      order: enrichOrderData(populatedOrder),
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
