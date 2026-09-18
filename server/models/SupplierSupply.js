const mongoose = require("mongoose");

const medicineBatchItemSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: [true, "Medicine name is required"],
    trim: true,
  },
  companyBrand: {
    type: String,
    trim: true,
    default: "",
  },
  category: {
    type: String,
    default: "General",
  },
  batchNumber: {
    type: String,
    trim: true,
    default: "BATCH-001",
  },
  manufacturingDate: {
    type: String,
    default: "",
  },
  expiryDate: {
    type: String,
    required: [true, "Expiry date is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  unitCost: {
    type: Number,
    required: [true, "Unit purchase cost is required"],
    min: [0, "Unit cost cannot be negative"],
  },
  mrp: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    default: 0,
  },
});

const paymentRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["BANK_TRANSFER", "UPI", "CHEQUE", "CASH", "ONLINE"],
    default: "BANK_TRANSFER",
  },
  refNumber: {
    type: String,
    default: "",
  },
  notes: {
    type: String,
    default: "",
  },
});

const supplierSupplySchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    supplierName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      default: "",
    },
    invoiceNumber: {
      type: String,
      required: [true, "Purchase invoice number is required"],
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    medicines: [medicineBatchItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID"],
      default: "UNPAID",
    },
    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "UPI", "CHEQUE", "CASH", "CREDIT"],
      default: "BANK_TRANSFER",
    },
    paymentHistory: [paymentRecordSchema],
    deliveryStatus: {
      type: String,
      enum: ["RECEIVED", "IN_TRANSIT", "ORDERED", "RETURNED"],
      default: "RECEIVED",
    },
    receivedBy: {
      type: String,
      default: "Admin",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totals and due balance
supplierSupplySchema.pre("save", function (next) {
  if (this.medicines && this.medicines.length > 0) {
    const subtotal = this.medicines.reduce((sum, item) => {
      item.totalCost = Number((item.quantity * item.unitCost).toFixed(2));
      return sum + item.totalCost;
    }, 0);
    this.totalAmount = Number(subtotal.toFixed(2));
  }
  const tax = Number(this.taxAmount || 0);
  const discount = Number(this.discountAmount || 0);
  this.grandTotal = Number((this.totalAmount + tax - discount).toFixed(2));

  // Payment Status & Due calculation
  const paid = Number(this.paidAmount || 0);
  const due = Number(Math.max(0, this.grandTotal - paid).toFixed(2));
  this.dueAmount = due;

  if (paid >= this.grandTotal && this.grandTotal > 0) {
    this.paymentStatus = "PAID";
    this.dueAmount = 0;
  } else if (paid > 0 && paid < this.grandTotal) {
    this.paymentStatus = "PARTIAL";
  } else {
    this.paymentStatus = "UNPAID";
  }

  next();
});

module.exports = mongoose.model("SupplierSupply", supplierSupplySchema);
