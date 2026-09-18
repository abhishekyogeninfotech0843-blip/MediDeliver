const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

// Stats
router.get("/stats", supplierController.getSupplierStats);

// Supplier CRUD
router.get("/", supplierController.getSuppliers);
router.post("/", supplierController.createSupplier);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

// Supplies / Inward Stock Invoices & Payments
router.get("/supplies/list", supplierController.getSupplies);
router.post("/supplies", supplierController.createSupply);
router.post("/supplies/:supplyId/payment", supplierController.recordSupplyPayment);
router.delete("/supplies/:id", supplierController.deleteSupply);

module.exports = router;
