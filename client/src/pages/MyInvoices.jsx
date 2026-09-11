import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
import InvoiceModal from "../components/InvoiceModal";
import {
  Pill,
  ShoppingBag,
  FileText,
  Search,
  Calendar,
  CreditCard,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  Package
} from "lucide-react";
import "./MyInvoices.css";

const isOrderBelongingToUser = (ord, currentUser) => {
  if (!currentUser || !ord) return false;
  const uId = currentUser._id || currentUser.id;
  const uEmail = (currentUser.email || "").toLowerCase().trim();
  const uPhone = (currentUser.phone || "").replace(/\D/g, "");
  const uName = (currentUser.name || "").toLowerCase().trim();

  const cId = ord.customer?._id || ord.customer?.id || (typeof ord.customer === "string" ? ord.customer : null);
  const cEmail = (ord.customerEmail || ord.customer?.email || "").toLowerCase().trim();
  const cPhone = (ord.customerPhone || ord.customer?.phone || "").replace(/\D/g, "");
  const cName = (ord.customerName || ord.customer?.name || "").toLowerCase().trim();

  if (uId && cId && cId.toString() === uId.toString()) return true;
  if (uEmail && cEmail && cEmail === uEmail) return true;
  if (uPhone && cPhone && (uPhone === cPhone || (uPhone.length >= 10 && cPhone.endsWith(uPhone.slice(-10))))) return true;
  if (uName && cName && cName === uName) return true;
  return false;
};

const MyInvoices = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 6;

  const fetchOrders = async (currentUser, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      let fetched = [];
      const res = await api.get("/orders");
      if (Array.isArray(res.data)) {
        fetched = res.data;
      } else if (res.data?.orders && Array.isArray(res.data.orders)) {
        fetched = res.data.orders;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        fetched = res.data.data;
      }

      const filtered = fetched.filter((ord) => isOrderBelongingToUser(ord, currentUser));
      // Sort newest first
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(filtered);
    } catch (err) {
      console.error("Error fetching orders for invoices:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(rawUser);
    setUser(parsedUser);
    fetchOrders(parsedUser, true);
  }, [navigate]);

  // Filtered invoices
  const filteredInvoices = orders.filter((ord) => {
    const orderId = (ord._id || "").toLowerCase();
    const shortId = (ord._id || "").slice(-6).toLowerCase();
    const invNo = `inv-md-${shortId}`;
    const trackingId = (ord.trackingId || "").toLowerCase();
    const customer = (ord.customerName || ord.customer?.name || "").toLowerCase();
    const address = (ord.deliveryAddress || "").toLowerCase();

    const itemsMatch = (ord.items || []).some((it) => {
      const medName = (it.medicine?.name || it.name || "").toLowerCase();
      return medName.includes(searchTerm.toLowerCase());
    });

    const matchesSearch =
      !searchTerm ||
      orderId.includes(searchTerm.toLowerCase()) ||
      shortId.includes(searchTerm.toLowerCase()) ||
      invNo.includes(searchTerm.toLowerCase()) ||
      trackingId.includes(searchTerm.toLowerCase()) ||
      customer.includes(searchTerm.toLowerCase()) ||
      address.includes(searchTerm.toLowerCase()) ||
      itemsMatch;

    if (!matchesSearch) return false;

    if (statusFilter === "PAID") {
      return ord.paymentStatus === "PAID" || ord.paymentMethod === "ONLINE";
    }
    if (statusFilter === "PENDING") {
      return ord.paymentStatus === "PENDING" || ord.paymentMethod === "COD";
    }
    if (statusFilter === "ONLINE") {
      return ord.paymentMethod === "ONLINE";
    }
    if (statusFilter === "COD") {
      return ord.paymentMethod === "COD";
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / invoicesPerPage));
  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirst, indexOfLast);

  // Summary Metrics
  const totalInvoicedAmount = orders.reduce((sum, ord) => sum + Number(ord.totalAmount || 0), 0);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === "PAID" || o.paymentMethod === "ONLINE").length;

  return (
    <div className="my-invoices-page">
      {/* NAVBAR */}
      <header className="invoices-navbar">
        <div className="invoices-nav-container">
          <Link to="/" className="invoices-logo">
            <div className="invoices-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

          <div className="invoices-nav-actions">
            <button
              type="button"
              className="invoices-back-btn"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/my-orders");
                }
              }}
              title="Go back"
            >
              <ArrowLeft className="back-ic" />
              <span>Back</span>
            </button>

            <button
              type="button"
              className={`invoices-refresh-btn ${isSyncing ? "syncing" : ""}`}
              onClick={() => {
                setIsSyncing(true);
                fetchOrders(user, false);
              }}
              title="Refresh Invoices"
            >
              <RefreshCw className={`btn-refresh-ic ${isSyncing ? "spinning" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Refresh"}</span>
            </button>

            <Link to="/my-orders" className="my-orders-nav-link">
              <Package className="nav-link-ic" /> My Orders
            </Link>

            <Link to="/medicines" className="shop-link">
              <ShoppingBag className="shop-ic" /> Browse Catalog
            </Link>

            <UserProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="invoices-main">
        {/* HEADER TITLE */}
        <div className="invoices-header-row">
          <div>
            <h1>My Medicine Invoices & GST Bills 📄</h1>
            <p>View, preview, and download official computer-generated tax invoices for all your pharmacy orders</p>
          </div>

          <Link to="/my-orders" className="view-orders-btn">
            <Package className="vo-ic" /> Track Active Orders
          </Link>
        </div>

        {/* SUMMARY STATS STRIP */}
        <div className="invoices-summary-strip">
          <div className="iss-card">
            <span className="iss-label">Total Invoices</span>
            <strong className="iss-value">{orders.length}</strong>
            <small>Lifetime GST Receipts</small>
          </div>
          <div className="iss-divider" />
          <div className="iss-card">
            <span className="iss-label">Total Amount Invoiced</span>
            <strong className="iss-value text-teal">₹{totalInvoicedAmount.toFixed(2)}</strong>
            <small>Prescriptions & Healthcare</small>
          </div>
          <div className="iss-divider" />
          <div className="iss-card">
            <span className="iss-label">Prepaid (Online)</span>
            <strong className="iss-value text-emerald">{paidOrdersCount}</strong>
            <small>Verified Online Receipts</small>
          </div>
          <div className="iss-divider" />
          <div className="iss-card">
            <span className="iss-label">Cash on Delivery</span>
            <strong className="iss-value text-purple">{orders.length - paidOrdersCount}</strong>
            <small>Pay on Delivery Invoices</small>
          </div>
        </div>

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="invoices-toolbar">
          <div className="search-box">
            <Search className="search-ic" />
            <input
              type="text"
              placeholder="Search by Invoice No, Order #, medicine name, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Payment Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Invoices ({orders.length})</option>
              <option value="PAID">Prepaid / Paid</option>
              <option value="PENDING">Pending (COD)</option>
              <option value="ONLINE">Razorpay Online</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>
        </div>

        {/* INVOICES LIST */}
        {loading && orders.length === 0 ? (
          <div className="invoices-loading-card">
            <div className="invoices-spinner-ring" />
            <h3>Fetching Tax Invoices & Order Receipts...</h3>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="no-invoices-box">
            <FileText className="no-inv-ic" />
            <h3>No Invoices Found</h3>
            <p>You haven't placed any orders matching the search or filter criteria.</p>
            <Link to="/medicines" className="browse-meds-btn">
              Order Medicines Now <ChevronRight className="arr-ic" />
            </Link>
          </div>
        ) : (
          <div className="invoices-table-card">
            <div className="invoices-table-responsive">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice / Order #</th>
                    <th>Date & Time</th>
                    <th>Medicines Summary</th>
                    <th>Payment Mode</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoices.map((ord) => {
                    const orderIdShort = ord._id.slice(-6).toUpperCase();
                    const invoiceNo = `INV-MD-${new Date(ord.createdAt || Date.now()).getFullYear()}-${orderIdShort}`;
                    const itemsCount = (ord.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
                    const isPaid = ord.paymentStatus === "PAID" || ord.paymentMethod === "ONLINE";

                    return (
                      <tr key={ord._id} className="invoice-row">
                        <td>
                          <div className="inv-cell-primary">
                            <FileText className="row-file-ic" />
                            <div>
                              <strong className="inv-no-text">{invoiceNo}</strong>
                              <small className="inv-order-ref">Order #{orderIdShort}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="inv-date-cell">
                            <span>
                              <Calendar className="row-mini-ic" />{" "}
                              {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <small>
                              {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="inv-items-cell">
                            <strong>{itemsCount} {itemsCount === 1 ? "Medicine Item" : "Medicine Items"}</strong>
                            <small className="items-names-snippet">
                              {(ord.items || [])
                                .map((it) => it.medicine?.name || it.name)
                                .filter(Boolean)
                                .slice(0, 2)
                                .join(", ")}
                              {(ord.items || []).length > 2 && " + more"}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="inv-pay-mode-cell">
                            <span>
                              <CreditCard className="row-mini-ic" />{" "}
                              {ord.paymentMethod === "ONLINE" ? "Razorpay Online" : "Cash on Delivery"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong className="inv-amt-text">
                            ₹{Number(ord.totalAmount || 0).toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          <span className={`inv-status-pill ${isPaid ? "paid" : "pending"}`}>
                            {isPaid ? "✓ PAID" : "PENDING (COD)"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="inv-actions-cell">
                            <button
                              type="button"
                              className="preview-inv-btn"
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              title="Preview Full Tax Invoice"
                            >
                              <Eye className="act-ic" />
                              <span>Preview</span>
                            </button>

                            <button
                              type="button"
                              className="quick-print-btn"
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              title="Print or Save as PDF"
                            >
                              <Printer className="act-ic" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredInvoices.length > invoicesPerPage && (
              <div className="invoices-pagination">
                <div className="invoices-pagination-info">
                  Showing <strong>{indexOfFirst + 1}</strong> - <strong>{Math.min(indexOfLast, filteredInvoices.length)}</strong> of <strong>{filteredInvoices.length}</strong> invoices
                </div>
                <div className="invoices-pagination-controls">
                  <button
                    type="button"
                    className="inv-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="page-arr-ic" /> Prev
                  </button>

                  <div className="inv-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`inv-page-num ${currentPage === p ? "active" : ""}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="inv-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight className="page-arr-ic" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* TAX INVOICE PREVIEW MODAL */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          user={user}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};

export default MyInvoices;
