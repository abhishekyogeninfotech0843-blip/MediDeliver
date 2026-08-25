import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/api";
import {
  Pill,
  Users,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
  Package,
  Activity,
  RotateCcw,
  Eye,
  Check,
  X,
  RefreshCw,
  MessageSquare,
  FileText,
  Plus,
  Building2
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [returns, setReturns] = useState([]);
  const [returnStats, setReturnStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, refunded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Image Lightbox state
  const [selectedProofImage, setSelectedProofImage] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  // Add Medicine Modal State
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [addingMedicine, setAddingMedicine] = useState(false);
  const [medicineForm, setMedicineForm] = useState({
    name: "",
    company: "Cipla Ltd",
    customCompany: "",
    category: "Medicines",
    batchNumber: "",
    expiryDate: "2028-12-31",
    purchasePrice: "",
    sellingPrice: "",
    stock: "100",
    minimumStock: "10",
  });

  const handleAddMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!medicineForm.name.trim()) {
      alert("Please enter medicine name");
      return;
    }
    if (!medicineForm.sellingPrice) {
      alert("Please enter selling price");
      return;
    }

    const finalCompany =
      medicineForm.company === "Custom"
        ? medicineForm.customCompany.trim() || "Generic Pharma"
        : medicineForm.company;

    const finalBatch =
      medicineForm.batchNumber.trim() ||
      `BATCH-${finalCompany.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      setAddingMedicine(true);
      const payload = {
        name: medicineForm.name.trim(),
        company: finalCompany,
        category: medicineForm.category,
        batchNumber: finalBatch,
        expiryDate: medicineForm.expiryDate || "2028-12-31",
        purchasePrice: Number(medicineForm.purchasePrice) || Math.round(Number(medicineForm.sellingPrice) * 0.5),
        sellingPrice: Number(medicineForm.sellingPrice),
        stock: Number(medicineForm.stock) || 50,
        minimumStock: Number(medicineForm.minimumStock) || 10,
      };

      const response = await api.post("/medicines", payload);

      if (response.data.success) {
        alert(`✅ Medicine "${payload.name}" added successfully!`);
        setIsAddMedicineOpen(false);
        setMedicineForm({
          name: "",
          company: "Cipla Ltd",
          customCompany: "",
          category: "Medicines",
          batchNumber: "",
          expiryDate: "2028-12-31",
          purchasePrice: "",
          sellingPrice: "",
          stock: "100",
          minimumStock: "10",
        });
        fetchDashboardData();
      } else {
        alert(response.data.message || "Failed to add medicine");
      }
    } catch (err) {
      console.error("Add Medicine Error:", err);
      alert(err.response?.data?.message || "Error adding medicine to database");
    } finally {
      setAddingMedicine(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, returnRes] = await Promise.all([
        axios.get("http://localhost:5000/api/dashboard"),
        axios.get("http://localhost:5000/api/returns").catch(() => ({ data: { success: false, returns: [], stats: {} } }))
      ]);

      if (dashRes.data.success) {
        setDashboard(dashRes.data.dashboard);
      }

      if (returnRes.data.success) {
        setReturns(returnRes.data.returns || []);
        setReturnStats(returnRes.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0, refunded: 0 });
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
      setError(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateReturnStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const note = adminNotes[id] || "";
      const response = await axios.put(`http://localhost:5000/api/returns/${id}/status`, {
        status,
        adminNotes: note
      });

      if (response.data.success) {
        alert(`Return status updated to ${status}`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Update return status error:", err);
      alert(err.response?.data?.message || "Failed to update return status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dash-spinner">
          <Pill className="dash-pill-spin" />
        </div>
        <p>Loading Pharmacy Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertTriangle className="error-svg" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title-box">
          <div className="dash-logo-icon">
            <Activity className="dash-icon" />
          </div>
          <div>
            <h1>MediDeliver Admin</h1>
            <p>Pharmacy delivery system & return management overview</p>
          </div>
        </div>

        <button
          type="button"
          className="add-med-header-btn"
          onClick={() => setIsAddMedicineOpen(true)}
        >
          <Plus className="add-icon" /> Add New Medicine
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box med">
            <Pill className="st-icon" />
          </div>
          <div>
            <h3>Total Medicines</h3>
            <div className="value">{dashboard?.totalMedicines || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box cust">
            <Users className="st-icon" />
          </div>
          <div>
            <h3>Total Customers</h3>
            <div className="value">{dashboard?.totalCustomers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box ord">
            <ShoppingBag className="st-icon" />
          </div>
          <div>
            <h3>Total Orders</h3>
            <div className="value">{dashboard?.totalOrders || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box pay">
            <CreditCard className="st-icon" />
          </div>
          <div>
            <h3>Total Payments</h3>
            <div className="value">{dashboard?.totalPayments || 0}</div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MEDICINE RETURN REQUESTS SECTION
         ========================================================= */}
      <div className="dashboard-section returns-admin-section">
        <div className="section-title-row">
          <h2>
            <RotateCcw className="sec-icon text-teal" /> Customer Medicine Returns & Fault Claims
          </h2>
          <span className="count-pill">{returns.length} Total Requests</span>
        </div>

        {/* Return Stats */}
        <div className="status-grid return-stats-grid">
          <div className="status-card placed">
            <div className="st-hdr">
              <Clock className="st-svg" /> Pending Review
            </div>
            <strong>{returnStats.pending || 0}</strong>
          </div>

          <div className="status-card confirmed">
            <div className="st-hdr">
              <CheckCircle2 className="st-svg" /> Approved Returns
            </div>
            <strong>{returnStats.approved || 0}</strong>
          </div>

          <div className="status-card delivery">
            <div className="st-hdr">
              <RotateCcw className="st-svg" /> Refunded
            </div>
            <strong>{returnStats.refunded || 0}</strong>
          </div>

          <div className="status-card cancelled">
            <div className="st-hdr">
              <XCircle className="st-svg" /> Rejected
            </div>
            <strong>{returnStats.rejected || 0}</strong>
          </div>
        </div>

        {/* Returns Table */}
        {returns.length === 0 ? (
          <div className="no-returns-card">
            <RotateCcw className="empty-ret-icon" />
            <p>No customer return requests submitted yet.</p>
          </div>
        ) : (
          <div className="returns-table-wrapper">
            <table className="returns-table">
              <thead>
                <tr>
                  <th>Bill / Order ID</th>
                  <th>Customer Info</th>
                  <th>Return Reason & Issue</th>
                  <th>Proof Photo</th>
                  <th>Status</th>
                  <th>Admin Action & Notes</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="bill-cell">
                        <strong>#{item.billNumber}</strong>
                        <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                      </div>
                    </td>
                    <td>
                      <div className="cust-cell">
                        <strong>{item.customerName}</strong>
                        <small>📞 {item.customerPhone}</small>
                        {item.customerEmail && <small>✉️ {item.customerEmail}</small>}
                      </div>
                    </td>
                    <td>
                      <div className="reason-cell">
                        <span className="reason-tag">{item.returnReason}</span>
                        {item.medicineName && <small className="med-tag">Med: {item.medicineName}</small>}
                        <p className="issue-desc">"{item.explanation}"</p>
                      </div>
                    </td>
                    <td>
                      {item.proofImage ? (
                        <button
                          type="button"
                          className="view-proof-btn"
                          onClick={() => setSelectedProofImage(item.proofImage)}
                          title="Click to enlarge proof photo"
                        >
                          <img src={item.proofImage} alt="Proof Thumbnail" className="proof-thumb" />
                          <span><Eye className="eye-sm" /> View Proof</span>
                        </button>
                      ) : (
                        <span className="no-proof">No Photo</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge-tag ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-cell">
                        <input
                          type="text"
                          placeholder="Add Note / Instructions..."
                          className="admin-note-input"
                          value={adminNotes[item._id] ?? (item.adminNotes || "")}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({ ...prev, [item._id]: e.target.value }))
                          }
                        />
                        <div className="action-btn-group">
                          <button
                            type="button"
                            className="act-btn approve"
                            disabled={updatingId === item._id}
                            onClick={() => handleUpdateReturnStatus(item._id, "APPROVED")}
                            title="Approve Return & Schedule Pickup"
                          >
                            <Check className="act-ic" /> Approve
                          </button>

                          <button
                            type="button"
                            className="act-btn refund"
                            disabled={updatingId === item._id}
                            onClick={() => handleUpdateReturnStatus(item._id, "REFUNDED")}
                            title="Mark Refund Completed"
                          >
                            <RefreshCw className="act-ic" /> Refund
                          </button>

                          <button
                            type="button"
                            className="act-btn reject"
                            disabled={updatingId === item._id}
                            onClick={() => handleUpdateReturnStatus(item._id, "REJECTED")}
                            title="Reject Return Claim"
                          >
                            <X className="act-ic" /> Reject
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof Photo Lightbox Modal */}
      {selectedProofImage && (
        <div className="proof-modal-overlay" onClick={() => setSelectedProofImage(null)}>
          <div className="proof-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="proof-modal-hdr">
              <h3>Customer Medicine Fault Proof Photo</h3>
              <button
                className="close-proof-btn"
                onClick={() => setSelectedProofImage(null)}
              >
                <X className="x-ic" />
              </button>
            </div>
            <div className="proof-img-frame">
              <img src={selectedProofImage} alt="Full Proof" className="full-proof-img" />
            </div>
          </div>
        </div>
      )}

      {/* Add New Medicine Modal */}
      {isAddMedicineOpen && (
        <div className="proof-modal-overlay" onClick={() => setIsAddMedicineOpen(false)}>
          <div className="add-medicine-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="proof-modal-hdr">
              <div className="hdr-title-wrap">
                <Pill className="hdr-pill-icon" />
                <h3>Add New Medicine to Catalog (नई दवाई जोड़ें)</h3>
              </div>
              <button
                className="close-proof-btn"
                onClick={() => setIsAddMedicineOpen(false)}
              >
                <X className="x-ic" />
              </button>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="add-medicine-form">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Medicine Name (दवाई का नाम) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cipla Paracetamol 650mg, Amoxicillin 500mg"
                    value={medicineForm.name}
                    onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Category (कैटेगरी) *</label>
                  <select
                    value={medicineForm.category}
                    onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
                  >
                    <option value="Medicines">Medicines</option>
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Baby Care">Baby Care</option>
                    <option value="Heart Care">Heart Care</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Company / Brand (कंपनी का नाम) *</label>
                  <select
                    value={medicineForm.company}
                    onChange={(e) => setMedicineForm({ ...medicineForm, company: e.target.value })}
                  >
                    <option value="Cipla Ltd">Cipla Ltd</option>
                    <option value="Zydus Cadila">Zydus Cadila</option>
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

                {medicineForm.company === "Custom" && (
                  <div className="form-group flex-1">
                    <label>Custom Company Name</label>
                    <input
                      type="text"
                      placeholder="Enter Company Name"
                      value={medicineForm.customCompany}
                      onChange={(e) => setMedicineForm({ ...medicineForm, customCompany: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={medicineForm.sellingPrice}
                    onChange={(e) => setMedicineForm({ ...medicineForm, sellingPrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Purchase Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={medicineForm.purchasePrice}
                    onChange={(e) => setMedicineForm({ ...medicineForm, purchasePrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock Count *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 100"
                    value={medicineForm.stock}
                    onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Batch Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={medicineForm.batchNumber}
                    onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={medicineForm.expiryDate}
                    onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsAddMedicineOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-med-btn"
                  disabled={addingMedicine}
                >
                  {addingMedicine ? "Adding Medicine..." : "✓ Add Medicine to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
