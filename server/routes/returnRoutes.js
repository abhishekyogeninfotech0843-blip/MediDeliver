const express = require("express");
const {
  createReturnRequest,
  getAllReturnRequests,
  getReturnByBillNumber,
  updateReturnStatus,
} = require("../controllers/returnController");

const router = express.Router();

// Submit return request
router.post("/", createReturnRequest);

// Get all return requests (Admin)
router.get("/", getAllReturnRequests);

// Track return request by Bill Number / Phone
router.get("/track/:billNumber", getReturnByBillNumber);

// Update return request status (Admin)
router.put("/:id/status", updateReturnStatus);

module.exports = router;
