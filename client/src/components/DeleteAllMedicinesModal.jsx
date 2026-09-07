import React, { useState } from "react";
import { AlertTriangle, Trash2, X, ShieldAlert } from "lucide-react";
import api from "../api/api";
import "./DeleteAllMedicinesModal.css";

const DeleteAllMedicinesModal = ({ isOpen, count, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleDeleteAll = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.delete("/medicines/all/clear");
      if (response.data.success) {
        alert("🗑️ All medicines deleted successfully from database.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(response.data.message || "Failed to delete all medicines.");
      }
    } catch (err) {
      console.error("Delete All API Error:", err);
      // Try fallback route
      try {
        await api.delete("/medicines");
        alert("🗑️ All medicines deleted successfully.");
        if (onSuccess) onSuccess();
        onClose();
      } catch (innerErr) {
        setError(err.response?.data?.message || "Failed to delete medicines from server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="del-all-overlay" onClick={onClose}>
      <div className="del-all-modal" onClick={(e) => e.stopPropagation()}>
        <div className="del-all-header">
          <div className="del-all-icon-circle">
            <ShieldAlert className="del-shield-icon" />
          </div>
          <button type="button" className="close-del-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="del-all-body">
          <h2>Delete All Medicines?</h2>
          <p className="del-subtext">
            (सभी दवाइयां Catalog / Database से हटाएं)
          </p>

          <div className="del-warning-box">
            <AlertTriangle className="del-warn-icon" />
            <div>
              <strong>Dangerous Action (खतरनाक कदम):</strong>
              <p>
                This will permanently remove <strong>all {count} medicines</strong> from the catalog.
                Customers will not be able to browse or order any medicines until you add new ones.
              </p>
            </div>
          </div>

          {error && <div className="del-err-msg">{error}</div>}
        </div>

        <div className="del-all-actions">
          <button
            type="button"
            className="del-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel (रद्द करें)
          </button>

          <button
            type="button"
            className="del-confirm-btn"
            onClick={handleDeleteAll}
            disabled={loading}
          >
            <Trash2 className="del-btn-icon" />
            <span>{loading ? "Deleting Catalog..." : `Yes, Delete All (${count})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAllMedicinesModal;
