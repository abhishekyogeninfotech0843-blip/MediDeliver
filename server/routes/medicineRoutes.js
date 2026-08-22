const express = require("express");

const {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

const router = express.Router();

// Add Medicine
router.post("/", addMedicine);

// Get All Medicines
router.get("/", getMedicines);

// Get Medicine By ID
router.get("/:id", getMedicineById);

// Update Medicine
router.put("/:id", updateMedicine);

// Delete Medicine
router.delete("/:id", deleteMedicine);

module.exports = router;
