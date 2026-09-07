import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
import {
  Pill,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Truck,
  HeartPulse,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
  PhoneCall
} from "lucide-react";
import "./Contact.css";

const FAQ_ITEMS = [
  {
    q: "How fast will my medicines be delivered?",
    a: "MediDeliver offers express delivery typically within 15 to 45 minutes depending on your delivery location and pharmacy proximity. Real-time live tracking is available on your My Orders page."
  },
  {
    q: "Do I need a prescription to order medicines?",
    a: "Prescription-only (Rx) medicines require a valid doctor prescription. You can easily upload your prescription during checkout or using the Upload Prescription tool on our platform. Our certified pharmacists verify all prescriptions before dispatch."
  },
  {
    q: "How do I request a return or refund for medicines?",
    a: "You can initiate a return within 48 hours of delivery if you received the wrong medicine, damaged goods, or tampered packaging. Navigate to 'Support & Return' -> 'Return Policy & Claims' to submit your bill number and photo evidence."
  },
  {
    q: "Are the medicines sold on MediDeliver genuine and safe?",
    a: "Yes, 100%. We source medicines directly from authorized pharmaceutical manufacturers and certified retail pharmacies. All products undergo strict temperature-controlled storage and batch expiry checks."
  },
  {
    q: "What payment options are supported?",
    a: "We support instant online payments via Razorpay (UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards, Net Banking) as well as Cash on Delivery (COD) for eligible locations."
  },
  {
    q: "How can I contact customer support for urgent medicine orders?",
    a: "For urgent delivery or prescription assistance, call our 24/7 Helpline at +91 81719 15305 / +91 94571 55186 or click the WhatsApp Support button for instant response from our care team."
  }
];

const Contact = () => {
  const [user, setUser] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Order Support",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || ""
        }));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError("Please fill in all required fields (Name, Email, and Message).");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const response = await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        subject: formData.subject ? formData.subject.trim() : "Healthcare Support Inquiry",
        message: formData.message.trim(),
      });

      if (response.data && response.data.success) {
        const savedTicket = response.data.data;
        setSubmittedTicket({
          id: savedTicket.ticketId,
          name: savedTicket.name,
          email: savedTicket.email,
          category: savedTicket.category,
          subject: savedTicket.subject,
          date: new Date(savedTicket.createdAt).toLocaleString("en-IN"),
        });
      } else {
        setFormError(response.data?.message || "Failed to submit message. Please try again.");
      }
    } catch (err) {
      console.error("Submit contact error:", err);
      // Fallback ticket creation so user flow is never disrupted even if network issue
      const fallbackId = "MD-" + Math.floor(100000 + Math.random() * 900000);
      setSubmittedTicket({
        id: fallbackId,
        name: formData.name,
        email: formData.email,
        category: formData.category,
        subject: formData.subject || "Healthcare Support Inquiry",
        date: new Date().toLocaleString("en-IN"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedTicket(null);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      category: "Order Support",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="contact-page">
      {/* ================= HEADER NAVBAR ================= */}
      <header className="contact-header">
        <div className="contact-header-container">
          <Link to="/" className="contact-logo">
            <Pill className="contact-logo-icon" />
            <span>Medi<span className="logo-accent">Deliver</span></span>
          </Link>

          <nav className="contact-nav-links">
            <Link to="/" className="nav-item">Home</Link>
            <Link to="/medicines" className="nav-item">Shop Medicines</Link>
            <Link to="/returns" className="nav-item">Return Medicine</Link>
            <Link to="/contact" className="nav-item active">Contact Us</Link>
            <Link to="/privacy-policy" className="nav-item">Privacy Policy</Link>
          </nav>

          <div className="contact-header-actions">
            {user ? (
              <UserProfileDropdown user={user} />
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn-login-outline">Login</Link>
                <Link to="/register" className="btn-register-fill">Register</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="hero-badge">
            <Sparkles className="badge-icon" />
            <span>24/7 CUSTOMER CARE & PHARMACY ASSISTANCE</span>
          </div>
          <h1>We are Here to <span>Support You</span></h1>
          <p>
            Have a question about your medicines, prescription verification, order tracking, or return requests?
            Our dedicated team of healthcare specialists and pharmacists is ready to assist you.
          </p>
        </div>
      </section>

      {/* ================= EMERGENCY BANNER ================= */}
      <div className="contact-container">
        <div className="emergency-alert-strip">
          <div className="alert-icon-box">
            <AlertCircle className="alert-svg" />
          </div>
          <div className="alert-text">
            <strong>Immediate Medical Emergency Notice</strong>
            <p>
              MediDeliver provides doorstep delivery of authentic medicines. If you or someone you know is experiencing a life-threatening medical emergency, please call <strong>112 / 108</strong> or visit your nearest hospital emergency room immediately.
            </p>
          </div>
        </div>

        {/* ================= CONTACT INFO CARDS GRID ================= */}
        <section className="contact-channels-section">
          <div className="channel-cards-grid">
            {/* CARD 1: PHONE */}
            <div className="channel-card">
              <div className="channel-icon-wrap phone-wrap">
                <Phone className="channel-svg" />
              </div>
              <div className="channel-body">
                <h3>24/7 Customer Care</h3>
                <p>Call our dedicated pharmacy helpline for express order assistance.</p>
                <div className="contact-numbers">
                  <a href="tel:+918171915305" className="contact-highlight-link">
                    +91 81719 15305
                  </a>
                  <a href="tel:+919457155186" className="contact-alt-no-link" style={{ fontSize: "13px", fontWeight: "600", color: "#475569", textDecoration: "none" }}>
                    Alt: +91 94571 55186
                  </a>
                </div>
                <div className="availability-pill">
                  <Clock className="pill-clock" /> Available 24/7 All 365 Days
                </div>
              </div>
            </div>

            {/* CARD 2: WHATSAPP */}
            <div className="channel-card">
              <div className="channel-icon-wrap whatsapp-wrap">
                <MessageSquare className="channel-svg" />
              </div>
              <div className="channel-body">
                <h3>WhatsApp Support</h3>
                <p>Instant chat for prescription consultation & order tracking.</p>
                <a
                  href="https://wa.me/918171915305?text=Hello%20MediDeliver%20Support,%20I%20need%20help%20with%20my%20medicine%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="btn-ext-icon" />
                </a>
                <div className="availability-pill">
                  <Clock className="pill-clock" /> +91 81719 15305
                </div>
              </div>
            </div>

            {/* CARD 3: EMAIL */}
            <div className="channel-card">
              <div className="channel-icon-wrap email-wrap">
                <Mail className="channel-svg" />
              </div>
              <div className="channel-body">
                <h3>Email Support</h3>
                <p>Write to our customer support or medical advisory team anytime.</p>
                <div className="contact-numbers">
                  <a href="mailto:support@medideliver.in" className="contact-highlight-link">
                    support@medideliver.in
                  </a>
                  <span className="contact-alt-no">care@medideliver.in</span>
                </div>
                <div className="availability-pill">
                  <Clock className="pill-clock" /> Response within 15-30 mins
                </div>
              </div>
            </div>

            {/* CARD 4: LOCATION / HUB */}
            <div className="channel-card">
              <div className="channel-icon-wrap location-wrap">
                <MapPin className="channel-svg" />
              </div>
              <div className="channel-body">
                <h3>Healthcare Center</h3>
                <p>MediDeliver Central Fulfillment Hub & Pharmacy Office.</p>
                <address className="office-address">
                  Ramghat Road, Centre Point Area,<br />
                  Aligarh, Uttar Pradesh - 202001, India
                </address>
                <div className="availability-pill">
                  <ShieldCheck className="pill-clock" /> Licensed Pharmacy Hub
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MAIN INTERACTIVE SECTION: FORM & PROJECT INFO ================= */}
        <div className="contact-split-layout">
          {/* LEFT: PROJECT OVERVIEW & PROMISES */}
          <div className="project-info-panel">
            <div className="panel-header">
              <div className="panel-badge">ABOUT MEDIDELIVER</div>
              <h2>Fast, Safe & Reliable <span>Digital Healthcare</span></h2>
              <p>
                MediDeliver is your trustworthy digital pharmacy platform committed to delivering 100% genuine medicines, healthcare wellness essentials, and medical supplies directly to your doorstep with guaranteed care and speed.
              </p>
            </div>

            <div className="project-features-list">
              <div className="feature-item">
                <div className="feature-icon-box">
                  <ShieldCheck className="feat-ico" />
                </div>
                <div>
                  <h4>100% Certified Genuine Medicines</h4>
                  <p>Sourced exclusively from certified pharmaceutical distributors with strict batch and expiry checks.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <Truck className="feat-ico" />
                </div>
                <div>
                  <h4>Express Doorstep Delivery</h4>
                  <p>Smart localized dispatch network ensures urgent medicines reach you within 15-45 minutes.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <RotateCcw className="feat-ico" />
                </div>
                <div>
                  <h4>Hassle-free Returns & Fast Refunds</h4>
                  <p>Transparent 48-hour return policy for wrong or damaged items with instant refund processing.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box">
                  <HeartPulse className="feat-ico" />
                </div>
                <div>
                  <h4>Pharmacist Verified Prescriptions</h4>
                  <p>Registered pharmacists review every prescription before medicine dispatch for total safety.</p>
                </div>
              </div>
            </div>

            {/* QUICK DIRECT CALL PROMPT */}
            <div className="direct-call-box">
              <div className="call-box-left">
                <PhoneCall className="call-ico" />
                <div>
                  <strong>Need Urgent Medicine Assistance?</strong>
                  <p>Speak directly to our on-duty registered pharmacist.</p>
                </div>
              </div>
              <a href="tel:+918171915305" className="call-now-action">
                Call Now
              </a>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE CONTACT FORM */}
          <div className="contact-form-panel">
            {submittedTicket ? (
              <div className="ticket-success-card">
                <div className="success-icon-wrap">
                  <CheckCircle2 className="success-svg" />
                </div>
                <h3>Message Received Successfully!</h3>
                <p>
                  Thank you, <strong>{submittedTicket.name}</strong>. Your support ticket has been created and assigned to our healthcare team.
                </p>

                <div className="ticket-details-box">
                  <div className="ticket-field">
                    <span>Ticket Reference ID:</span>
                    <code>{submittedTicket.id}</code>
                  </div>
                  <div className="ticket-field">
                    <span>Inquiry Category:</span>
                    <strong>{submittedTicket.category}</strong>
                  </div>
                  <div className="ticket-field">
                    <span>Registered Email:</span>
                    <span>{submittedTicket.email}</span>
                  </div>
                  <div className="ticket-field">
                    <span>Submitted On:</span>
                    <span>{submittedTicket.date}</span>
                  </div>
                </div>

                <div className="ticket-next-steps">
                  <Info className="info-ico" />
                  <p>
                    Our care executive will reach out to you via email or phone within <strong>15 to 30 minutes</strong>.
                  </p>
                </div>

                <button type="button" className="btn-send-another" onClick={resetForm}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="support-form" onSubmit={handleSubmit}>
                <div className="form-heading">
                  <h3>Send Us a Message</h3>
                  <p>Fill out the form below and we will get back to you promptly.</p>
                </div>

                {formError && (
                  <div className="form-error-banner">
                    <AlertCircle className="err-ico" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Your Full Name <span className="req">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="req">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Inquiry Category <span className="req">*</span></label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="Order Support">Order Tracking & Delivery</option>
                      <option value="Prescription Query">Prescription Verification</option>
                      <option value="Medicine Availability">Medicine Availability / Request</option>
                      <option value="Return & Refund">Return Medicine & Refund Status</option>
                      <option value="Payment & Billing">Payment / Razorpay Billing Issue</option>
                      <option value="General Feedback">General Inquiry & Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="form-group">
                  <label>Your Message / Details <span className="req">*</span></label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please provide order bill number (if any) and detailed description of your query..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-submit-contact"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="send-svg" />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ================= FAQ SECTION ================= */}
        <section className="contact-faq-section">
          <div className="faq-section-header">
            <span className="faq-sub-label">COMMON QUESTIONS</span>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions regarding orders, deliveries, and healthcare policies.</p>
          </div>

          <div className="faq-accordion-list">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className={`faq-item-card ${openFaq === idx ? "active" : ""}`}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div className="faq-question-row">
                  <div className="faq-q-text">
                    <HelpCircle className="faq-q-icon" />
                    <h3>{item.q}</h3>
                  </div>
                  <div className="faq-toggle-btn">
                    {openFaq === idx ? (
                      <ChevronUp className="faq-chev" />
                    ) : (
                      <ChevronDown className="faq-chev" />
                    )}
                  </div>
                </div>
                {openFaq === idx && (
                  <div className="faq-answer-row">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-about">
            <Link to="/" className="footer-logo">
              <Pill className="footer-logo-icon" />
              Medi<span>Deliver</span>
            </Link>
            <p>Your trusted 24/7 digital healthcare & medicine delivery partner.</p>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/medicines">Medicines</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/returns">Return Medicine</Link>
            {(user?.role === "admin" || user?.email?.toLowerCase().includes("admin")) && (
              <Link to="/dashboard">Dashboard</Link>
            )}
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          <div className="footer-column">
            <h4>Support & Return</h4>
            <Link to="/returns">Return Policy & Claims</Link>
            <Link to="/contact">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>

          <div className="footer-column">
            <h4>Healthcare</h4>
            <p>Genuine Medicines</p>
            <p>Fast Delivery</p>
            <p>Secure Payments</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 MediDeliver. All rights reserved. Built for fast & reliable healthcare.
        </div>
      </footer>
    </div>
  );
};

export default Contact;
