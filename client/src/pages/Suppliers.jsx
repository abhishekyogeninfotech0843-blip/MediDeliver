import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  Building2,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pill,
  Package,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  RefreshCw,
  Receipt,
} from "lucide-react";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
import BrandLogo from "../components/BrandLogo";
import SupplierInvoiceModal from "../components/SupplierInvoiceModal";
import "./Suppliers.css";

const Suppliers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Data states
  const [suppliers, setSuppliers] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    totalInvoices: 0,
    totalBilled: 0,
    totalPaid: 0,
    totalDue: 0,
    totalMedicineUnitsReceived: 0,
    pendingInvoicesCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("suppliers"); // 'suppliers' | 'supplies' | 'payments'
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");

  // Modals state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    drugLicenseNumber: "",
    paymentTerms: "Net 30 Days",
    notes: "",
  });

  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [supplyForm, setSupplyForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    taxAmount: 0,
    discountAmount: 0,
    initialPaidAmount: 0,
    paymentMethod: "BANK_TRANSFER",
    paymentRef: "",
    paymentNotes: "",
    notes: "",
    medicines: [
      {
        medicineName: "",
        companyBrand: "",
        category: "General",
        batchNumber: "",
        expiryDate: "",
        quantity: 100,
        unitCost: 0,
        mrp: 0,
      },
    ],
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedSupplyForPay, setSelectedSupplyForPay] = useState(null);
  const [selectedSupplyForInvoice, setSelectedSupplyForInvoice] =
    useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "BANK_TRANSFER",
    refNumber: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Load User
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role !== "admin") {
          navigate("/dashboard");
        }
      } catch (e) {
        setUser(null);
      }
    }
  }, [navigate]);

  // Fetch all suppliers and supplies data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, suppliesRes, statsRes] = await Promise.all([
        api.get("/suppliers"),
        api.get("/suppliers/supplies/list"),
        api.get("/suppliers/stats"),
      ]);

      if (suppliersRes.data?.success) {
        setSuppliers(suppliersRes.data.data || []);
      }
      if (suppliesRes.data?.success) {
        setSupplies(suppliesRes.data.data || []);
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data.data || {});
      }
    } catch (err) {
      console.error("Error fetching supplier data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlertMessage({ msg, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // ==========================================
  // SUPPLIER CRUD HANDLERS
  // ==========================================
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: "",
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      gstNumber: "",
      drugLicenseNumber: "",
      paymentTerms: "Net 30 Days",
      notes: "",
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setSupplierForm({
      name: sup.name || "",
      companyName: sup.companyName || "",
      contactPerson: sup.contactPerson || "",
      phone: sup.phone || "",
      email: sup.email || "",
      address: sup.address || "",
      gstNumber: sup.gstNumber || "",
      drugLicenseNumber: sup.drugLicenseNumber || "",
      paymentTerms: sup.paymentTerms || "Net 30 Days",
      notes: sup.notes || "",
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.phone) {
      alert("Please enter Supplier Name and Phone number.");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingSupplier) {
        const res = await api.put(
          `/suppliers/${editingSupplier._id}`,
          supplierForm,
        );
        if (res.data?.success) {
          showAlert("Supplier updated successfully! ✅");
        }
      } else {
        const res = await api.post("/suppliers", supplierForm);
        if (res.data?.success) {
          showAlert("New Supplier added successfully! 🎉");
        }
      }
      setIsSupplierModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving supplier:", err);
      alert(err.response?.data?.message || "Failed to save supplier.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete supplier "${name}"? This will also remove associated supply history.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/suppliers/${id}`);
      showAlert("Supplier deleted successfully.");
      fetchData();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      alert("Failed to delete supplier.");
    }
  };

  // ==========================================
  // SUPPLY INVOICE CRUD HANDLERS
  // ==========================================
  const handleOpenAddSupply = (preselectedSupplierId = "") => {
    setSupplyForm({
      supplierId: preselectedSupplierId || suppliers[0]?._id || "",
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      purchaseDate: new Date().toISOString().split("T")[0],
      taxAmount: 0,
      discountAmount: 0,
      initialPaidAmount: 0,
      paymentMethod: "BANK_TRANSFER",
      paymentRef: "",
      paymentNotes: "",
      notes: "",
      medicines: [
        {
          medicineName: "",
          companyBrand: "",
          category: "General",
          batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          quantity: 100,
          unitCost: 0,
          mrp: 0,
        },
      ],
    });
    setIsSupplyModalOpen(true);
  };

  const handleAddMedicineRow = () => {
    setSupplyForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicineName: "",
          companyBrand: "",
          category: "General",
          batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          quantity: 50,
          unitCost: 0,
          mrp: 0,
        },
      ],
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    if (supplyForm.medicines.length === 1) {
      alert("At least one medicine item is required.");
      return;
    }
    setSupplyForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setSupplyForm((prev) => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const calculateSupplySubtotal = () => {
    return supplyForm.medicines.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const cost = Number(item.unitCost) || 0;
      return sum + qty * cost;
    }, 0);
  };

  const calculateSupplyGrandTotal = () => {
    const subtotal = calculateSupplySubtotal();
    const tax = Number(supplyForm.taxAmount) || 0;
    const disc = Number(supplyForm.discountAmount) || 0;
    return Math.max(0, subtotal + tax - disc);
  };

  const handleSaveSupply = async (e) => {
    e.preventDefault();
    if (!supplyForm.supplierId) {
      alert("Please select a supplier.");
      return;
    }
    if (!supplyForm.invoiceNumber) {
      alert("Please enter an invoice number.");
      return;
    }

    const hasEmptyMed = supplyForm.medicines.some(
      (m) => !m.medicineName?.trim(),
    );
    if (hasEmptyMed) {
      alert("Please enter medicine names for all rows.");
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await api.post("/suppliers/supplies", supplyForm);
      if (res.data?.success) {
        showAlert("Inward Supply Invoice & Stock recorded successfully! 📦");
        setIsSupplyModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error creating supply invoice:", err);
      alert(err.response?.data?.message || "Failed to record supply invoice.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSupply = async (id, invoiceNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to delete invoice "${invoiceNumber}"?`,
      )
    ) {
      return;
    }
    try {
      await api.delete(`/suppliers/supplies/${id}`);
      showAlert("Supply invoice deleted.");
      fetchData();
    } catch (err) {
      console.error("Error deleting supply:", err);
      alert("Failed to delete supply record.");
    }
  };

  // ==========================================
  // PAYMENT RECORDING HANDLERS
  // ==========================================
  const handleOpenPaymentModal = (supply) => {
    setSelectedSupplyForPay(supply);
    setPaymentForm({
      amount: supply.dueAmount || supply.grandTotal || 0,
      method: "BANK_TRANSFER",
      refNumber: `TXN-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: `Payment for invoice #${supply.invoiceNumber}`,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await api.post(
        `/suppliers/supplies/${selectedSupplyForPay._id}/payment`,
        paymentForm,
      );
      if (res.data?.success) {
        showAlert(res.data.message || "Payment recorded successfully! 💳");
        setIsPaymentModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error recording payment:", err);
      alert(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // ==========================================
  // FILTERED DATA
  // ==========================================
  const filteredSuppliers = suppliers.filter((sup) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (sup.name || "").toLowerCase().includes(q) ||
      (sup.companyName || "").toLowerCase().includes(q) ||
      (sup.contactPerson || "").toLowerCase().includes(q) ||
      (sup.phone || "").toLowerCase().includes(q) ||
      (sup.gstNumber || "").toLowerCase().includes(q) ||
      (sup.stats?.suppliedMedicines || []).some((m) =>
        m.toLowerCase().includes(q),
      )
    );
  });

  const filteredSupplies = supplies.filter((sp) => {
    if (
      paymentFilter !== "ALL" &&
      (sp.paymentStatus || "").toUpperCase() !== paymentFilter
    ) {
      return false;
    }
    if (
      supplierFilter !== "ALL" &&
      sp.supplier?._id !== supplierFilter &&
      sp.supplier !== supplierFilter
    ) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (sp.invoiceNumber || "").toLowerCase().includes(q) ||
      (sp.supplierName || "").toLowerCase().includes(q) ||
      (sp.companyName || "").toLowerCase().includes(q) ||
      (sp.medicines || []).some(
        (m) =>
          (m.medicineName || "").toLowerCase().includes(q) ||
          (m.companyBrand || "").toLowerCase().includes(q) ||
          (m.batchNumber || "").toLowerCase().includes(q),
      )
    );
  });

  // Extract all payment transactions
  const allPayments = [];
  supplies.forEach((sp) => {
    if (sp.paymentHistory && sp.paymentHistory.length > 0) {
      sp.paymentHistory.forEach((ph) => {
        allPayments.push({
          ...ph,
          invoiceNumber: sp.invoiceNumber,
          supplierName: sp.supplierName,
          companyName: sp.companyName,
          supplyId: sp._id,
        });
      });
    }
  });

  allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="suppliers-page">
      {/* ==========================================
          TOP NAVIGATION BAR
         ========================================== */}
      <header className="suppliers-nav-header">
        <div className="suppliers-nav-inner">
          <div className="suppliers-brand-area">
            <BrandLogo />
            <Link to="/dashboard" className="suppliers-back-btn">
              <ArrowLeft size={16} />
              <span>Admin Dashboard</span>
            </Link>
          </div>

          <div className="suppliers-nav-actions">
            <button
              type="button"
              className="action-btn-secondary"
              onClick={fetchData}
              title="Refresh all data"
            >
              <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="action-btn-primary"
              onClick={() => handleOpenAddSupply()}
            >
              <Plus size={16} />
              <span>+ Record Inward Stock</span>
            </button>

            <button
              type="button"
              className="action-btn-secondary"
              onClick={handleOpenAddSupplier}
            >
              <Building2 size={16} />
              <span>+ Add Supplier</span>
            </button>

            <UserProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN CONTENT CONTAINER
         ========================================== */}
      <main className="suppliers-container">
        {alertMessage && (
          <div
            style={{
              padding: "14px 20px",
              background:
                alertMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${alertMessage.type === "success" ? "#a7f3d0" : "#fca5a5"}`,
              borderRadius: "12px",
              color: alertMessage.type === "success" ? "#065f46" : "#991b1b",
              fontWeight: 600,
              fontSize: "0.9rem",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CheckCircle2 size={18} />
            <span>{alertMessage.msg}</span>
          </div>
        )}

        {/* HERO BANNER */}
        <section className="suppliers-hero-banner">
          <div className="hero-title-text">
            <h1>
              <Truck size={28} /> Medicine Suppliers & Stock Inward Ledger
            </h1>
            <p>
              Manage pharmaceutical vendors (Cipla, Mankind, Sun Pharma, etc.),
              record incoming medicine supplies & batches, track purchase
              billings, and monitor remaining payment dues.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", zIndex: 1 }}>
            <button
              type="button"
              className="action-btn-primary"
              style={{ background: "#ffffff", color: "#0f766e" }}
              onClick={() => handleOpenAddSupply()}
            >
              <Plus size={16} /> + New Inward Bill
            </button>
          </div>
        </section>

        {/* KPI STAT CARDS */}
        <section className="suppliers-kpi-grid">
          {/* Card 1: Active Suppliers */}
          <div className="kpi-card">
            <div className="kpi-icon-wrap teal">
              <Building2 size={24} />
            </div>
            <div className="kpi-content">
              <h4>Active Suppliers</h4>
              <p className="kpi-num">
                {stats.totalSuppliers || suppliers.length || 0}
              </p>
            </div>
          </div>

          {/* Card 2: Total Invoices */}
          <div className="kpi-card">
            <div className="kpi-icon-wrap blue">
              <Package size={24} />
            </div>
            <div className="kpi-content">
              <h4>Supply Invoices</h4>
              <p className="kpi-num">
                {stats.totalInvoices || supplies.length || 0}
              </p>
            </div>
          </div>

          {/* Card 3: Total Billed */}
          <div className="kpi-card">
            <div className="kpi-icon-wrap purple">
              <FileText size={24} />
            </div>
            <div className="kpi-content">
              <h4>Total Purchases</h4>
              <p className="kpi-num">
                ₹{Number(stats.totalBilled || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Card 4: Total Paid */}
          <div className="kpi-card">
            <div className="kpi-icon-wrap green">
              <CheckCircle2 size={24} />
            </div>
            <div className="kpi-content">
              <h4>Paid to Suppliers</h4>
              <p className="kpi-num" style={{ color: "#16a34a" }}>
                ₹{Number(stats.totalPaid || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Card 5: Remaining Dues (Baki Amount) */}
          <div className="kpi-card">
            <div className="kpi-icon-wrap amber">
              <AlertTriangle size={24} />
            </div>
            <div className="kpi-content">
              <h4>Remaining Dues (Baki)</h4>
              <p className="kpi-num kpi-due-num">
                ₹{Number(stats.totalDue || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================
            TABS NAVIGATION BAR
           ========================================== */}
        <section className="suppliers-tabs-bar">
          <div className="tab-buttons-group">
            <button
              type="button"
              className={`tab-nav-btn ${activeTab === "suppliers" ? "active" : ""}`}
              onClick={() => setActiveTab("suppliers")}
            >
              <Building2 size={18} />
              <span>Suppliers & Ledgers</span>
              <span className="tab-badge">{suppliers.length}</span>
            </button>

            <button
              type="button"
              className={`tab-nav-btn ${activeTab === "supplies" ? "active" : ""}`}
              onClick={() => setActiveTab("supplies")}
            >
              <Pill size={18} />
              <span>Inward Medicine Supplies & Batches</span>
              <span className="tab-badge">{supplies.length}</span>
            </button>

            <button
              type="button"
              className={`tab-nav-btn ${activeTab === "payments" ? "active" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              <CreditCard size={18} />
              <span>Payment History & Settlement</span>
              <span className="tab-badge">{allPayments.length}</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {activeTab === "suppliers" && (
              <button
                type="button"
                className="action-btn-primary"
                onClick={handleOpenAddSupplier}
              >
                <Plus size={16} /> Add New Supplier
              </button>
            )}
            {activeTab === "supplies" && (
              <button
                type="button"
                className="action-btn-primary"
                onClick={() => handleOpenAddSupply()}
              >
                <Plus size={16} /> + Record Inward Stock
              </button>
            )}
          </div>
        </section>

        {/* SEARCH & FILTER TOOLBAR */}
        <section className="table-filter-toolbar">
          <div className="search-input-box">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder={
                activeTab === "suppliers"
                  ? "Search by Supplier, Company (e.g. Cipla, Mankind), Phone, GSTIN..."
                  : "Search by Medicine Name, Brand, Batch Number, Invoice #..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
                onClick={() => setSearchQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-select-group">
            {activeTab === "supplies" && (
              <>
                <select
                  className="filter-select"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="PAID">Fully Paid</option>
                  <option value="PARTIAL">Partially Paid (Dues Pending)</option>
                  <option value="UNPAID">Unpaid (Full Due)</option>
                </select>

                <select
                  className="filter-select"
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                >
                  <option value="ALL">All Suppliers</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.companyName || s.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </section>

        {/* ==========================================
            TAB 1: SUPPLIERS DIRECTORY & LEDGERS
           ========================================== */}
        {activeTab === "suppliers" && (
          <div className="suppliers-table-wrapper">
            {filteredSuppliers.length === 0 ? (
              <div className="empty-suppliers-state">
                <Building2 className="empty-icon-lg" />
                <h3>No suppliers found</h3>
                <p>
                  Add pharmaceutical companies (Cipla, Mankind, etc.) to start
                  managing inward supplies.
                </p>
                <button
                  type="button"
                  className="action-btn-primary"
                  onClick={handleOpenAddSupplier}
                >
                  <Plus size={16} /> Add First Supplier
                </button>
              </div>
            ) : (
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Supplier & Company</th>
                    <th>Contact & Location</th>
                    <th>Tax & License</th>
                    <th>Supplied Medicines</th>
                    <th>Financial Ledger (₹)</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((sup) => {
                    const stats = sup.stats || {
                      totalInvoices: 0,
                      totalBilled: 0,
                      totalPaid: 0,
                      totalDue: 0,
                      suppliedMedicines: [],
                    };
                    const isFullyPaid =
                      stats.totalDue === 0 && stats.totalBilled > 0;
                    const isPartiallyPaid =
                      stats.totalPaid > 0 && stats.totalDue > 0;

                    return (
                      <tr key={sup._id}>
                        <td>
                          <div className="supplier-cell-main">
                            <strong>{sup.name}</strong>
                            <span className="supplier-company-tag">
                              🏢 {sup.companyName || "Pharmaceutical Co."}
                            </span>
                            {sup.contactPerson && (
                              <span className="cell-subtext">
                                Contact: {sup.contactPerson}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            <span
                              style={{ fontSize: "0.85rem", fontWeight: 600 }}
                            >
                              📞 {sup.phone}
                            </span>
                            {sup.email && (
                              <span className="cell-subtext">
                                ✉️ {sup.email}
                              </span>
                            )}
                            {sup.address && (
                              <span
                                className="cell-subtext"
                                style={{ maxWidth: "220px" }}
                              >
                                📍 {sup.address}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                            }}
                          >
                            {sup.gstNumber ? (
                              <code
                                style={{
                                  fontSize: "0.78rem",
                                  background: "#f1f5f9",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                GST: {sup.gstNumber}
                              </code>
                            ) : (
                              <span className="cell-subtext">No GST</span>
                            )}
                            {sup.drugLicenseNumber && (
                              <small
                                style={{
                                  color: "#64748b",
                                  fontSize: "0.72rem",
                                }}
                              >
                                DL: {sup.drugLicenseNumber}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          {stats.suppliedMedicines &&
                          stats.suppliedMedicines.length > 0 ? (
                            <div className="medicines-chips-list">
                              {stats.suppliedMedicines
                                .slice(0, 3)
                                .map((med, idx) => (
                                  <span key={idx} className="med-chip">
                                    💊 {med}
                                  </span>
                                ))}
                              {stats.suppliedMedicines.length > 3 && (
                                <span
                                  className="med-chip"
                                  style={{ background: "#e2e8f0" }}
                                >
                                  +{stats.suppliedMedicines.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="cell-subtext">
                              No inward bills yet
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="ledger-amounts-cell">
                            <span className="ledger-billed">
                              Billed: ₹
                              {Number(stats.totalBilled).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                            <span className="ledger-paid">
                              Paid: ₹
                              {Number(stats.totalPaid).toLocaleString("en-IN")}
                            </span>
                            <span className="ledger-due">
                              Baki Due: ₹
                              {Number(stats.totalDue).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </td>
                        <td>
                          {stats.totalBilled === 0 ? (
                            <span className="badge-status inactive">
                              No Bills
                            </span>
                          ) : isFullyPaid ? (
                            <span className="badge-status paid">
                              ✅ All Paid
                            </span>
                          ) : isPartiallyPaid ? (
                            <span className="badge-status partial">
                              ⚠️ Part Due
                            </span>
                          ) : (
                            <span className="badge-status unpaid">
                              🛑 Full Due
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="row-actions-group">
                            <button
                              type="button"
                              className="btn-quick-pay"
                              onClick={() => handleOpenAddSupply(sup._id)}
                              title="Add new inward medicine supply bill for this supplier"
                            >
                              <Plus size={13} /> Add Bill
                            </button>
                            <button
                              type="button"
                              className="btn-icon-action"
                              onClick={() => handleOpenEditSupplier(sup)}
                              title="Edit Supplier Details"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon-action delete"
                              onClick={() =>
                                handleDeleteSupplier(sup._id, sup.name)
                              }
                              title="Delete Supplier"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 2: INWARD MEDICINE SUPPLIES & BATCHES
           ========================================== */}
        {activeTab === "supplies" && (
          <div className="suppliers-table-wrapper">
            {filteredSupplies.length === 0 ? (
              <div className="empty-suppliers-state">
                <Package className="empty-icon-lg" />
                <h3>No inward stock invoices match your filter</h3>
                <p>
                  Record invoices when new medicine stocks arrive from
                  companies.
                </p>
                <button
                  type="button"
                  className="action-btn-primary"
                  onClick={() => handleOpenAddSupply()}
                >
                  <Plus size={16} /> + Record Inward Stock
                </button>
              </div>
            ) : (
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Invoice & Date</th>
                    <th>Supplier / Company</th>
                    <th>Medicines Received & Batches</th>
                    <th>Bill Breakdown (₹)</th>
                    <th>Paid vs Baki (₹)</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupplies.map((sp) => (
                    <tr key={sp._id}>
                      <td>
                        <strong
                          style={{ color: "#0f172a", fontSize: "0.95rem" }}
                        >
                          #{sp.invoiceNumber}
                        </strong>
                        <br />
                        <small style={{ color: "#64748b" }}>
                          📅{" "}
                          {new Date(sp.purchaseDate).toLocaleDateString(
                            "en-IN",
                          )}
                        </small>
                      </td>
                      <td>
                        <strong style={{ color: "#0f172a" }}>
                          {sp.supplierName}
                        </strong>
                        <br />
                        <span className="supplier-company-tag">
                          🏢 {sp.companyName || "Pharma"}
                        </span>
                      </td>
                      <td>
                        <div
                          className="medicines-chips-list"
                          style={{ maxWidth: "360px" }}
                        >
                          {(sp.medicines || []).map((med, idx) => (
                            <div
                              key={idx}
                              className="med-chip"
                              style={{
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <strong>💊 {med.medicineName}</strong>
                                {med.companyBrand && (
                                  <span
                                    style={{
                                      fontSize: "0.7rem",
                                      color: "#64748b",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    ({med.companyBrand})
                                  </span>
                                )}
                                <br />
                                <small
                                  style={{ color: "#0d9488", fontWeight: 700 }}
                                >
                                  Batch: {med.batchNumber}
                                </small>{" "}
                                |{" "}
                                <small style={{ color: "#64748b" }}>
                                  Exp: {med.expiryDate}
                                </small>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <span className="med-qty-badge">
                                  {med.quantity} Units
                                </span>
                                <br />
                                <small
                                  style={{ fontWeight: 700, color: "#0f172a" }}
                                >
                                  @₹{med.unitCost} = ₹{med.totalCost}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="ledger-amounts-cell">
                          <span
                            style={{ fontSize: "0.85rem", fontWeight: 700 }}
                          >
                            Subtotal: ₹{Number(sp.totalAmount || 0).toFixed(2)}
                          </span>
                          {sp.taxAmount > 0 && (
                            <small style={{ color: "#64748b" }}>
                              + Tax: ₹{sp.taxAmount}
                            </small>
                          )}
                          {sp.discountAmount > 0 && (
                            <small style={{ color: "#16a34a" }}>
                              - Disc: ₹{sp.discountAmount}
                            </small>
                          )}
                          <strong
                            style={{ color: "#0d9488", fontSize: "0.95rem" }}
                          >
                            Total: ₹
                            {Number(
                              sp.grandTotal || sp.totalAmount || 0,
                            ).toFixed(2)}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <div className="ledger-amounts-cell">
                          <span className="ledger-paid">
                            Paid: ₹{Number(sp.paidAmount || 0).toFixed(2)}
                          </span>
                          <span className="ledger-due">
                            Baki Due: ₹{Number(sp.dueAmount || 0).toFixed(2)}
                          </span>
                          {sp.paymentMethod && (
                            <small
                              style={{ color: "#64748b", fontSize: "0.72rem" }}
                            >
                              Mode: {sp.paymentMethod.replace("_", " ")}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        {sp.paymentStatus === "PAID" ? (
                          <span className="badge-status paid">✅ Paid</span>
                        ) : sp.paymentStatus === "PARTIAL" ? (
                          <span className="badge-status partial">
                            ⚠️ Partial
                          </span>
                        ) : (
                          <span className="badge-status unpaid">🛑 Unpaid</span>
                        )}
                      </td>
                      <td>
                        <div className="row-actions-group">
                          <button
                            type="button"
                            className="btn-quick-pay"
                            style={{
                              background: "#f0fdfa",
                              borderColor: "#99f6e4",
                              color: "#0d9488",
                            }}
                            onClick={() => setSelectedSupplyForInvoice(sp)}
                            title="View & Print Official Supplier Tax Invoice (Bill)"
                          >
                            <FileText size={13} /> View Bill
                          </button>

                          {sp.dueAmount > 0 && (
                            <button
                              type="button"
                              className="btn-quick-pay"
                              onClick={() => handleOpenPaymentModal(sp)}
                              title="Record payment for this invoice"
                            >
                              <CreditCard size={13} /> Pay Dues
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-icon-action delete"
                            onClick={() =>
                              handleDeleteSupply(sp._id, sp.invoiceNumber)
                            }
                            title="Delete supply record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: PAYMENT TRANSACTIONS & HISTORY
           ========================================== */}
        {activeTab === "payments" && (
          <div className="suppliers-table-wrapper">
            {allPayments.length === 0 ? (
              <div className="empty-suppliers-state">
                <CreditCard className="empty-icon-lg" />
                <h3>No payment transactions recorded yet</h3>
                <p>
                  When you record payments against inward stock invoices, they
                  will show up here.
                </p>
              </div>
            ) : (
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Payment Date</th>
                    <th>Supplier / Company</th>
                    <th>Invoice Reference</th>
                    <th>Payment Method</th>
                    <th>Amount Paid (₹)</th>
                    <th>Transaction / Ref #</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((p, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>
                          {new Date(p.date).toLocaleDateString("en-IN")}
                        </strong>
                        <br />
                        <small style={{ color: "#64748b" }}>
                          {new Date(p.date).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </td>
                      <td>
                        <strong>{p.supplierName}</strong>
                        <br />
                        <span className="supplier-company-tag">
                          🏢 {p.companyName}
                        </span>
                      </td>
                      <td>
                        <strong
                          style={{
                            color: "#0d9488",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => {
                            const foundSupply = supplies.find(
                              (s) =>
                                s._id === p.supplyId ||
                                s.invoiceNumber === p.invoiceNumber,
                            );
                            if (foundSupply)
                              setSelectedSupplyForInvoice(foundSupply);
                          }}
                          title="Click to view full Invoice (Bill)"
                        >
                          #{p.invoiceNumber}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.825rem",
                            fontWeight: 700,
                            color: "#0d9488",
                          }}
                        >
                          {p.method === "BANK_TRANSFER"
                            ? "🏦 Bank Transfer / NEFT"
                            : p.method === "UPI"
                              ? "⚡ UPI / QR"
                              : p.method === "CHEQUE"
                                ? "📄 Cheque"
                                : "💵 Cash"}
                        </span>
                      </td>
                      <td>
                        <strong
                          style={{ color: "#16a34a", fontSize: "1.05rem" }}
                        >
                          ₹
                          {Number(p.amount || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                      </td>
                      <td>
                        <code
                          style={{
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                          }}
                        >
                          {p.refNumber || "N/A"}
                        </code>
                      </td>
                      <td>
                        <span className="cell-subtext">
                          {p.notes || "No notes"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* ==========================================
          MODAL 1: ADD / EDIT SUPPLIER
         ========================================== */}
      {isSupplierModalOpen && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal-box">
            <div className="modal-header">
              <h2>
                <Building2 size={22} className="text-teal" />
                {editingSupplier
                  ? "Edit Supplier Details"
                  : "Add New Medicine Supplier"}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsSupplierModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Supplier / Distributor Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cipla Healthcare Distribution"
                      value={supplierForm.name}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Parent Company Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cipla Ltd, Mankind, Sun Pharma..."
                      value={supplierForm.companyName}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma (Area Manager)"
                      value={supplierForm.contactPerson}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          contactPerson: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9820112345"
                      value={supplierForm.phone}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. supply@cipla.com"
                      value={supplierForm.email}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Terms / Credit Period</label>
                    <select
                      value={supplierForm.paymentTerms}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          paymentTerms: e.target.value,
                        })
                      }
                    >
                      <option value="Immediate / Advance">
                        Immediate / Advance
                      </option>
                      <option value="Net 15 Days">Net 15 Days</option>
                      <option value="Net 30 Days">Net 30 Days</option>
                      <option value="Net 45 Days">Net 45 Days</option>
                      <option value="Net 60 Days">Net 60 Days</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>GSTIN / Tax Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 07AAACC1206D1ZM"
                      value={supplierForm.gstNumber}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          gstNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Drug License Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-ND-2024-8891"
                      value={supplierForm.drugLicenseNumber}
                      onChange={(e) =>
                        setSupplierForm({
                          ...supplierForm,
                          drugLicenseNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Depot / Warehouse Address</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Plot 42, Pharma Hub, Okhla Phase 3, New Delhi - 110020"
                    value={supplierForm.address}
                    onChange={(e) =>
                      setSupplierForm({
                        ...supplierForm,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Notes / Supplies Scope</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Supplies Betnovate, Ciplox, Asthalin range with 10% volume discount."
                    value={supplierForm.notes}
                    onChange={(e) =>
                      setSupplierForm({
                        ...supplierForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setIsSupplierModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-submit"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Saving..."
                    : editingSupplier
                      ? "Update Supplier"
                      : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: ADD INWARD STOCK / SUPPLY INVOICE
         ========================================== */}
      {isSupplyModalOpen && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal-box large">
            <div className="modal-header">
              <h2>
                <Package size={22} className="text-teal" /> Record Inward
                Medicine Stock & Invoice
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsSupplyModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSupply}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Select Supplier / Company *</label>
                    <select
                      required
                      value={supplyForm.supplierId}
                      onChange={(e) =>
                        setSupplyForm({
                          ...supplyForm,
                          supplierId: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Choose Supplier --</option>
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.companyName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Invoice / Bill Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. INV-CIPLA-2026-088"
                      value={supplyForm.invoiceNumber}
                      onChange={(e) =>
                        setSupplyForm({
                          ...supplyForm,
                          invoiceNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input
                      type="date"
                      value={supplyForm.purchaseDate}
                      onChange={(e) =>
                        setSupplyForm({
                          ...supplyForm,
                          purchaseDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Initial Payment Paid (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={supplyForm.initialPaidAmount}
                      onChange={(e) =>
                        setSupplyForm({
                          ...supplyForm,
                          initialPaidAmount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* DYNAMIC MEDICINES RECEIVED SECTION */}
                <div className="dynamic-med-section">
                  <div className="dynamic-med-header">
                    <h4>📦 Medicines Received In This Invoice</h4>
                    <button
                      type="button"
                      className="btn-quick-pay"
                      onClick={handleAddMedicineRow}
                    >
                      <Plus size={14} /> Add Another Medicine
                    </button>
                  </div>

                  {supplyForm.medicines.map((med, index) => (
                    <div key={index} className="dynamic-med-row">
                      <div className="dynamic-med-grid">
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.75rem" }}>
                            Medicine Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Betnovate C 30g"
                            value={med.medicineName}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "medicineName",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.75rem" }}>
                            Company Brand
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Cipla"
                            value={med.companyBrand}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "companyBrand",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.75rem" }}>
                            Batch Number
                          </label>
                          <input
                            type="text"
                            placeholder="BATCH-001"
                            value={med.batchNumber}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "batchNumber",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.75rem" }}>
                            Expiry Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={med.expiryDate}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "expiryDate",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.75rem" }}>
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={med.quantity}
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: "0.75rem" }}>
                            Unit Cost (₹)
                          </label>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={med.unitCost}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "unitCost",
                                  e.target.value,
                                )
                              }
                            />
                            {supplyForm.medicines.length > 1 && (
                              <button
                                type="button"
                                className="remove-med-row-btn"
                                onClick={() => handleRemoveMedicineRow(index)}
                                title="Remove row"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: "6px",
                          textAlign: "right",
                          fontSize: "0.8rem",
                          color: "#64748b",
                        }}
                      >
                        Subtotal:{" "}
                        <strong>
                          ₹
                          {(
                            (Number(med.quantity) || 0) *
                            (Number(med.unitCost) || 0)
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* INVOICE SUMMARY CALCULATIONS */}
                <div
                  style={{
                    background: "#f0fdfa",
                    border: "1px solid #99f6e4",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "#0f766e" }}>
                      Medicines Total:{" "}
                      <strong>₹{calculateSupplySubtotal().toFixed(2)}</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.85rem", color: "#0f766e" }}>
                        Grand Total:{" "}
                      </span>
                      <strong style={{ fontSize: "1.2rem", color: "#042f2e" }}>
                        ₹{calculateSupplyGrandTotal().toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.85rem", color: "#dc2626" }}>
                        Baki Due:{" "}
                      </span>
                      <strong style={{ fontSize: "1.2rem", color: "#dc2626" }}>
                        ₹
                        {Math.max(
                          0,
                          calculateSupplyGrandTotal() -
                            (Number(supplyForm.initialPaidAmount) || 0),
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: "16px" }}>
                  <label>Notes / Delivery Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Stock received in good condition at Aligarh central pharmacy."
                    value={supplyForm.notes}
                    onChange={(e) =>
                      setSupplyForm({ ...supplyForm, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setIsSupplyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-submit"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Recording..."
                    : "Save Inward Stock Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 3: RECORD PAYMENT AGAINST INVOICE
         ========================================== */}
      {isPaymentModalOpen && selectedSupplyForPay && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal-box">
            <div className="modal-header">
              <h2>
                <CreditCard size={22} className="text-teal" /> Record Supplier
                Payment
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePayment}>
              <div className="modal-body">
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "12px",
                    padding: "14px",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontWeight: 700,
                      color: "#92400e",
                    }}
                  >
                    Invoice #{selectedSupplyForPay.invoiceNumber} —{" "}
                    {selectedSupplyForPay.supplierName}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      color: "#b45309",
                    }}
                  >
                    <span>
                      Total Bill: ₹
                      {Number(
                        selectedSupplyForPay.grandTotal ||
                          selectedSupplyForPay.totalAmount ||
                          0,
                      ).toFixed(2)}
                    </span>
                    <span>
                      Already Paid: ₹
                      {Number(selectedSupplyForPay.paidAmount || 0).toFixed(2)}
                    </span>
                    <strong style={{ color: "#dc2626" }}>
                      Remaining Baki Due: ₹
                      {Number(selectedSupplyForPay.dueAmount || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Payment Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      max={
                        selectedSupplyForPay.dueAmount ||
                        selectedSupplyForPay.grandTotal
                      }
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      value={paymentForm.method}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          method: e.target.value,
                        })
                      }
                    >
                      <option value="BANK_TRANSFER">
                        🏦 Bank Transfer / NEFT / RTGS
                      </option>
                      <option value="UPI">⚡ UPI / QR Payment</option>
                      <option value="CHEQUE">📄 Cheque</option>
                      <option value="CASH">💵 Cash</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Transaction / UTR Reference #</label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-HDFC-991823"
                      value={paymentForm.refNumber}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          refNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Date</label>
                    <input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          paymentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Notes / Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Part payment cleared via NEFT."
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-submit"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Recording..."
                    : `Confirm Payment of ₹${Number(paymentForm.amount || 0).toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 4: SUPPLIER INVOICE (TAX BILL) VIEWER
         ========================================== */}
      {selectedSupplyForInvoice && (
        <SupplierInvoiceModal
          supply={selectedSupplyForInvoice}
          onClose={() => setSelectedSupplyForInvoice(null)}
          onPayDue={(sp) => handleOpenPaymentModal(sp)}
        />
      )}
    </div>
  );
};

export default Suppliers;
