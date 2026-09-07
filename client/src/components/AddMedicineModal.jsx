import React, { useState } from "react";
import {
  Pill,
  X,
  Plus,
  Minus,
  Save,
  Building2,
  Tag,
  Package,
  Calendar,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  IndianRupee
} from "lucide-react";
import api from "../api/api";
import "./AddMedicineModal.css";

const popularCompanies = [
  "Cipla Ltd",
  "Sun Pharma",
  "Zydus Cadila",
  "Abbott",
  "Dr. Reddy's",
  "Lupin",
  "Micro Labs Ltd",
  "Himalaya Wellness",
  "Dabur India",
  "HealthKart",
  "Custom",
];

const categoriesList = [
  "Medicines",
  "Diabetes Care",
  "Vitamins & Supplements",
  "Personal Care",
  "Baby Care",
  "Heart Care",
  "Pain Relief",
  "Skin Care",
  "Ayurveda",
];

const AddMedicineModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    company: "Cipla Ltd",
    customCompany: "",
    category: "Medicines",
    batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
      .toISOString()
      .split("T")[0],
    purchasePrice: "",
    sellingPrice: "",
    stock: "50",
    minimumStock: "10",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto compute purchase price as 65% of selling price if not touched
      if (name === "sellingPrice" && (!prev.purchasePrice || prev.purchasePrice === "")) {
        const num = parseFloat(value);
        if (!isNaN(num) && num > 0) {
          updated.purchasePrice = String(Math.round(num * 0.65));
        }
      }
      return updated;
    });
  };

  const handleStockAdjust = (amount) => {
    const currentStock = parseInt(formData.stock, 10) || 0;
    const newStock = Math.max(0, currentStock + amount);
    setFormData((prev) => ({ ...prev, stock: String(newStock) }));
  };

  const handleRegenerateBatch = () => {
    const newBatch = `BATCH-${Math.floor(100000 + Math.random() * 900000)}`;
    setFormData((prev) => ({ ...prev, batchNumber: newBatch }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter the medicine name.");
      return;
    }

    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      setError("Please enter a valid selling price greater than ₹0.");
      return;
    }

    const companyName =
      formData.company === "Custom"
        ? formData.customCompany.trim() || "Generic Pharma"
        : formData.company;

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        company: companyName,
        category: formData.category,
        batchNumber: formData.batchNumber.trim() || `BATCH-${Date.now().toString().slice(-6)}`,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        purchasePrice: Number(formData.purchasePrice) || Math.round(Number(formData.sellingPrice) * 0.65),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock) || 0,
        minimumStock: Number(formData.minimumStock) || 10,
        image: formData.image.trim(),
      };

      const response = await api.post("/medicines", payload);

      if (response.data.success) {
        alert(`🎉 "${formData.name}" added successfully to catalog!`);
        if (onSuccess) onSuccess(response.data.medicine || payload);
        onClose();
      } else {
        setError(response.data.message || "Failed to add medicine.");
      }
    } catch (err) {
      console.error("Add Medicine API Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to connect to server. Please check your inputs and retry."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-med-overlay" onClick={onClose}>
      <div className="add-med-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="add-med-header">
          <div className="add-header-title-box">
            <div className="add-pill-icon">
              <Pill className="add-p-icon" />
            </div>
            <div>
              <h2>Add New Medicine (दवाई जोड़ें)</h2>
              <p>Add fresh stock or new medicines to catalog (Admin Only)</p>
            </div>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        {error && (
          <div className="add-med-error">
            <AlertTriangle className="err-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-med-form">
          {/* MEDICINE NAME */}
          <div className="add-form-group">
            <label>
              Medicine Name (दवाई का नाम) <span className="req">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Azithral 500mg, Dolo 650, Combiflam"
              autoFocus
            />
          </div>

          {/* CATEGORY & COMPANY */}
          <div className="add-form-row">
            <div className="add-form-group flex-1">
              <label>
                Category (कैटेगरी) <span className="req">*</span>
              </label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-form-group flex-1">
              <label>
                Company / Brand (कंपनी) <span className="req">*</span>
              </label>
              <select name="company" value={formData.company} onChange={handleChange}>
                {popularCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c === "Custom" ? "+ Other Company (Custom)" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.company === "Custom" && (
            <div className="add-form-group custom-company-slide">
              <label>
                Custom Company Name (कंपनी का नाम लिखें) <span className="req">*</span>
              </label>
              <input
                type="text"
                name="customCompany"
                value={formData.customCompany}
                onChange={handleChange}
                placeholder="Enter pharmaceutical company name"
                required
              />
            </div>
          )}

          {/* STOCK CONTROL SECTION */}
          <div className="add-stock-control-card">
            <div className="add-stock-card-header">
              <Package className="stock-box-icon" />
              <div>
                <span className="stock-card-title">Initial Stock Quantity (स्टॉक संख्या)</span>
                <span className="stock-card-sub">
                  Set available stock units for instant order availability
                </span>
              </div>
            </div>

            <div className="add-stock-input-row">
              <div className="stock-stepper">
                <button
                  type="button"
                  className="step-btn minus-btn"
                  onClick={() => handleStockAdjust(-10)}
                  title="Reduce 10"
                >
                  <Minus />
                </button>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="stock-qty-input"
                />
                <button
                  type="button"
                  className="step-btn plus-btn"
                  onClick={() => handleStockAdjust(10)}
                  title="Add 10"
                >
                  <Plus />
                </button>
              </div>

              <div className="stock-quick-actions">
                <button type="button" onClick={() => handleStockAdjust(20)}>
                  +20 Stock
                </button>
                <button type="button" onClick={() => handleStockAdjust(50)}>
                  +50 Stock
                </button>
                <button type="button" onClick={() => handleStockAdjust(100)}>
                  +100 Stock
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, stock: "0" }))}
                  className="zero-btn"
                >
                  Set 0 (Out of stock)
                </button>
              </div>
            </div>
          </div>

          {/* PRICES & MIN STOCK */}
          <div className="add-form-row">
            <div className="add-form-group flex-1">
              <label>
                Selling Price (₹ MRP/Rate) <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <IndianRupee className="field-icon" />
                <input
                  type="number"
                  name="sellingPrice"
                  min="1"
                  step="0.01"
                  required
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  placeholder="e.g. 65"
                />
              </div>
            </div>

            <div className="add-form-group flex-1">
              <label>Purchase Price (₹ - Optional)</label>
              <div className="input-with-icon">
                <IndianRupee className="field-icon" />
                <input
                  type="number"
                  name="purchasePrice"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                />
              </div>
            </div>

            <div className="add-form-group flex-1">
              <label>Min. Stock Alert</label>
              <input
                type="number"
                name="minimumStock"
                min="1"
                value={formData.minimumStock}
                onChange={handleChange}
                placeholder="10"
              />
            </div>
          </div>

          {/* BATCH NUMBER & EXPIRY DATE */}
          <div className="add-form-row">
            <div className="add-form-group flex-1">
              <label className="label-with-action">
                <span>Batch Number (बैच नंबर)</span>
                <button
                  type="button"
                  className="regen-batch-btn"
                  onClick={handleRegenerateBatch}
                  title="Generate new batch number"
                >
                  <RefreshCw className="regen-icon" /> Auto Batch
                </button>
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="e.g. BATCH-CIP-502"
              />
            </div>

            <div className="add-form-group flex-1">
              <label>Expiry Date (एक्सपायरी तिथि)</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* PRODUCT IMAGE */}
          <div className="add-form-group">
            <label>Product Image URL (Optional - दवा की फोटो)</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://... (Leave blank for default high-res pill icon)"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="add-modal-actions">
            <button type="button" className="cancel-add-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-add-btn" disabled={loading}>
              <Plus className="btn-ic" />
              <span>{loading ? "Adding to Catalog..." : "Add Medicine to Catalog"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineModal;
