const ReturnRequest = require("../models/ReturnRequest");

// ==========================================
// CREATE RETURN REQUEST
// ==========================================
const createReturnRequest = async (req, res) => {
  try {
    const {
      billNumber,
      customerName,
      customerEmail,
      customerPhone,
      medicineName,
      returnReason,
      explanation,
      proofImage,
    } = req.body;

    if (!billNumber || !customerName || !customerPhone || !returnReason || !explanation || !proofImage) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields including Bill Number, Reason, Explanation and Proof Image.",
      });
    }

    const newReturn = await ReturnRequest.create({
      billNumber: billNumber.trim().toUpperCase(),
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : "",
      customerPhone: customerPhone.trim(),
      medicineName: medicineName ? medicineName.trim() : "Medicine Order",
      returnReason,
      explanation: explanation.trim(),
      proofImage,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Return request submitted successfully. Our pharmacy team will review your proof and update status shortly.",
      returnRequest: newReturn,
    });
  } catch (error) {
    console.error("Create Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit return request",
    });
  }
};

// ==========================================
// GET ALL RETURN REQUESTS (ADMIN)
// ==========================================
const getAllReturnRequests = async (req, res) => {
  try {
    const returns = await ReturnRequest.find().sort({ createdAt: -1 });

    const stats = {
      total: returns.length,
      pending: returns.filter((r) => r.status === "PENDING").length,
      approved: returns.filter((r) => r.status === "APPROVED").length,
      rejected: returns.filter((r) => r.status === "REJECTED").length,
      refunded: returns.filter((r) => r.status === "REFUNDED").length,
    };

    res.status(200).json({
      success: true,
      count: returns.length,
      stats,
      returns,
    });
  } catch (error) {
    console.error("Fetch Returns Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch return requests",
    });
  }
};

// ==========================================
// TRACK RETURN BY BILL NUMBER
// ==========================================
const getReturnByBillNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;

    if (!billNumber) {
      return res.status(400).json({
        success: false,
        message: "Bill Number is required for tracking",
      });
    }

    const returns = await ReturnRequest.find({
      $or: [
        { billNumber: billNumber.trim().toUpperCase() },
        { customerPhone: billNumber.trim() },
      ],
    }).sort({ createdAt: -1 });

    if (!returns || returns.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No return requests found for this Bill Number or Mobile Number",
      });
    }

    res.status(200).json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    console.error("Track Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to track return request",
    });
  }
};

// ==========================================
// UPDATE RETURN STATUS (ADMIN)
// ==========================================
const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED", "REFUNDED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status value",
      });
    }

    const updatedReturn = await ReturnRequest.findByIdAndUpdate(
      id,
      {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
      { new: true }
    );

    if (!updatedReturn) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Return request status updated to ${status}`,
      returnRequest: updatedReturn,
    });
  } catch (error) {
    console.error("Update Return Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update return status",
    });
  }
};

module.exports = {
  createReturnRequest,
  getAllReturnRequests,
  getReturnByBillNumber,
  updateReturnStatus,
};
