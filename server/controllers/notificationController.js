const Notification = require("../models/Notification");
const Customer = require("../models/Customer");

// Create Notification
const createNotification = async (req, res) => {
  try {
    const { customer, order, type, title, message } = req.body;

    // Check Customer
    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Create Notification
    const notification = await Notification.create({
      customer,
      order: order || null,
      type,
      title,
      message,
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate("customer")
      .populate("order");

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: populatedNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("customer")
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Notifications By Customer
const getCustomerNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;

    const notifications = await Notification.find({
      customer: customerId,
    })
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark Notification As Read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        isRead: true,
      },
      {
        new: true,
      },
    )
      .populate("customer")
      .populate("order");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getCustomerNotifications,
  markNotificationAsRead,
};
