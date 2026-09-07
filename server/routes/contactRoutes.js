const express = require("express");
const router = express.Router();
const {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contactController");

// Public route to submit inquiry
router.post("/", createContactMessage);

// Admin routes
router.get("/", getAllContactMessages);
router.put("/:id/status", updateContactMessageStatus);
router.delete("/:id", deleteContactMessage);

module.exports = router;
