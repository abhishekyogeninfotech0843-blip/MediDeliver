const ContactMessage = require("../models/ContactMessage");

// @desc    Submit a new contact / support inquiry
// @route   POST /api/contact
// @access  Public
exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, category, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    // Generate unique Ticket ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `MD-${randomNum}`;

    const newContact = await ContactMessage.create({
      ticketId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      category: category || "General Inquiry",
      subject: subject ? subject.trim() : "Healthcare Support Inquiry",
      message: message.trim(),
      status: "NEW",
    });

    return res.status(201).json({
      success: true,
      message: "Your inquiry has been submitted successfully! Support ticket created.",
      data: newContact,
    });
  } catch (error) {
    console.error("Create contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact message",
      error: error.message,
    });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private / Admin
exports.getAllContactMessages = async (req, res) => {
  try {
    const { status, category, search, startDate, endDate } = req.query;

    let filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (category && category !== "ALL") {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { ticketId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    const [messages, totalCount, newCount, inProgressCount, resolvedCount] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).lean().catch(() => []),
      ContactMessage.countDocuments().catch(() => 0),
      ContactMessage.countDocuments({ status: "NEW" }).catch(() => 0),
      ContactMessage.countDocuments({ status: "IN_PROGRESS" }).catch(() => 0),
      ContactMessage.countDocuments({ status: "RESOLVED" }).catch(() => 0),
    ]);

    return res.status(200).json({
      success: true,
      count: (messages || []).length,
      stats: {
        total: totalCount,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
      messages: messages || [],
    });
  } catch (error) {
    console.error("Get contact messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact inquiries",
      error: error.message,
    });
  }
};

// @desc    Update contact message status / add admin note
// @route   PUT /api/contact/:id/status
// @access  Private / Admin
exports.updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const contact = await ContactMessage.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    if (status) {
      contact.status = status;
      if (status === "RESOLVED" || status === "CLOSED") {
        contact.repliedAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      contact.adminNotes = adminNotes;
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: `Ticket ${contact.ticketId} status updated to ${contact.status}`,
      data: contact,
    });
  } catch (error) {
    console.error("Update contact status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact status",
      error: error.message,
    });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private / Admin
exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
      error: error.message,
    });
  }
};
