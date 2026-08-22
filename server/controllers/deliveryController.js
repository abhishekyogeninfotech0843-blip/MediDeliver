const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

// ==========================================
// Create Delivery
// ==========================================
const createDelivery = async (req, res) => {
  try {
    const { order, deliveryPartner, estimatedDelivery } = req.body;

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

    // Check existing delivery
    const existingDelivery = await Delivery.findOne({ order });

    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: "Delivery already exists for this order",
        delivery: existingDelivery,
      });
    }

    // Generate Tracking ID
    const trackingId = `MD-DEL-${Date.now()}`;

    // Create Delivery
    const delivery = await Delivery.create({
      order: orderExists._id,
      customer: customerExists._id,
      deliveryPartner,
      trackingId,
      estimatedDelivery,
    });

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate("order")
      .populate("customer");

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      delivery: populatedDelivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Deliveries
// ==========================================
const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("order")
      .populate("customer")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Delivery By ID
// ==========================================
const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id)
      .populate("order")
      .populate("customer");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Delivery Status
// ==========================================
const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const allowedStatuses = [
      "PENDING",
      "PACKED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    // Validate status
    if (!allowedStatuses.includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status",
      });
    }

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    // Prevent changing delivered delivery
    if (delivery.deliveryStatus === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Delivered delivery status cannot be changed",
      });
    }

    delivery.deliveryStatus = deliveryStatus;

    // Pickup time
    if (deliveryStatus === "OUT_FOR_DELIVERY") {
      delivery.pickedUpAt = new Date();
    }

    // Delivered time
    if (deliveryStatus === "DELIVERED") {
      delivery.deliveredAt = new Date();
    }

    await delivery.save();

    // Sync Order Status
    let orderStatus = null;

    if (deliveryStatus === "PACKED") {
      orderStatus = "CONFIRMED";
    }

    if (deliveryStatus === "OUT_FOR_DELIVERY") {
      orderStatus = "OUT_FOR_DELIVERY";
    }

    if (deliveryStatus === "DELIVERED") {
      orderStatus = "DELIVERED";
    }

    if (deliveryStatus === "CANCELLED") {
      orderStatus = "CANCELLED";
    }

    if (orderStatus) {
      await Order.findByIdAndUpdate(delivery.order, {
        orderStatus,
      });
    }

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate("order")
      .populate("customer");

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      delivery: populatedDelivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
};
