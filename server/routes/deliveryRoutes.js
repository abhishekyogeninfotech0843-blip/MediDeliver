const express = require("express");

const {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
} = require("../controllers/deliveryController");

const router = express.Router();

// Create Delivery
router.post("/", createDelivery);

// Get All Deliveries
router.get("/", getDeliveries);

// Get Delivery By ID
router.get("/:id", getDeliveryById);

// Update Delivery Status
router.put("/:id/status", updateDeliveryStatus);

module.exports = router;
