import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  Check,
  Pill,
} from "lucide-react";
import "./UploadPrescriptionModal.css";

const UploadPrescriptionModal = ({ isOpen, onClose, user, deliveryLocation }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileBase64, setFileBase64] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Status & Success State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Pre-fill user data whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSubmittedOrder(null);

      if (user) {
        setPatientName(user.name || "");
        setPatientPhone(user.phone || "");
        setPatientEmail(user.email || "");
      }

      // Pre-fill address from deliveryLocation or user profile
      if (deliveryLocation) {
        const fullAddr = [
          deliveryLocation.area,
          deliveryLocation.landmark,
          deliveryLocation.city,
          deliveryLocation.pincode ? `PIN: ${deliveryLocation.pincode}` : "",
        ]
          .filter(Boolean)
          .join(", ");
        setDeliveryAddress(fullAddr || deliveryLocation.address || "");
      } else if (user?.address) {
        setDeliveryAddress(user.address);
      }
    }
  }, [isOpen, user, deliveryLocation]);

  if (!isOpen) return null;

  // Process File Selection
  const handleFileProcess = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a JPG, PNG, or PDF file.");
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("File size should be less than 8 MB.");
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);

    // Generate preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileProcess(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileBase64("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit Prescription Order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFile && !prescriptionNotes.trim()) {
      setErrorMessage("Please upload a prescription image/PDF or enter medicine requirements.");
      return;
    }

    if (!patientName.trim()) {
      setErrorMessage("Please enter patient/customer name.");
      return;
    }

    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage("Please enter delivery address in Aligarh.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer: user?._id || null,
        customerName: patientName.trim(),
        customerPhone: patientPhone.trim(),
        customerEmail: patientEmail.trim() || user?.email || "",
        deliveryAddress: deliveryAddress.trim(),
        prescriptionImage: fileBase64 || "",
        prescriptionFileName: selectedFile?.name || "Doctor_Prescription.jpg",
        prescriptionNotes: prescriptionNotes.trim(),
        doctorName: doctorName.trim(),
        paymentMethod: "COD",
        deliveryDistance: 3.5,
      };

      const response = await api.post("/orders/prescription", payload);

      if (response.data?.success && response.data?.order) {
        setSubmittedOrder(response.data.order);
      } else {
        setErrorMessage(response.data?.message || "Failed to submit prescription.");
      }
    } catch (err) {
      console.error("Prescription upload error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Could not send prescription to pharmacy admin. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToOrders = () => {
    onClose();
    navigate("/my-orders");
  };

  return (
    <div className="rx-modal-backdrop" onClick={onClose}>
      <div className="rx-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="rx-modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X className="close-icon-svg" />
        </button>

        {/* ================= SUCCESS STATE ================= */}
        {submittedOrder ? (
          <div className="rx-success-state">
            <div className="rx-success-icon-wrap">
              <CheckCircle2 className="rx-success-check-svg" />
            </div>

            <span className="rx-success-badge">PRESCRIPTION RECEIVED BY PHARMACY</span>

            <h2>Order Placed with Admin!</h2>
            <p className="rx-success-desc">
              Your prescription order <strong>#{submittedOrder.trackingId || submittedOrder._id?.slice(-6).toUpperCase()}</strong> has reached our central pharmacy admin.
            </p>

            <div className="rx-summary-card">
              <div className="rx-summary-row">
                <span>Patient Name:</span>
                <strong>{submittedOrder.customerName || patientName}</strong>
              </div>
              <div className="rx-summary-row">
                <span>Contact Number:</span>
                <strong>📞 {submittedOrder.customerPhone || patientPhone}</strong>
              </div>
              <div className="rx-summary-row">
                <span>Delivery Address:</span>
                <span className="rx-summary-addr">{submittedOrder.deliveryAddress || deliveryAddress}</span>
              </div>
              <div className="rx-summary-row">
                <span>Pharmacist Status:</span>
                <strong className="status-highlight">📋 Under Pharmacist Review (30-45 mins)</strong>
              </div>
            </div>

            <div className="rx-success-notice">
              <Clock className="notice-icon-svg" />
              <div>
                <strong>What happens next?</strong>
                <p>
                  Our certified pharmacist will review the prescription, verify dosages & medicine stock, and call you at <strong>{patientPhone}</strong> to confirm the items before dispatch.
                </p>
              </div>
            </div>

            <div className="rx-success-actions">
              <button type="button" className="rx-primary-btn" onClick={handleGoToOrders}>
                <span>Track in My Orders</span>
                <ArrowRight className="btn-arrow-svg" />
              </button>
              <button type="button" className="rx-secondary-btn" onClick={onClose}>
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= UPLOAD FORM STATE ================= */
          <div className="rx-form-content">
            {/* HEADER */}
            <div className="rx-modal-header">
              <div className="rx-header-badge">
                <FileText className="header-badge-icon" />
                <span>24/7 PHARMACY DESK</span>
              </div>
              <h2>Upload Doctor's Prescription</h2>
              <p>
                Upload your prescription document or write required medicines. Our certified pharmacists in Aligarh will fulfill and deliver it to your doorstep.
              </p>
            </div>

            {errorMessage && (
              <div className="rx-alert-banner">
                <AlertCircle className="alert-icon-svg" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rx-upload-form">
              {/* FILE UPLOAD DROPZONE */}
              <div className="rx-form-group">
                <label className="rx-field-label">
                  <strong>Prescription Photo / PDF</strong>
                  <span className="rx-required-tag">Required</span>
                </label>

                {!selectedFile ? (
                  <div
                    className={`rx-dropzone ${isDragging ? "dragging" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="rx-dropzone-icon-box">
                      <UploadCloud className="dropzone-upload-icon" />
                    </div>
                    <div className="rx-dropzone-text">
                      <strong>Click to upload or drag & drop</strong>
                      <span>Supports JPG, PNG, WEBP or PDF (Max 8 MB)</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                      className="rx-hidden-file-input"
                      onChange={handleFileInputChange}
                    />
                  </div>
                ) : (
                  <div className="rx-selected-file-card">
                    <div className="rx-file-preview-wrap">
                      {filePreview ? (
                        <img src={filePreview} alt="Prescription preview" className="rx-file-thumb" />
                      ) : (
                        <FileText className="rx-pdf-icon" />
                      )}
                    </div>

                    <div className="rx-file-details">
                      <strong className="rx-file-name">{selectedFile.name}</strong>
                      <span className="rx-file-size">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Prescription Attached
                      </span>
                    </div>

                    <button
                      type="button"
                      className="rx-remove-file-btn"
                      onClick={handleRemoveFile}
                      title="Remove file"
                    >
                      <Trash2 className="trash-icon-svg" />
                    </button>
                  </div>
                )}
              </div>

              {/* PATIENT NAME & PHONE */}
              <div className="rx-form-row">
                <div className="rx-form-group flex-1">
                  <label className="rx-field-label">
                    <User className="label-icon-sm" />
                    <span>Patient / Your Name</span>
                    <span className="rx-required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="rx-form-group flex-1">
                  <label className="rx-field-label">
                    <Phone className="label-icon-sm" />
                    <span>Contact Number (10 Digits)</span>
                    <span className="rx-required-tag">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>

              {/* DELIVERY ADDRESS */}
              <div className="rx-form-group">
                <div className="rx-label-with-action">
                  <label className="rx-field-label">
                    <MapPin className="label-icon-sm" />
                    <span>Delivery Address (Aligarh)</span>
                    <span className="rx-required-tag">*</span>
                  </label>
                  {deliveryLocation && (
                    <button
                      type="button"
                      className="rx-use-saved-loc-btn"
                      onClick={() => {
                        const locText = [
                          deliveryLocation.area,
                          deliveryLocation.landmark,
                          deliveryLocation.city,
                          deliveryLocation.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ");
                        setDeliveryAddress(locText || "Centre Point, Aligarh");
                      }}
                    >
                      <span>📍 Use Current Location</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="House/Flat No., Street, Colony or Locality, Aligarh"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>

              {/* OPTIONAL DOCTOR & MEDICINE NOTES */}
              <div className="rx-form-row">
                <div className="rx-form-group flex-1">
                  <label className="rx-field-label">
                    <span>Doctor / Clinic Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Gupta / JNMC"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="rx-form-group">
                <label className="rx-field-label">
                  <span>Medicine Requirements / Instructions</span>
                  <small className="rx-optional-sub">(Optional)</small>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please send 2 strips of Dolo 650 and 1 bottle of Honitus syrup for 10 days"
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                />
              </div>

              {/* TRUST STRIP */}
              <div className="rx-trust-badges">
                <div className="rx-trust-item">
                  <ShieldCheck className="trust-svg-icon" />
                  <span>100% Genuine Pharmacy</span>
                </div>
                <div className="rx-trust-item">
                  <Clock className="trust-svg-icon" />
                  <span>Doorstep Delivery 30-45m</span>
                </div>
                <div className="rx-trust-item">
                  <Sparkles className="trust-svg-icon" />
                  <span>Zero Processing Fee</span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="rx-submit-actions">
                <button
                  type="submit"
                  className="rx-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Submitting to Pharmacy Admin...</span>
                  ) : (
                    <>
                      <FileText className="btn-icon-svg" />
                      <span>Upload & Order Medicines</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPrescriptionModal;
