const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide customer name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide customer email"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      default: "General Inquiry",
      trim: true,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Please enter message content"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "NEW",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
