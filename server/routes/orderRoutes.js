const express = require("express");

const {
  createOrder,
  uploadPrescriptionOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const router = express.Router();

// Create Standard Order
router.post("/", createOrder);

// Upload Prescription Order
router.post("/prescription", uploadPrescriptionOrder);

// Get All Orders
router.get("/", getOrders);

// Get Order By ID
router.get("/:id", getOrderById);

// Update Order Status
router.put("/:id/status", updateOrderStatus);

// Cancel Order
router.put("/:id/cancel", cancelOrder);

module.exports = router;
