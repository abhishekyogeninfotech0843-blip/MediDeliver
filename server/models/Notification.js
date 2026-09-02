const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "ORDER_CONFIRMED",
        "ORDER_PACKED",
        "OUT_FOR_DELIVERY",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "PAYMENT_SUCCESS",
        "PAYMENT_PENDING",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
