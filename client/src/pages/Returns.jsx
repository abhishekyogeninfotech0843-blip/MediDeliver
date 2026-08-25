import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
import {
  Pill,
  RotateCcw,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Package,
  Search,
  ArrowRight,
  XCircle,
  Image as ImageIcon,
  Loader2,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import "./Returns.css";

const REASON_OPTIONS = [
  "Wrong Medicine Delivered",
  "Damaged / Expired Product",
  "Package Tampered",
  "Ordered by Mistake",
  "Other Issue"
];

const Returns = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("submit"); // 'submit' | 'track'

  // Submit Form State
  const [formData, setFormData] = useState({
    billNumber: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    medicineName: "",
    returnReason: "Wrong Medicine Delivered",
    explanation: "",
  });
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Tracking State
  const [trackInput, setTrackInput] = useState("");
  const [trackingResults, setTrackingResults] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData((prev) => ({
          ...prev,
          customerName: parsed.name || "",
          customerEmail: parsed.email || "",
          customerPhone: parsed.phone || "",
        }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please upload a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError("Image size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result);
      setProofPreview(reader.result);
      setSubmitError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProofImage(null);
    setProofPreview(null);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    if (!formData.billNumber.trim()) {
      setSubmitError("Please enter your Bill Number / Order ID");
      return;
    }
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setSubmitError("Please enter your name and phone number");
      return;
    }
    if (!formData.explanation.trim()) {
      setSubmitError("Please provide a detailed explanation of the issue");
      return;
    }
    if (!proofImage) {
      setSubmitError("Please upload photo proof showing the medicine fault");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const response = await api.post("/returns", {
        ...formData,
        proofImage,
      });

      if (response.data.success) {
        setSubmitSuccess(response.data.returnRequest);
        setFormData({
          billNumber: "",
          customerName: user?.name || "",
          customerEmail: user?.email || "",
          customerPhone: user?.phone || "",
          medicineName: "",
          returnReason: "Wrong Medicine Delivered",
          explanation: "",
        });
        setProofImage(null);
        setProofPreview(null);
      } else {
        setSubmitError(response.data.message || "Failed to submit return request");
      }
    } catch (err) {
      console.error("Return Submit Error:", err);
      setSubmitError(err.response?.data?.message || "Server error while submitting return");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackReturn = async (e) => {
    e?.preventDefault();
    if (!trackInput.trim()) {
      setTrackError("Please enter a Bill Number or Mobile Number");
      return;
    }

    try {
      setTrackingLoading(true);
      setTrackError("");
      setTrackingResults([]);

      const response = await api.get(`/returns/track/${encodeURIComponent(trackInput.trim())}`);
      if (response.data.success) {
        setTrackingResults(response.data.returns || []);
      } else {
        setTrackError(response.data.message || "No return request found");
      }
    } catch (err) {
      console.error("Track Error:", err);
      setTrackError(err.response?.data?.message || "No return request found for this Bill Number");
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <span className="status-badge approved"><CheckCircle2 className="st-ic" /> Approved (Pickup Scheduled)</span>;
      case "REJECTED":
        return <span className="status-badge rejected"><XCircle className="st-ic" /> Request Rejected</span>;
      case "REFUNDED":
        return <span className="status-badge refunded"><ShieldCheck className="st-ic" /> Refund Processed</span>;
      default:
        return <span className="status-badge pending"><Clock className="st-ic" /> Under Review</span>;
    }
  };

  return (
    <div className="returns-page">
      {/* NAVBAR */}
      <header className="returns-navbar">
        <div className="returns-nav-container">
          <Link to="/" className="returns-logo">
            <div className="ret-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

          <div className="nav-returns-badge">
            <RotateCcw className="ret-badge-icon" />
            <span>Medicine Returns Center</span>
          </div>

          <UserProfileDropdown user={user} />
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="returns-hero">
        <div className="hero-content">
          <span className="hero-tag">GUARANTEED SAFE HEALTHCARE</span>
          <h1>Medicine Return & Replacement</h1>
          <p>
            Received wrong medicine, damaged box, or incorrect prescription? Fill out the bill details and upload photo proof for 100% free return & replacement.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="returns-main">
        {/* TABS */}
        <div className="returns-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "submit" ? "active" : ""}`}
            onClick={() => setActiveTab("submit")}
          >
            <RotateCcw className="tab-icon" />
            <span>Submit Return Request</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "track" ? "active" : ""}`}
            onClick={() => setActiveTab("track")}
          >
            <Search className="tab-icon" />
            <span>Track Return Status</span>
          </button>
        </div>

        {/* TAB 1: SUBMIT RETURN FORM */}
        {activeTab === "submit" && (
          <div className="tab-content-card">
            {submitSuccess ? (
              <div className="submit-success-box">
                <div className="success-icon-badge">
                  <CheckCircle2 className="suc-svg" />
                </div>
                <h2>Return Request Registered!</h2>
                <p>
                  Your return request for Bill Number <strong>{submitSuccess.billNumber}</strong> has been logged. Our pharmacy inspector is reviewing your proof image.
                </p>

                <div className="ticket-summary">
                  <div className="summary-row">
                    <span>Return Ticket ID:</span>
                    <strong>{submitSuccess._id}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Bill / Order ID:</span>
                    <strong>{submitSuccess.billNumber}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Status:</span>
                    {getStatusBadge(submitSuccess.status)}
                  </div>
                </div>

                <div className="success-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => {
                      setTrackInput(submitSuccess.billNumber);
                      setActiveTab("track");
                      setSubmitSuccess(null);
                    }}
                  >
                    <span>Track Status Live</span>
                    <ArrowRight className="btn-ic" />
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setSubmitSuccess(null)}
                  >
                    Submit Another Return
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="return-form">
                <div className="form-header">
                  <h3>Submit Medicine Return</h3>
                  <p>Provide bill details and proof image showing the issue</p>
                </div>

                {submitError && (
                  <div className="error-alert-box">
                    <AlertCircle className="err-ic" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="form-grid">
                  {/* BILL NUMBER */}
                  <div className="form-group">
                    <label>Bill Number / Order ID *</label>
                    <div className="input-with-icon">
                      <FileText className="inp-icon" />
                      <input
                        type="text"
                        name="billNumber"
                        placeholder="e.g. BILL-98214 or ORD-10928"
                        value={formData.billNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* MEDICINE NAME */}
                  <div className="form-group">
                    <label>Medicine Name (Optional)</label>
                    <div className="input-with-icon">
                      <Pill className="inp-icon" />
                      <input
                        type="text"
                        name="medicineName"
                        placeholder="e.g. Paracetamol 500mg, Amoxicillin"
                        value={formData.medicineName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* CUSTOMER NAME */}
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      placeholder="Your full name"
                      value={formData.customerName}
                      onChange={handleChange}
                    />
                  </div>

                  {/* PHONE NUMBER */}
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      placeholder="10 digit mobile number"
                      value={formData.customerPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* REASON DROPDOWN */}
                <div className="form-group full-width">
                  <label>Reason for Return *</label>
                  <select
                    name="returnReason"
                    value={formData.returnReason}
                    onChange={handleChange}
                  >
                    {REASON_OPTIONS.map((r, i) => (
                      <option key={i} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EXPLANATION */}
                <div className="form-group full-width">
                  <label>Detailed Explanation of the Problem *</label>
                  <textarea
                    name="explanation"
                    rows="3"
                    placeholder="Describe what is wrong with the delivered medicine (e.g., received wrong tablets, package was broken, expired date on box)..."
                    value={formData.explanation}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* PROOF UPLOAD */}
                <div className="form-group full-width">
                  <label>Upload Proof Photo (Fault / Wrong Product Image) *</label>
                  {proofPreview ? (
                    <div className="image-preview-container">
                      <img src={proofPreview} alt="Proof Preview" className="proof-img-preview" />
                      <div className="preview-overlay">
                        <span>Proof Photo Uploaded</span>
                        <button type="button" className="remove-img-btn" onClick={handleRemoveImage}>
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="upload-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden-file-input"
                      />
                      <Upload className="drop-icon" />
                      <strong>Click to upload proof photo</strong>
                      <small>Attach clear photo of the wrong/faulty medicine package (Max 10MB)</small>
                    </label>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="submit-return-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="btn-spin" />
                      <span>Submitting Return Request...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="btn-ic" />
                      <span>Submit Return Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TRACK RETURN STATUS */}
        {activeTab === "track" && (
          <div className="tab-content-card">
            <div className="track-header">
              <h3>Track Your Medicine Return</h3>
              <p>Enter your Bill Number or registered Mobile Number to check status</p>
            </div>

            <form onSubmit={handleTrackReturn} className="track-search-form">
              <div className="track-input-wrapper">
                <Search className="tr-icon" />
                <input
                  type="text"
                  placeholder="Enter Bill Number (e.g. BILL-98214) or Phone Number"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                />
                <button type="submit" className="track-submit-btn" disabled={trackingLoading}>
                  {trackingLoading ? <Loader2 className="btn-spin" /> : "Track"}
                </button>
              </div>
            </form>

            {trackError && (
              <div className="error-alert-box">
                <AlertCircle className="err-ic" />
                <span>{trackError}</span>
              </div>
            )}

            {/* TRACKING RESULTS */}
            {trackingResults.length > 0 && (
              <div className="tracking-results-list">
                <h4>Found {trackingResults.length} Return Request(s)</h4>

                {trackingResults.map((item) => (
                  <div key={item._id} className="track-card">
                    <div className="track-card-header">
                      <div>
                        <span className="bill-badge">Bill #{item.billNumber}</span>
                        <small className="date-text">
                          {new Date(item.createdAt).toLocaleString()}
                        </small>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="track-card-body">
                      <div className="track-info-col">
                        <p><strong>Customer:</strong> {item.customerName} ({item.customerPhone})</p>
                        <p><strong>Reason:</strong> {item.returnReason}</p>
                        <p><strong>Medicine:</strong> {item.medicineName || "N/A"}</p>
                        <p className="exp-text"><strong>Issue Note:</strong> {item.explanation}</p>
                        
                        {item.adminNotes && (
                          <div className="admin-note-box">
                            <strong>Pharmacy Response:</strong>
                            <p>{item.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {item.proofImage && (
                        <div className="track-proof-box">
                          <small>Proof Photo:</small>
                          <img src={item.proofImage} alt="Proof" className="track-proof-thumb" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Returns;
