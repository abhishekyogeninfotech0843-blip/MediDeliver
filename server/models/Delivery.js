const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    deliveryPartner: {
      name: {
        type: String,
        default: null,
      },

      phone: {
        type: String,
        default: null,
      },
    },

    trackingId: {
      type: String,
      required: true,
      unique: true,
    },

    deliveryStatus: {
      type: String,
      enum: ["PENDING", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    estimatedDelivery: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Delivery", deliverySchema);
