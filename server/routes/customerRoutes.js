const express = require("express");

const {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();

// Add Customer
router.post("/", addCustomer);

// Get All Customers
router.get("/", getCustomers);

// Get Customer By ID
router.get("/:id", getCustomerById);

// Update Customer
router.put("/:id", updateCustomer);

// Delete Customer
router.delete("/:id", deleteCustomer);

module.exports = router;
