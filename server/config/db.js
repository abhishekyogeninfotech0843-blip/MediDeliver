const mongoose = require("mongoose");

let isConnected = false;

const seedInitialData = async () => {
  try {
    const Medicine = require("../models/Medicine");
    const Customer = require("../models/Customer");

    const count = await Medicine.countDocuments();
    if (count === 0) {
      console.log("🌱 Database is empty. Seeding initial medicines...");
      const sampleMedicines = [
        {
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
      ];

      await Medicine.insertMany(sampleMedicines);
      console.log("✅ Initial medicines seeded successfully!");
    }

    // Ensure default customer exists for guest checkouts
    const defaultCustomerId = "6a856810a35113391007d0cb";
    const existingDefaultCust = await Customer.findById(defaultCustomerId);
    if (!existingDefaultCust) {
      await Customer.create({
        _id: defaultCustomerId,
        name: "Guest Customer",
        phone: "9876543210",
        email: "guest@medideliver.com",
        address: "123 Main Street, Central City",
        city: "Mumbai",
        pincode: "400001",
      });
      console.log("✅ Default guest customer created!");
    }
  } catch (err) {
    console.error("⚠️ Seeding Error:", err.message);
  }
};

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log("✅ MongoDB Connected Successfully");

    await seedInitialData();
  } catch (error) {
    console.warn("⚠️ MongoDB Connection Warning:", error.message);
    console.warn("ℹ️ Server running in standby mode. Will auto-retry DB connection when network/whitelist is ready.");

    // Retry connection periodically without exiting process
    setTimeout(() => {
      connectDB();
    }, 15000);
  }
};

module.exports = connectDB;
