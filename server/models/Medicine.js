const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    batchNumber: {
      type: String,
      default: () => `BATCH-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      trim: true,
    },

    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
    },

    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 10,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Medicine", medicineSchema);
