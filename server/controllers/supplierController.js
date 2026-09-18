const Supplier = require("../models/Supplier");
const SupplierSupply = require("../models/SupplierSupply");
const Medicine = require("../models/Medicine");

// =========================================================================
// SEED DEFAULT PHARMA SUPPLIERS IF EMPTY
// =========================================================================
const seedDefaultSuppliersIfEmpty = async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count > 0) return;

    const defaultSuppliers = [
      {
        name: "Cipla Healthcare Distribution",
        companyName: "Cipla Ltd",
        contactPerson: "Rajesh Sharma",
        phone: "9820112345",
        email: "supply.north@cipla.com",
        address: "Plot 42, Pharma Hub, Okhla Phase 3, New Delhi - 110020",
        gstNumber: "07AAACC1206D1ZM",
        drugLicenseNumber: "DL-ND-2024-8891",
        status: "ACTIVE",
        paymentTerms: "Net 30 Days",
        bankDetails: {
          bankName: "HDFC Bank Ltd",
          accountNumber: "50200088991122",
          ifscCode: "HDFC0001234",
          upiId: "cipla.supply@hdfcbank",
        },
        notes: "Major supplier for Betnovate, Asthalin, Ciplox and respiratory ranges.",
      },
      {
        name: "Mankind Pharma Hub",
        companyName: "Mankind Pharma",
        contactPerson: "Vikram Verma",
        phone: "9811054321",
        email: "orders@mankindpharma.com",
        address: "208 Okhla Industrial Estate, Phase III, New Delhi - 110020",
        gstNumber: "07AAACM4421E1Z3",
        drugLicenseNumber: "DL-ND-2023-4412",
        status: "ACTIVE",
        paymentTerms: "Net 15 Days",
        bankDetails: {
          bankName: "ICICI Bank",
          accountNumber: "002105009944",
          ifscCode: "ICIC0000021",
          upiId: "mankindpharma@icici",
        },
        notes: "Primary vendor for Manforce, Moxikind-CV, Dydroboon, and OTC range.",
      },
      {
        name: "Sun Pharma Distributors",
        companyName: "Sun Pharmaceutical Industries",
        contactPerson: "Amit Patel",
        phone: "9909987654",
        email: "distribution.up@sunpharma.com",
        address: "Sun House, Sector 62, Noida, Uttar Pradesh - 201301",
        gstNumber: "09AAACS1122F1ZK",
        drugLicenseNumber: "DL-UP-2025-1029",
        status: "ACTIVE",
        paymentTerms: "Net 30 Days",
        bankDetails: {
          bankName: "State Bank of India",
          accountNumber: "38992211004",
          ifscCode: "SBIN0004567",
          upiId: "sunpharma@sbi",
        },
        notes: "Key supplier for Pantocid, Volini, Gemer, and chronic care medicines.",
      },
      {
        name: "Abbott Healthcare North Depot",
        companyName: "Abbott Healthcare Pvt Ltd",
        contactPerson: "Neha Kapoor",
        phone: "9717033221",
        email: "depot.delhi@abbott.in",
        address: "Godown No. 12, Transport Nagar, Ghaziabad, UP - 201009",
        gstNumber: "09AAACA0022P1Z8",
        drugLicenseNumber: "DL-UP-2024-5561",
        status: "ACTIVE",
        paymentTerms: "Net 21 Days",
        bankDetails: {
          bankName: "Axis Bank",
          accountNumber: "918020033445566",
          ifscCode: "UTIB0000889",
          upiId: "abbott.depot@axisbank",
        },
        notes: "Supplies Thyronorm, Digene, Brufen, Ensure, and nutrition lines.",
      },
      {
        name: "Dr. Reddy's Central Agency",
        companyName: "Dr. Reddy's Laboratories",
        contactPerson: "Suresh Reddy",
        phone: "9849065432",
        email: "agency.aligarh@drreddys.com",
        address: "GT Road Industrial Area, Aligarh, Uttar Pradesh - 202001",
        gstNumber: "09AAACD2409M1ZA",
        drugLicenseNumber: "DL-UP-2023-9902",
        status: "ACTIVE",
        paymentTerms: "Net 30 Days",
        bankDetails: {
          bankName: "Kotak Mahindra Bank",
          accountNumber: "7711223344",
          ifscCode: "KKBK0000123",
          upiId: "drreddys@kotak",
        },
        notes: "Supplies Omez, Nise, Econorm, Razo, and gastro portfolio.",
      },
    ];

    const insertedSuppliers = await Supplier.insertMany(defaultSuppliers);

    // Also seed sample inward supplies with batch & payment details
    const sampleSupplies = [
      {
        supplier: insertedSuppliers[0]._id,
        supplierName: insertedSuppliers[0].name,
        companyName: insertedSuppliers[0].companyName,
        invoiceNumber: "INV-CIPLA-2026-041",
        purchaseDate: new Date("2026-09-10"),
        medicines: [
          {
            medicineName: "Betnovate C Cream 30g",
            companyBrand: "Cipla Ltd",
            category: "Skin Care",
            batchNumber: "BTC-2609A",
            expiryDate: "2027-11-30",
            quantity: 150,
            unitCost: 45.0,
            mrp: 65.0,
            totalCost: 6750.0,
          },
          {
            medicineName: "Ciplox 500mg Eye Drops",
            companyBrand: "Cipla Ltd",
            category: "Eye Care",
            batchNumber: "CPX-8802",
            expiryDate: "2027-08-31",
            quantity: 100,
            unitCost: 32.0,
            mrp: 52.0,
            totalCost: 3200.0,
          },
        ],
        totalAmount: 9950.0,
        taxAmount: 497.5,
        discountAmount: 200.0,
        grandTotal: 10247.5,
        paidAmount: 10247.5,
        dueAmount: 0.0,
        paymentStatus: "PAID",
        paymentMethod: "BANK_TRANSFER",
        paymentHistory: [
          {
            date: new Date("2026-09-11"),
            amount: 10247.5,
            method: "BANK_TRANSFER",
            refNumber: "NEFT-HDFC-9928172",
            notes: "Full invoice payment cleared via NEFT.",
          },
        ],
        deliveryStatus: "RECEIVED",
        receivedBy: "Admin",
        notes: "Stock verified and loaded into pharmacy inventory.",
      },
      {
        supplier: insertedSuppliers[1]._id,
        supplierName: insertedSuppliers[1].name,
        companyName: insertedSuppliers[1].companyName,
        invoiceNumber: "INV-MK-2026-882",
        purchaseDate: new Date("2026-09-14"),
        medicines: [
          {
            medicineName: "Limcee 500mg Chewable Tablets (Strip of 15)",
            companyBrand: "Mankind Pharma",
            category: "Vitamins & Supplements",
            batchNumber: "LMC-4401",
            expiryDate: "2028-02-28",
            quantity: 300,
            unitCost: 18.5,
            mrp: 32.0,
            totalCost: 5550.0,
          },
          {
            medicineName: "Moxikind-CV 625mg Tablets",
            companyBrand: "Mankind Pharma",
            category: "Antibiotics",
            batchNumber: "MXK-9011",
            expiryDate: "2027-10-31",
            quantity: 80,
            unitCost: 110.0,
            mrp: 185.0,
            totalCost: 8800.0,
          },
        ],
        totalAmount: 14350.0,
        taxAmount: 717.5,
        discountAmount: 350.0,
        grandTotal: 14717.5,
        paidAmount: 10000.0,
        dueAmount: 4717.5,
        paymentStatus: "PARTIAL",
        paymentMethod: "UPI",
        paymentHistory: [
          {
            date: new Date("2026-09-15"),
            amount: 10000.0,
            method: "UPI",
            refNumber: "UPI-ICICI-662819",
            notes: "Advance ₹10,000 paid via UPI. Balance due in 15 days.",
          },
        ],
        deliveryStatus: "RECEIVED",
        receivedBy: "Admin",
        notes: "Partially paid. Remaining balance ₹4,717.50 due on 29-Sep-2026.",
      },
      {
        supplier: insertedSuppliers[2]._id,
        supplierName: insertedSuppliers[2].name,
        companyName: insertedSuppliers[2].companyName,
        invoiceNumber: "INV-SUN-2026-109",
        purchaseDate: new Date("2026-09-16"),
        medicines: [
          {
            medicineName: "Pantocid 40mg Tablets",
            companyBrand: "Sun Pharma",
            category: "Gastro",
            batchNumber: "PNT-5521",
            expiryDate: "2028-01-31",
            quantity: 120,
            unitCost: 85.0,
            mrp: 145.0,
            totalCost: 10200.0,
          },
          {
            medicineName: "Volini Pain Relief Gel 50g",
            companyBrand: "Sun Pharma",
            category: "Pain Relief",
            batchNumber: "VOL-1192",
            expiryDate: "2027-12-31",
            quantity: 60,
            unitCost: 95.0,
            mrp: 160.0,
            totalCost: 5700.0,
          },
        ],
        totalAmount: 15900.0,
        taxAmount: 795.0,
        discountAmount: 400.0,
        grandTotal: 16295.0,
        paidAmount: 0.0,
        dueAmount: 16295.0,
        paymentStatus: "UNPAID",
        paymentMethod: "BANK_TRANSFER",
        paymentHistory: [],
        deliveryStatus: "RECEIVED",
        receivedBy: "Admin",
        notes: "Full bill amount ₹16,295.00 pending payment (30 days credit).",
      },
    ];

    await SupplierSupply.insertMany(sampleSupplies);
    console.log("✅ Seeded default Pharma suppliers and supply invoices successfully.");
  } catch (error) {
    console.error("Error seeding default suppliers:", error);
  }
};

// =========================================================================
// 1. GET ALL SUPPLIERS (With aggregated financial balances)
// =========================================================================
exports.getSuppliers = async (req, res) => {
  try {
    await seedDefaultSuppliersIfEmpty();

    const { search, status } = req.query;
    let query = {};

    if (status && status !== "ALL") {
      query.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: regex },
        { companyName: regex },
        { contactPerson: regex },
        { phone: regex },
        { email: regex },
        { gstNumber: regex },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 }).lean();

    // Aggregate purchases and payment balances per supplier
    const supplierIds = suppliers.map((s) => s._id);
    const supplies = await SupplierSupply.find({ supplier: { $in: supplierIds } }).lean();

    const suppliersWithStats = suppliers.map((sup) => {
      const supSupplies = supplies.filter(
        (sp) => sp.supplier.toString() === sup._id.toString()
      );

      const totalInvoices = supSupplies.length;
      const totalBilled = supSupplies.reduce((sum, sp) => sum + (Number(sp.grandTotal) || 0), 0);
      const totalPaid = supSupplies.reduce((sum, sp) => sum + (Number(sp.paidAmount) || 0), 0);
      const totalDue = supSupplies.reduce((sum, sp) => sum + (Number(sp.dueAmount) || 0), 0);

      // Collect medicines provided by this supplier
      const allMedicines = [];
      supSupplies.forEach((sp) => {
        if (sp.medicines && sp.medicines.length > 0) {
          sp.medicines.forEach((med) => {
            if (!allMedicines.includes(med.medicineName)) {
              allMedicines.push(med.medicineName);
            }
          });
        }
      });

      return {
        ...sup,
        stats: {
          totalInvoices,
          totalBilled: Number(totalBilled.toFixed(2)),
          totalPaid: Number(totalPaid.toFixed(2)),
          totalDue: Number(totalDue.toFixed(2)),
          medicineCount: allMedicines.length,
          suppliedMedicines: allMedicines,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: suppliersWithStats.length,
      data: suppliersWithStats,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers",
      error: error.message,
    });
  }
};

// =========================================================================
// 2. CREATE NEW SUPPLIER
// =========================================================================
exports.createSupplier = async (req, res) => {
  try {
    const {
      name,
      companyName,
      contactPerson,
      phone,
      email,
      address,
      gstNumber,
      drugLicenseNumber,
      paymentTerms,
      bankDetails,
      notes,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Supplier Name and Phone number are required.",
      });
    }

    const newSupplier = await Supplier.create({
      name: name.trim(),
      companyName: (companyName || name).trim(),
      contactPerson: contactPerson?.trim() || "",
      phone: phone.trim(),
      email: email?.trim() || "",
      address: address?.trim() || "",
      gstNumber: gstNumber?.trim() || "",
      drugLicenseNumber: drugLicenseNumber?.trim() || "",
      paymentTerms: paymentTerms?.trim() || "Net 30 Days",
      bankDetails: bankDetails || {},
      notes: notes?.trim() || "",
      status: "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Supplier created successfully 🎉",
      data: newSupplier,
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create supplier",
      error: error.message,
    });
  }
};

// =========================================================================
// 3. UPDATE SUPPLIER
// =========================================================================
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSupplier = await Supplier.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Also update supplierName/companyName in supplies if changed
    if (updateData.name || updateData.companyName) {
      await SupplierSupply.updateMany(
        { supplier: id },
        {
          $set: {
            supplierName: updatedSupplier.name,
            companyName: updatedSupplier.companyName,
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: updatedSupplier,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update supplier",
      error: error.message,
    });
  }
};

// =========================================================================
// 4. DELETE SUPPLIER
// =========================================================================
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Supplier.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Delete associated supply records
    await SupplierSupply.deleteMany({ supplier: id });

    res.status(200).json({
      success: true,
      message: "Supplier and associated supply records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete supplier",
      error: error.message,
    });
  }
};

// =========================================================================
// 5. GET ALL INWARD SUPPLIES / INVOICES (With filter & search)
// =========================================================================
exports.getSupplies = async (req, res) => {
  try {
    await seedDefaultSuppliersIfEmpty();

    const { supplierId, paymentStatus, search, startDate, endDate } = req.query;
    let query = {};

    if (supplierId && supplierId !== "ALL") {
      query.supplier = supplierId;
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      query.paymentStatus = paymentStatus.toUpperCase();
    }

    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.purchaseDate.$lte = end;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { invoiceNumber: regex },
        { supplierName: regex },
        { companyName: regex },
        { "medicines.medicineName": regex },
        { "medicines.companyBrand": regex },
        { "medicines.batchNumber": regex },
      ];
    }

    const supplies = await SupplierSupply.find(query)
      .populate("supplier", "name companyName phone email gstNumber bankDetails")
      .sort({ purchaseDate: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: supplies.length,
      data: supplies,
    });
  } catch (error) {
    console.error("Error fetching supplies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch supply records",
      error: error.message,
    });
  }
};

// =========================================================================
// 6. CREATE INWARD SUPPLY / PURCHASE INVOICE
// =========================================================================
exports.createSupply = async (req, res) => {
  try {
    const {
      supplierId,
      invoiceNumber,
      purchaseDate,
      medicines,
      taxAmount,
      discountAmount,
      initialPaidAmount,
      paymentMethod,
      paymentRef,
      paymentNotes,
      deliveryStatus,
      receivedBy,
      notes,
    } = req.body;

    if (!supplierId) {
      return res.status(400).json({ success: false, message: "Please select a supplier." });
    }

    if (!invoiceNumber || !invoiceNumber.trim()) {
      return res.status(400).json({ success: false, message: "Invoice number is required." });
    }

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one medicine item to this supply invoice.",
      });
    }

    const supplierDoc = await Supplier.findById(supplierId);
    if (!supplierDoc) {
      return res.status(404).json({ success: false, message: "Selected supplier not found." });
    }

    // Calculate medicine subtotal
    const processedMedicines = medicines.map((m) => {
      const qty = Number(m.quantity) || 1;
      const cost = Number(m.unitCost) || 0;
      return {
        medicineName: m.medicineName?.trim() || "Medicine",
        companyBrand: m.companyBrand?.trim() || supplierDoc.companyName || "",
        category: m.category?.trim() || "General",
        batchNumber: m.batchNumber?.trim() || `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate: m.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        quantity: qty,
        unitCost: cost,
        mrp: Number(m.mrp) || 0,
        totalCost: Number((qty * cost).toFixed(2)),
      };
    });

    const subtotal = processedMedicines.reduce((sum, item) => sum + item.totalCost, 0);
    const tax = Number(taxAmount) || 0;
    const discount = Number(discountAmount) || 0;
    const grandTotal = Number((subtotal + tax - discount).toFixed(2));

    const initialPaid = Number(initialPaidAmount) || 0;
    const dueAmount = Number(Math.max(0, grandTotal - initialPaid).toFixed(2));

    let paymentStatus = "UNPAID";
    if (initialPaid >= grandTotal && grandTotal > 0) {
      paymentStatus = "PAID";
    } else if (initialPaid > 0) {
      paymentStatus = "PARTIAL";
    }

    const paymentHistory = [];
    if (initialPaid > 0) {
      paymentHistory.push({
        date: purchaseDate ? new Date(purchaseDate) : new Date(),
        amount: initialPaid,
        method: paymentMethod || "BANK_TRANSFER",
        refNumber: paymentRef || "INITIAL-PAYMENT",
        notes: paymentNotes || "Initial payment made upon stock receipt.",
      });
    }

    const supplyRecord = await SupplierSupply.create({
      supplier: supplierDoc._id,
      supplierName: supplierDoc.name,
      companyName: supplierDoc.companyName,
      invoiceNumber: invoiceNumber.trim(),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      medicines: processedMedicines,
      totalAmount: subtotal,
      taxAmount: tax,
      discountAmount: discount,
      grandTotal: grandTotal,
      paidAmount: initialPaid,
      dueAmount: dueAmount,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod || "BANK_TRANSFER",
      paymentHistory: paymentHistory,
      deliveryStatus: deliveryStatus || "RECEIVED",
      receivedBy: receivedBy?.trim() || "Admin",
      notes: notes?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Inward supply invoice created successfully 📦",
      data: supplyRecord,
    });
  } catch (error) {
    console.error("Error creating supply invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create supply record",
      error: error.message,
    });
  }
};

// =========================================================================
// 7. RECORD PAYMENT FOR INWARD SUPPLY / PURCHASE INVOICE
// =========================================================================
exports.recordSupplyPayment = async (req, res) => {
  try {
    const { supplyId } = req.params;
    const { amount, method, refNumber, notes, paymentDate } = req.body;

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid payment amount greater than 0.",
      });
    }

    const supply = await SupplierSupply.findById(supplyId);
    if (!supply) {
      return res.status(404).json({
        success: false,
        message: "Supply invoice not found",
      });
    }

    const currentPaid = Number(supply.paidAmount || 0);
    const newPaid = Number((currentPaid + payAmount).toFixed(2));
    const grandTotal = Number(supply.grandTotal || supply.totalAmount || 0);
    const newDue = Number(Math.max(0, grandTotal - newPaid).toFixed(2));

    let newStatus = "PARTIAL";
    if (newPaid >= grandTotal && grandTotal > 0) {
      newStatus = "PAID";
    }

    // Push to payment history
    supply.paymentHistory.push({
      date: paymentDate ? new Date(paymentDate) : new Date(),
      amount: payAmount,
      method: method || "BANK_TRANSFER",
      refNumber: refNumber?.trim() || `PAY-${Date.now().toString().slice(-6)}`,
      notes: notes?.trim() || "Payment recorded by admin.",
    });

    supply.paidAmount = newPaid;
    supply.dueAmount = newDue;
    supply.paymentStatus = newStatus;
    supply.paymentMethod = method || supply.paymentMethod;

    await supply.save();

    res.status(200).json({
      success: true,
      message: `Payment of ₹${payAmount.toFixed(2)} recorded successfully! Remaining balance: ₹${newDue.toFixed(2)}`,
      data: supply,
    });
  } catch (error) {
    console.error("Error recording supply payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

// =========================================================================
// 8. DELETE SUPPLY INVOICE
// =========================================================================
exports.deleteSupply = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SupplierSupply.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Supply invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supply invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting supply:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete supply record",
      error: error.message,
    });
  }
};

// =========================================================================
// 9. OVERVIEW KPI & STATS
// =========================================================================
exports.getSupplierStats = async (req, res) => {
  try {
    await seedDefaultSuppliersIfEmpty();

    const totalSuppliers = await Supplier.countDocuments({ status: "ACTIVE" });
    const supplies = await SupplierSupply.find().lean();

    const totalInvoices = supplies.length;
    const totalBilled = supplies.reduce((sum, sp) => sum + (Number(sp.grandTotal) || 0), 0);
    const totalPaid = supplies.reduce((sum, sp) => sum + (Number(sp.paidAmount) || 0), 0);
    const totalDue = supplies.reduce((sum, sp) => sum + (Number(sp.dueAmount) || 0), 0);

    let totalMedicineItemsCount = 0;
    const companyDistribution = {};

    supplies.forEach((sp) => {
      const company = sp.companyName || sp.supplierName || "Other";
      companyDistribution[company] = (companyDistribution[company] || 0) + (Number(sp.grandTotal) || 0);

      if (sp.medicines && sp.medicines.length > 0) {
        sp.medicines.forEach((m) => {
          totalMedicineItemsCount += Number(m.quantity || 0);
        });
      }
    });

    const pendingInvoicesCount = supplies.filter(
      (sp) => sp.paymentStatus === "UNPAID" || sp.paymentStatus === "PARTIAL"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalSuppliers,
        totalInvoices,
        totalBilled: Number(totalBilled.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalDue: Number(totalDue.toFixed(2)),
        totalMedicineUnitsReceived: totalMedicineItemsCount,
        pendingInvoicesCount,
        companyDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching supplier stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};
