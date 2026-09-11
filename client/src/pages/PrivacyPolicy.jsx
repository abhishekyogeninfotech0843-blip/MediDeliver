import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserProfileDropdown from "../components/UserProfileDropdown";
import {
  Pill,
  ShieldCheck,
  Lock,
  FileText,
  Eye,
  CreditCard,
  UserCheck,
  Server,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  HeartHandshake,
  Building2
} from "lucide-react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="privacy-page">
      {/* ================= HEADER NAVBAR ================= */}
      <header className="privacy-header">
        <div className="privacy-header-container">
          <Link to="/" className="privacy-logo">
            <Pill className="privacy-logo-icon" />
            <span>Medi<span className="logo-accent">Deliver</span></span>
          </Link>

          <nav className="privacy-nav-links">
            <Link to="/" className="nav-item">Home</Link>
            <Link to="/medicines" className="nav-item">Shop Medicines</Link>
            <Link to="/returns" className="nav-item">Return Medicine</Link>
            <Link to="/contact" className="nav-item">Contact Us</Link>
            <Link to="/privacy-policy" className="nav-item active">Privacy Policy</Link>
          </nav>

          <div className="privacy-header-actions">
            <button
              type="button"
              className="orders-back-btn"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              title="Go back"
            >
              <ArrowLeft className="back-ic" />
              <span>Back</span>
            </button>

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
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <div className="privacy-hero-badge">
            <ShieldCheck className="badge-icon" />
            <span>HEALTHCARE DATA PROTECTION & PRIVACY STANDARDS</span>
          </div>
          <h1>MediDeliver <span>Privacy Policy</span></h1>
          <p>
            Your health and personal data security is our utmost priority. Learn how MediDeliver collects, utilizes, protects, and handles your medical information and prescriptions in accordance with Indian Digital Health & IT laws.
          </p>
          <div className="policy-meta-tags">
            <span className="meta-tag"><Clock className="tag-ico" /> Effective Date: September 2026</span>
            <span className="meta-tag"><Lock className="tag-ico" /> 256-Bit SSL Encrypted</span>
            <span className="meta-tag"><CheckCircle2 className="tag-ico" /> Verified Pharmacist Compliance</span>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <div className="privacy-container">
        {/* TRUST HIGHLIGHT STRIP */}
        <div className="trust-pills-strip">
          <div className="trust-pill-card">
            <div className="pill-icon-box green">
              <Lock className="pill-ico" />
            </div>
            <div>
              <strong>End-to-End Encryption</strong>
              <small>Prescriptions & user data encrypted in transit and at rest.</small>
            </div>
          </div>

          <div className="trust-pill-card">
            <div className="pill-icon-box blue">
              <Eye className="pill-ico" />
            </div>
            <div>
              <strong>No Third-Party Ad Selling</strong>
              <small>We strictly NEVER sell your personal or medical data to advertisers.</small>
            </div>
          </div>

          <div className="trust-pill-card">
            <div className="pill-icon-box purple">
              <CreditCard className="pill-ico" />
            </div>
            <div>
              <strong>PCI-DSS Compliant Payments</strong>
              <small>Secure payments processed via certified Razorpay gateways.</small>
            </div>
          </div>

          <div className="trust-pill-card">
            <div className="pill-icon-box teal">
              <UserCheck className="pill-ico" />
            </div>
            <div>
              <strong>Full User Control</strong>
              <small>Easy access to update or request deletion of your profile data.</small>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: SIDEBAR NAV + CONTENT */}
        <div className="privacy-layout">
          {/* SIDEBAR NAVIGATION */}
          <aside className="privacy-sidebar">
            <div className="sidebar-sticky-box">
              <h3>Table of Contents</h3>
              <ul className="sidebar-nav-list">
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "overview" ? "active" : ""}`}
                    onClick={() => scrollToSection("overview")}
                  >
                    <span>1. Overview & Commitment</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "data-collected" ? "active" : ""}`}
                    onClick={() => scrollToSection("data-collected")}
                  >
                    <span>2. Information We Collect</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "prescription-privacy" ? "active" : ""}`}
                    onClick={() => scrollToSection("prescription-privacy")}
                  >
                    <span>3. Prescription & Health Data</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "how-we-use" ? "active" : ""}`}
                    onClick={() => scrollToSection("how-we-use")}
                  >
                    <span>4. How We Use Information</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "data-sharing" ? "active" : ""}`}
                    onClick={() => scrollToSection("data-sharing")}
                  >
                    <span>5. Data Sharing & Third Parties</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "payment-security" ? "active" : ""}`}
                    onClick={() => scrollToSection("payment-security")}
                  >
                    <span>6. Payment & Financial Security</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "cookies" ? "active" : ""}`}
                    onClick={() => scrollToSection("cookies")}
                  >
                    <span>7. Cookies & Tracking</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "user-rights" ? "active" : ""}`}
                    onClick={() => scrollToSection("user-rights")}
                  >
                    <span>8. Your Rights & Data Retention</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`nav-btn ${activeSection === "grievance" ? "active" : ""}`}
                    onClick={() => scrollToSection("grievance")}
                  >
                    <span>9. Grievance Redressal Officer</span>
                    <ChevronRight className="chev-ico" />
                  </button>
                </li>
              </ul>

              {/* QUICK CONTACT BOX */}
              <div className="sidebar-help-card">
                <HeartHandshake className="help-card-ico" />
                <strong>Need Privacy Assistance?</strong>
                <p>Have questions about your health records or account?</p>
                <Link to="/contact" className="sidebar-contact-btn">
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN ARTICLES */}
          <main className="privacy-articles">
            {/* SECTION 1 */}
            <article id="overview" className="policy-section">
              <div className="section-number-badge">SECTION 01</div>
              <h2>Overview & Commitment to Privacy</h2>
              <p>
                Welcome to <strong>MediDeliver</strong> ("we", "our", or "us"). We operate an online pharmaceutical delivery marketplace and healthcare fulfillment service. We recognize that medical information is deeply personal and sensitive. This Privacy Policy outlines our uncompromising dedication to safeguarding your identity, medical prescriptions, location data, and financial transactions.
              </p>
              <p>
                By accessing our website, mobile interface, or using our medicine delivery services, you acknowledge that you have read and understood the terms of this Privacy Policy and consent to the collection and use of your data as described herein.
              </p>
            </article>

            {/* SECTION 2 */}
            <article id="data-collected" className="policy-section">
              <div className="section-number-badge">SECTION 02</div>
              <h2>Information We Collect</h2>
              <p>To provide seamless and safe medicine delivery, we collect the following categories of information:</p>

              <div className="info-cards-list">
                <div className="info-detail-box">
                  <h4>1. Personal & Contact Information</h4>
                  <p>Full name, mobile phone number, email address, and account login credentials.</p>
                </div>

                <div className="info-detail-box">
                  <h4>2. Delivery Address & Geolocation Data</h4>
                  <p>Delivery house/flat address, landmark, PIN code, and GPS coordinates provided by you to enable express 15-45 minute doorstep delivery.</p>
                </div>

                <div className="info-detail-box">
                  <h4>3. Medical & Doctor Prescriptions</h4>
                  <p>Prescription images, doctor's name, patient name, prescribed medication dosages, and order claim notes uploaded for verification.</p>
                </div>

                <div className="info-detail-box">
                  <h4>4. Order History & Billing Records</h4>
                  <p>Ordered medicine names, quantities, invoice numbers, return requests, and Razorpay payment transaction identifiers.</p>
                </div>
              </div>
            </article>

            {/* SECTION 3 */}
            <article id="prescription-privacy" className="policy-section">
              <div className="section-number-badge">SECTION 03</div>
              <h2>Doctor Prescription & Health Data Confidentiality</h2>
              <div className="highlight-callout green">
                <ShieldCheck className="callout-icon" />
                <div>
                  <strong>Doctor-Patient Privilege & Pharmacist Verification</strong>
                  <p>
                    Prescriptions uploaded to MediDeliver are accessed exclusively by licensed and registered pharmacists for the sole purpose of verifying medication authenticity, dosage accuracy, and fulfilling legally compliant pharmacy orders.
                  </p>
                </div>
              </div>
              <p>
                We do not index or expose medical prescriptions to non-authorized third parties. All uploaded prescription images are encrypted using industry-standard AES-256 encryption protocols.
              </p>
            </article>

            {/* SECTION 4 */}
            <article id="how-we-use" className="policy-section">
              <div className="section-number-badge">SECTION 04</div>
              <h2>How We Use Your Information</h2>
              <p>We use your data strictly for legitimate healthcare and order fulfillment operations:</p>
              <ul className="policy-bullet-list">
                <li><strong>Order Processing & Fulfillment:</strong> Verifying order details, coordinating with certified inventory hubs, and dispatching medicines to your saved address.</li>
                <li><strong>Prescription Validation:</strong> Ensuring compliance with the Drugs and Cosmetics Act and pharmacy regulations.</li>
                <li><strong>Customer Support & Return Management:</strong> Responding to tickets, tracking claims, and processing refunds for return claims.</li>
                <li><strong>Delivery Notifications:</strong> Sending SMS/Email alerts regarding order confirmation, dispatch, out-for-delivery updates, and OTPs.</li>
                <li><strong>Platform Security & Fraud Prevention:</strong> Preventing malicious activity, bot attacks, and fraudulent payment claims.</li>
              </ul>
            </article>

            {/* SECTION 5 */}
            <article id="data-sharing" className="policy-section">
              <div className="section-number-badge">SECTION 05</div>
              <h2>Data Sharing & Third-Party Disclosure</h2>
              <p>
                MediDeliver maintains a strict zero-compromise policy regarding user privacy:
              </p>
              <div className="policy-table-wrapper">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Entity</th>
                      <th>Purpose of Sharing</th>
                      <th>Data Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Licensed Chemists / Fulfillment Hubs</strong></td>
                      <td>Packaging genuine medicines and verifying batch codes.</td>
                      <td>Prescription, Medicine Name, Patient Name</td>
                    </tr>
                    <tr>
                      <td><strong>Delivery Fleet Partners</strong></td>
                      <td>Doorstep delivery of ordered items.</td>
                      <td>Customer Name, Delivery Address, Contact Number</td>
                    </tr>
                    <tr>
                      <td><strong>Razorpay Payment Gateway</strong></td>
                      <td>Processing encrypted online transactions and refunds.</td>
                      <td>Order Amount, Transaction Ref, User Email</td>
                    </tr>
                    <tr>
                      <td><strong>Government / Legal Authorities</strong></td>
                      <td>Only if mandated by applicable law or judicial court order.</td>
                      <td>As specified by statutory warrant</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* SECTION 6 */}
            <article id="payment-security" className="policy-section">
              <div className="section-number-badge">SECTION 06</div>
              <h2>Payment Security & Financial Information</h2>
              <p>
                All online transactions on MediDeliver are processed through <strong>Razorpay</strong>, an RBI-authorized and PCI-DSS Level 1 compliant payment gateway partner.
              </p>
              <div className="highlight-callout blue">
                <Lock className="callout-icon" />
                <div>
                  <strong>No Card Data Stored On Our Servers</strong>
                  <p>
                    MediDeliver does not collect, store, or have access to your full credit/debit card numbers, CVVs, net-banking passwords, or UPI MPINs. All sensitive financial exchanges take place directly through bank-grade 256-bit SSL encrypted channels.
                  </p>
                </div>
              </div>
            </article>

            {/* SECTION 7 */}
            <article id="cookies" className="policy-section">
              <div className="section-number-badge">SECTION 07</div>
              <h2>Cookies & Browser Storage</h2>
              <p>
                We use browser session tokens and local storage solely to keep you securely logged in, remember your selected delivery zone/address, and maintain items in your active shopping cart. You can manage or disable cookies via your browser settings at any time.
              </p>
            </article>

            {/* SECTION 8 */}
            <article id="user-rights" className="policy-section">
              <div className="section-number-badge">SECTION 08</div>
              <h2>Your Rights & Data Retention</h2>
              <p>As a MediDeliver user, you have complete sovereignty over your information:</p>
              <ul className="policy-bullet-list">
                <li><strong>Access & Review:</strong> You can view your past orders, delivery addresses, and personal profile details from the Profile and My Orders sections.</li>
                <li><strong>Correction & Updates:</strong> You may edit your contact details and delivery location at any time.</li>
                <li><strong>Account Deletion:</strong> You have the right to request deletion of your account and associated personal data by contacting our grievance officer.</li>
                <li><strong>Data Retention:</strong> We retain order invoices and tax records for the statutory period required by Indian taxation and pharmacy laws.</li>
              </ul>
            </article>

            {/* SECTION 9 */}
            <article id="grievance" className="policy-section">
              <div className="section-number-badge">SECTION 09</div>
              <h2>Grievance Redressal Officer & Contact Details</h2>
              <p>
                In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules, the name and contact details of our Grievance Officer are provided below:
              </p>

              <div className="officer-contact-card">
                <div className="officer-header">
                  <div className="officer-avatar">
                    <UserCheck className="off-ico" />
                  </div>
                  <div>
                    <h4>Grievance Redressal Officer</h4>
                    <span>MediDeliver Health Technologies Private Limited</span>
                  </div>
                </div>

                <div className="officer-grid">
                  <div className="off-item">
                    <Mail className="off-svg" />
                    <div>
                      <small>Official Grievance Email</small>
                      <a href="mailto:privacy@medideliver.in">privacy@medideliver.in</a>
                    </div>
                  </div>

                  <div className="off-item">
                    <Phone className="off-svg" />
                    <div>
                      <small>Helpline Number</small>
                      <a href="tel:+918171915305">+91 81719 15305 / +91 94571 55186</a>
                    </div>
                  </div>

                  <div className="off-item">
                    <Building2 className="off-svg" />
                    <div>
                      <small>Registered Office Address</small>
                      <span>MediDeliver Healthcare Hub, Ramghat Road, Aligarh, UP - 202001, India</span>
                    </div>
                  </div>

                  <div className="off-item">
                    <Clock className="off-svg" />
                    <div>
                      <small>Response Time Commitment</small>
                      <strong>Acknowledgment within 24 hours; Resolution within 48-72 hours</strong>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </main>
        </div>
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

export default PrivacyPolicy;
