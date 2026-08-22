const express = require("express");

const {
  createNotification,
  getNotifications,
  getCustomerNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// Create Notification
router.post("/", createNotification);

// Get All Notifications
router.get("/", getNotifications);

// Get Customer Notifications
router.get("/customer/:customerId", getCustomerNotifications);

// Mark Notification As Read
router.put("/:id/read", markNotificationAsRead);

module.exports = router;
