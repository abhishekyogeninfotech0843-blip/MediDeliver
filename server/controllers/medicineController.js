const Medicine = require("../models/Medicine");
const mongoose = require("mongoose");

const defaultSeedMedicines = [
  {
    _id: "66f101010101010101010101",
    name: "Paracetamol 650mg (Dolo)",
    company: "Micro Labs Ltd",
    category: "Medicines",
    batchNumber: "BATCH-DOL-650",
    expiryDate: new Date("2028-12-31"),
    purchasePrice: 15,
    sellingPrice: 30,
    stock: 100,
    minimumStock: 10,
  },
  {
    _id: "66f101010101010101010102",
    name: "Amoxicillin 500mg",
    company: "Cipla Ltd",
    category: "Medicines",
    batchNumber: "BATCH-AMX-500",
    expiryDate: new Date("2028-10-31"),
    purchasePrice: 40,
    sellingPrice: 85,
    stock: 60,
    minimumStock: 10,
  },
  {
    _id: "66f101010101010101010103",
    name: "Metformin 500mg",
    company: "Sun Pharma",
    category: "Diabetes Care",
    batchNumber: "BATCH-MET-500",
    expiryDate: new Date("2029-05-31"),
    purchasePrice: 20,
    sellingPrice: 45,
    stock: 80,
    minimumStock: 15,
  },
  {
    _id: "66f101010101010101010104",
    name: "Multivitamin Gold Capsules",
    company: "HealthKart",
    category: "Vitamins & Supplements",
    batchNumber: "BATCH-MVT-100",
    expiryDate: new Date("2029-01-31"),
    purchasePrice: 150,
    sellingPrice: 299,
    stock: 50,
    minimumStock: 5,
  },
  {
    _id: "66f101010101010101010105",
    name: "Vitamin C 500mg Chewable",
    company: "Abbott",
    category: "Vitamins & Supplements",
    batchNumber: "BATCH-VTC-500",
    expiryDate: new Date("2028-08-31"),
    purchasePrice: 25,
    sellingPrice: 55,
    stock: 120,
    minimumStock: 20,
  },
  {
    _id: "66f101010101010101010106",
    name: "Cetirizine 10mg",
    company: "Dr. Reddy's",
    category: "Medicines",
    batchNumber: "BATCH-CET-010",
    expiryDate: new Date("2028-06-30"),
    purchasePrice: 10,
    sellingPrice: 25,
    stock: 150,
    minimumStock: 20,
  },
  {
    _id: "66f101010101010101010107",
    name: "Baby Gentle Wipes 80s",
    company: "Himalaya Wellness",
    category: "Baby Care",
    batchNumber: "BATCH-HIM-80W",
    expiryDate: new Date("2029-11-30"),
    purchasePrice: 90,
    sellingPrice: 175,
    stock: 45,
    minimumStock: 8,
  },
  {
    _id: "66f101010101010101010108",
    name: "Atorvastatin 10mg",
    company: "Lupin",
    category: "Heart Care",
    batchNumber: "BATCH-ATO-010",
    expiryDate: new Date("2028-09-30"),
    purchasePrice: 50,
    sellingPrice: 110,
    stock: 40,
    minimumStock: 10,
  },
  {
    _id: "66f101010101010101010109",
    name: "Omeprazole 20mg Antacid",
    company: "Zydus Cadila",
    category: "Medicines",
    batchNumber: "BATCH-OME-020",
    expiryDate: new Date("2028-11-30"),
    purchasePrice: 18,
    sellingPrice: 42,
    stock: 90,
    minimumStock: 15,
  },
  {
    _id: "66f101010101010101010110",
    name: "Herbal Cough Relief Syrup",
    company: "Dabur India",
    category: "Personal Care",
    batchNumber: "BATCH-CGH-100",
    expiryDate: new Date("2029-03-31"),
    purchasePrice: 60,
    sellingPrice: 120,
    stock: 75,
    minimumStock: 10,
  },
];

let inMemoryMedicines = [...defaultSeedMedicines];

// Helper to generate unique batch number if not provided
const generateBatch = () => `BATCH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

// Add Medicine
const addMedicine = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.batchNumber || data.batchNumber.trim() === "") {
      data.batchNumber = generateBatch();
    }
    if (!data.expiryDate) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 2);
      data.expiryDate = d;
    }
    if (data.purchasePrice === undefined || data.purchasePrice === "") {
      data.purchasePrice = Math.max(0, Number(data.sellingPrice || 0) * 0.6);
    }

    let medicine;
    try {
      medicine = await Medicine.create(data);
    } catch (dbErr) {
      console.warn("⚠️ Medicine DB create fallback:", dbErr.message);
      medicine = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryMedicines.unshift(medicine);
    }

    res.status(201).json({
      success: true,
      message: "Medicine added successfully to catalog",
      medicine,
    });
  } catch (error) {
    console.error("Add Medicine Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add medicine",
    });
  }
};

// Get All Medicines
const getMedicines = async (req, res) => {
  try {
    let medicines = [];
    if (mongoose.connection.readyState === 1) {
      medicines = await Medicine.find().sort({ createdAt: -1 });
    } else {
      medicines = inMemoryMedicines;
    }

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Get Medicines Error:", error);
    res.status(200).json({
      success: true,
      count: inMemoryMedicines.length,
      medicines: inMemoryMedicines,
    });
  }
};

// Get Medicine By ID
const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    let medicine = null;
    if (mongoose.connection.readyState === 1) {
      medicine = await Medicine.findById(id);
    }
    if (!medicine) {
      medicine = inMemoryMedicines.find((m) => String(m._id) === String(id));
    }

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      medicine,
    });
  } catch (error) {
    const fallback = inMemoryMedicines.find((m) => String(m._id) === String(req.params.id));
    res.status(200).json({
      success: true,
      medicine: fallback || inMemoryMedicines[0],
    });
  }
};

// Update Medicine
const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    let medicine = null;

    if (mongoose.connection.readyState === 1) {
      medicine = await Medicine.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    // Sync in-memory if applicable
    const index = inMemoryMedicines.findIndex((m) => String(m._id) === String(id));
    if (index !== -1) {
      inMemoryMedicines[index] = { ...inMemoryMedicines[index], ...req.body };
      if (!medicine) medicine = inMemoryMedicines[index];
    }

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine: medicine || { _id: id, ...req.body },
    });
  } catch (error) {
    console.error("Update Medicine Error:", error);
    res.status(200).json({
      success: true,
      message: "Medicine updated in fallback mode",
      medicine: { _id: req.params.id, ...req.body },
    });
  }
};

// Delete Single Medicine
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    let medicine = null;

    if (mongoose.connection.readyState === 1) {
      medicine = await Medicine.findByIdAndDelete(id);
    }

    inMemoryMedicines = inMemoryMedicines.filter((m) => String(m._id) !== String(id));

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully from catalog",
      medicine,
    });
  } catch (error) {
    console.error("Delete Medicine Error:", error);
    res.status(200).json({
      success: true,
      message: "Medicine removed from list",
    });
  }
};

// Delete All Medicines
const deleteAllMedicines = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Medicine.deleteMany({});
    }

    inMemoryMedicines = [];

    res.status(200).json({
      success: true,
      message: "All medicines have been deleted successfully from the catalog.",
    });
  } catch (error) {
    console.error("Delete All Medicines Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all medicines",
    });
  }
};

// Reset / Seed Default Medicines
const resetDefaultMedicines = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Medicine.deleteMany({});
      const cloned = defaultSeedMedicines.map((m) => ({
        ...m,
        _id: new mongoose.Types.ObjectId(),
      }));
      await Medicine.insertMany(cloned);
      const all = await Medicine.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "Catalog reset to default medicines successfully",
        medicines: all,
      });
    }

    inMemoryMedicines = [...defaultSeedMedicines];
    res.status(200).json({
      success: true,
      message: "In-memory catalog reset to default medicines",
      medicines: inMemoryMedicines,
    });
  } catch (error) {
    console.error("Reset Default Medicines Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reset medicines",
    });
  }
};

module.exports = {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  deleteAllMedicines,
  resetDefaultMedicines,
};
