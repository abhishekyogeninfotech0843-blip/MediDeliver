const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: [true, "Bill Number / Order ID is required"],
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer Name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer Phone number is required"],
      trim: true,
    },
    medicineName: {
      type: String,
      default: "",
      trim: true,
    },
    returnReason: {
      type: String,
      required: [true, "Return Reason is required"],
      enum: [
        "Wrong Medicine Delivered",
        "Damaged / Expired Product",
        "Package Tampered",
        "Ordered by Mistake",
        "Other Issue"
      ],
    },
    explanation: {
      type: String,
      required: [true, "Detailed explanation of the issue is required"],
      trim: true,
    },
    proofImage: {
      type: String,
      required: [true, "Proof image showing the medicine fault is required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "REFUNDED"],
      default: "PENDING",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
