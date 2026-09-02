import React, { useState, useEffect } from "react";
import {
  Pill,
  X,
  Save,
  Trash2,
  AlertTriangle,
  Package,
  Calendar,
  Tag,
  Building2,
  DollarSign,
  Plus,
  Minus
} from "lucide-react";
import api from "../api/api";
import "./EditMedicineModal.css";

const EditMedicineModal = ({ isOpen, onClose, medicine, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    company: "Cipla Ltd",
    customCompany: "",
    category: "Medicines",
    batchNumber: "",
    expiryDate: "",
    purchasePrice: "",
    sellingPrice: "",
    stock: "0",
    minimumStock: "10",
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (medicine) {
      const formattedExpiry = medicine.expiryDate
        ? new Date(medicine.expiryDate).toISOString().split("T")[0]
        : "";

      setFormData({
        name: medicine.name || "",
        company: medicine.company || "Cipla Ltd",
        customCompany: "",
        category: medicine.category || "Medicines",
        batchNumber: medicine.batchNumber || "",
        expiryDate: formattedExpiry,
        purchasePrice: medicine.purchasePrice || "",
        sellingPrice: medicine.sellingPrice || "",
        stock: medicine.stock !== undefined ? String(medicine.stock) : "0",
        minimumStock: medicine.minimumStock !== undefined ? String(medicine.minimumStock) : "10",
        image: medicine.image || "",
      });
      setError("");
    }
  }, [medicine]);

  if (!isOpen || !medicine) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStockAdjust = (amount) => {
    const currentStock = parseInt(formData.stock, 10) || 0;
    const newStock = Math.max(0, currentStock + amount);
    setFormData((prev) => ({ ...prev, stock: String(newStock) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.sellingPrice) {
      setError("Medicine name and selling price are required.");
      return;
    }

    const companyName =
      formData.company === "Custom" ? formData.customCompany || "Generic" : formData.company;

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        company: companyName,
        category: formData.category,
        batchNumber: formData.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stock: Number(formData.stock) || 0,
        minimumStock: Number(formData.minimumStock) || 10,
        image: formData.image || "",
      };

      const response = await api.put(`/medicines/${medicine._id}`, payload);

      if (response.data.success) {
        alert(`" ${formData.name} " updated successfully! 🎉`);
        if (onSuccess) onSuccess(response.data.medicine || payload);
        onClose();
      } else {
        setError(response.data.message || "Failed to update medicine.");
      }
    } catch (err) {
      console.error("Update Medicine Error:", err);
      setError(err.response?.data?.message || "Failed to update medicine details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${formData.name}" from catalog?`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await api.delete(`/medicines/${medicine._id}`);
      if (response.data.success) {
        alert("Medicine deleted successfully!");
        if (onSuccess) onSuccess(null, medicine._id);
        onClose();
      }
    } catch (err) {
      console.error("Delete Medicine Error:", err);
      alert("Failed to delete medicine.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="edit-med-overlay" onClick={onClose}>
      <div className="edit-med-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="edit-med-header">
          <div className="header-title-box">
            <div className="edit-pill-icon">
              <Pill className="p-icon" />
            </div>
            <div>
              <h2>Edit Medicine & Stock</h2>
              <p>Update batch number, stock count, expiry date and prices (Admin Only)</p>
            </div>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        {error && (
          <div className="edit-med-error">
            <AlertTriangle className="err-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-med-form">
          {/* MEDICINE NAME */}
          <div className="edit-form-group">
            <label>Medicine Name (दवाई का नाम) *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Nucoxia 60mg, Oxalgin DP"
            />
          </div>

          {/* CATEGORY & COMPANY */}
          <div className="edit-form-row">
            <div className="edit-form-group flex-1">
              <label>Category (कैटेगरी)</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Medicines">Medicines</option>
                <option value="Diabetes Care">Diabetes Care</option>
                <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Baby Care">Baby Care</option>
                <option value="Heart Care">Heart Care</option>
              </select>
            </div>

            <div className="edit-form-group flex-1">
              <label>Company / Brand (कंपनी का नाम)</label>
              <select name="company" value={formData.company} onChange={handleChange}>
                <option value="Zydus Cadila">Zydus Cadila</option>
                <option value="Cipla Ltd">Cipla Ltd</option>
                <option value="Sun Pharma">Sun Pharma</option>
                <option value="Dr. Reddy's">Dr. Reddy's</option>
                <option value="Lupin">Lupin</option>
                <option value="Abbott">Abbott</option>
                <option value="Micro Labs Ltd">Micro Labs Ltd</option>
                <option value="Himalaya Wellness">Himalaya Wellness</option>
                <option value="Dabur India">Dabur India</option>
                <option value="HealthKart">HealthKart</option>
                <option value="Custom">+ Other Company (Custom)</option>
              </select>
            </div>
          </div>

          {formData.company === "Custom" && (
            <div className="edit-form-group">
              <label>Custom Company Name</label>
              <input
                type="text"
                name="customCompany"
                value={formData.customCompany}
                onChange={handleChange}
                placeholder="Enter Company Name"
              />
            </div>
          )}

          {/* STOCK CONTROL SECTION */}
          <div className="stock-control-card">
            <div className="stock-card-header">
              <Package className="stock-box-icon" />
              <div>
                <span className="stock-card-title">Stock Quantity (स्टॉक संख्या)</span>
                <span className="stock-card-sub">Quickly update stock when inventory arrives or sells out</span>
              </div>
            </div>

            <div className="stock-input-row">
              <div className="stock-stepper">
                <button
                  type="button"
                  className="step-btn minus-btn"
                  onClick={() => handleStockAdjust(-1)}
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
                  onClick={() => handleStockAdjust(1)}
                >
                  <Plus />
                </button>
              </div>

              <div className="stock-quick-actions">
                <button type="button" onClick={() => handleStockAdjust(10)}>
                  +10 Stock
                </button>
                <button type="button" onClick={() => handleStockAdjust(50)}>
                  +50 Stock
                </button>
                <button type="button" onClick={() => setFormData((prev) => ({ ...prev, stock: "0" }))} className="zero-btn">
                  Set 0 (Out of Stock)
                </button>
              </div>
            </div>
          </div>

          {/* BATCH NUMBER & EXPIRY DATE */}
          <div className="edit-form-row">
            <div className="edit-form-group flex-1">
              <label>Batch Number (बैच नंबर)</label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="e.g. BATCH-ZYD-102"
              />
            </div>

            <div className="edit-form-group flex-1">
              <label>Expiry Date (एक्सपायरी तिथि)</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* PRODUCT IMAGE URL */}
          <div className="edit-form-group">
            <label>Product Image URL (दवाई की फोटो URL - Opt.)</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://... (Automatic photo will apply if left blank)"
            />
          </div>

          {/* PRICES & MINIMUM STOCK */}
          <div className="edit-form-row">
            <div className="edit-form-group flex-1">
              <label>Selling Price (₹) *</label>
              <input
                type="number"
                name="sellingPrice"
                min="0"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={handleChange}
              />
            </div>

            <div className="edit-form-group flex-1">
              <label>Purchase Price (₹)</label>
              <input
                type="number"
                name="purchasePrice"
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleChange}
              />
            </div>

            <div className="edit-form-group flex-1">
              <label>Min. Stock Alert</label>
              <input
                type="number"
                name="minimumStock"
                min="1"
                value={formData.minimumStock}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="edit-modal-actions">
            <button
              type="button"
              className="delete-med-btn"
              onClick={handleDelete}
              disabled={deleting || loading}
            >
              <Trash2 className="btn-ic" />
              <span>{deleting ? "Deleting..." : "Delete Medicine"}</span>
            </button>

            <div className="right-action-btns">
              <button type="button" className="cancel-edit-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-edit-btn" disabled={loading || deleting}>
                <Save className="btn-ic" />
                <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicineModal;
