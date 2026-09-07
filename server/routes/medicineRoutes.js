const express = require("express");

const {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  deleteAllMedicines,
  resetDefaultMedicines,
} = require("../controllers/medicineController");

const router = express.Router();

// Add Medicine
router.post("/", addMedicine);

// Get All Medicines
router.get("/", getMedicines);

// Reset / Seed Default Medicines (Admin tool)
router.post("/reset-default", resetDefaultMedicines);

// Delete All Medicines
router.delete("/all/clear", deleteAllMedicines);
router.delete("/clear-all", deleteAllMedicines);
router.delete("/all", deleteAllMedicines);

// Get Medicine By ID
router.get("/:id", getMedicineById);

// Update Medicine
router.put("/:id", updateMedicine);

// Delete Single Medicine
router.delete("/:id", deleteMedicine);

// Delete All fallback if no ID
router.delete("/", deleteAllMedicines);

module.exports = router;

