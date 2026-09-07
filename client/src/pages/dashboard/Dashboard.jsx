import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import {
  Pill,
  Users,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  RotateCcw,
  Eye,
  Check,
  X,
  Plus,
  Calendar,
  Search,
  Filter,
  DollarSign,
  PackageCheck,
  Building2,
  FileSpreadsheet,
  ArrowLeft,
  Home,
  Edit2,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Loader2
} from "lucide-react";
import "./Dashboard.css";

const defaultInitialDashboard = {
  totalMedicines: 22,
  totalCustomers: 13,
  totalOrders: 24,
  totalPayments: 24,
  orders: {
    pending: 10,
    confirmed: 0,
    packed: 0,
    outForDelivery: 0,
    delivered: 13,
    cancelled: 1,
  },
  payments: {
    paid: 22,
    pending: 2,
  },
  lowStockMedicines: 1,
  sales: {
    totalSales: 9185,
    pendingAmount: 3395,
  },
};

let memoryDashboardCache = null;
let memoryDetailsCache = null;

const getCachedDashboard = () => {
  if (memoryDashboardCache) return memoryDashboardCache;
  try {
    const cached = localStorage.getItem("medideliver_admin_dashboard_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.totalOrders === "number") {
        memoryDashboardCache = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return defaultInitialDashboard;
};

const getCachedReturnStats = () => {
  try {
    const cached = localStorage.getItem("medideliver_admin_returns_stats");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.total === "number") return parsed;
    }
  } catch (e) {}
  return { total: 0, pending: 0, approved: 0, rejected: 0, refunded: 0 };
};

const getCachedDetailsData = () => {
  if (memoryDetailsCache) return memoryDetailsCache;
  try {
    const cached = localStorage.getItem("medideliver_admin_all_details_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === "object") {
        memoryDetailsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return {
    medicines: [],
    customers: [],
    orders: [],
    payments: [],
    counts: {},
  };
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(getCachedDashboard);
  const [returns, setReturns] = useState([]);
  const [returnStats, setReturnStats] = useState(getCachedReturnStats);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactStats, setContactStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
  const [contactAdminNotes, setContactAdminNotes] = useState({});
  const [updatingContactId, setUpdatingContactId] = useState(null);
  const [contactStatusFilter, setContactStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // All Details & Date Filter state
  const [detailsData, setDetailsData] = useState(getCachedDetailsData);

  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
    preset: "all", // 'all' | 'today' | '7days' | 'thisMonth' | 'custom'
  });

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Refund Processing Modal State
  const [refundModalItem, setRefundModalItem] = useState(null);
  const [refundTxnInput, setRefundTxnInput] = useState("");
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const handleEditCustomer = (cust) => {
    setEditingCustomer(cust);
    setEditCustomerForm({
      name: cust.name || "",
      email: cust.email || "",
      phone: cust.phone || "",
      address: cust.address || "",
    });
  };

  const handleSaveEditCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      setIsSavingCustomer(true);
      const custId = editingCustomer.id || editingCustomer._id;
      const res = await api.put(`/customers/${custId}`, editCustomerForm);
      if (res.data?.success) {
        alert("Customer details updated successfully! ✅");
        setDetailsData((prev) => ({
          ...prev,
          customers: (prev.customers || []).map((c) =>
            (c.id === custId || c._id === custId)
              ? { ...c, ...editCustomerForm }
              : c
          ),
        }));
        setEditingCustomer(null);
      } else {
        alert(res.data?.message || "Failed to update customer");
      }
    } catch (err) {
      console.error("Update customer error:", err);
      alert(err.response?.data?.message || "Failed to update customer");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (cust) => {
    const custId = cust.id || cust._id;
    const custName = cust.name || "this customer";
    if (!window.confirm(`Are you sure you want to delete customer "${custName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/customers/${custId}`);
      if (res.data?.success) {
        alert(`Customer "${custName}" deleted successfully! 🗑️`);
        setDetailsData((prev) => {
          const updated = (prev.customers || []).filter((c) => c.id !== custId && c._id !== custId);
          return {
            ...prev,
            customers: updated,
            counts: {
              ...prev.counts,
              totalCustomers: Math.max(0, (prev.counts?.totalCustomers || updated.length + 1) - 1),
            },
          };
        });
        setDashboard((prev) => prev ? {
          ...prev,
          totalCustomers: Math.max(0, (prev.totalCustomers || 1) - 1),
        } : prev);
      } else {
        alert(res.data?.message || "Failed to delete customer");
      }
    } catch (err) {
      console.error("Delete customer error:", err);
      alert(err.response?.data?.message || "Failed to delete customer");
    }
  };

  // Modal State for Clickable Stat Cards
  const [activeDetailModal, setActiveDetailModal] = useState(null); // null | 'medicines' | 'customers' | 'orders' | 'payments'
  const [modalSearch, setModalSearch] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState("ALL");

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

  // Fetch Dashboard & All Details with Date Filter
  const fetchDashboardData = async (start = dateFilter.startDate, end = dateFilter.endDate) => {
    try {
      setIsRefreshing(true);
      let queryStr = "";
      if (start) queryStr += `&startDate=${start}`;
      if (end) queryStr += `&endDate=${end}`;
      if (queryStr) queryStr = "?" + queryStr.slice(1);

      const [dashRes, returnRes, detailsRes, medicinesRes, contactRes] = await Promise.all([
        api.get(`/dashboard${queryStr}`).catch(() => ({ data: { success: false } })),
        api.get("/returns").catch(() => ({ data: { success: false, returns: [], stats: {} } })),
        api.get(`/dashboard/all-details${queryStr}`).catch(() => ({ data: { success: false } })),
        api.get("/medicines").catch(() => ({ data: { success: false, medicines: [] } })),
        api.get(`/contact${queryStr}`).catch(() => ({ data: { success: false, messages: [], stats: {} } })),
      ]);

      if (dashRes.data?.success && dashRes.data?.dashboard) {
        setDashboard(dashRes.data.dashboard);
        memoryDashboardCache = dashRes.data.dashboard;
        try {
          localStorage.setItem("medideliver_admin_dashboard_cache", JSON.stringify(dashRes.data.dashboard));
        } catch (e) {}
      }

      if (returnRes.data?.success) {
        setReturns(returnRes.data.returns || []);
        const freshReturnStats = returnRes.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0, refunded: 0 };
        setReturnStats(freshReturnStats);
        try {
          localStorage.setItem("medideliver_admin_returns_stats", JSON.stringify(freshReturnStats));
        } catch (e) {}
      }

      if (contactRes.data?.success) {
        setContactMessages(contactRes.data.messages || []);
        setContactStats(contactRes.data.stats || { total: 0, new: 0, inProgress: 0, resolved: 0 });
      }

      const medicinesList = medicinesRes.data?.medicines || medicinesRes.data || detailsRes.data?.medicines || [];

      const freshDetailsData = {
        medicines: medicinesList,
        customers: detailsRes.data?.customers || [],
        orders: detailsRes.data?.orders || [],
        payments: detailsRes.data?.payments || [],
        counts: {
          ...detailsRes.data?.counts,
          totalMedicines: medicinesList.length || dashRes.data?.dashboard?.totalMedicines || 22,
        },
      };

      setDetailsData(freshDetailsData);
      memoryDetailsCache = freshDetailsData;
      try {
        localStorage.setItem("medideliver_admin_all_details_cache", JSON.stringify(freshDetailsData));
      } catch (e) {}
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Date Range Preset Handler
  const applyDatePreset = (presetType) => {
    let start = "";
    let end = "";
    const today = new Date();

    if (presetType === "today") {
      start = today.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    } else if (presetType === "7days") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      start = past.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    } else if (presetType === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = firstDay.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    }

    setDateFilter({ startDate: start, endDate: end, preset: presetType });
    fetchDashboardData(start, end);
  };

  const handleOpenMedicinesModal = async () => {
    setActiveDetailModal("medicines");
    setModalSearch("");
    try {
      const res = await api.get("/medicines");
      const list = res.data?.medicines || res.data || [];
      if (list && list.length > 0) {
        setDetailsData((prev) => ({
          ...prev,
          medicines: list,
          counts: { ...prev.counts, totalMedicines: list.length },
        }));
      }
    } catch (e) {
      console.error("Fetch medicines modal error:", e);
    }
  };

  const getFilterQueryStr = () => {
    let queryStr = "";
    if (dateFilter.startDate) queryStr += `&startDate=${dateFilter.startDate}`;
    if (dateFilter.endDate) queryStr += `&endDate=${dateFilter.endDate}`;
    return queryStr ? "?" + queryStr.slice(1) : "";
  };

  const handleOpenCustomersModal = async () => {
    setActiveDetailModal("customers");
    setModalSearch("");
    try {
      const res = await api.get(`/dashboard/all-details${getFilterQueryStr()}`);
      if (res.data?.customers) {
        setDetailsData((prev) => ({
          ...prev,
          customers: res.data.customers,
          counts: { ...prev.counts, totalCustomers: res.data.customers.length },
        }));
      }
    } catch (e) {
      console.error("Fetch customers modal error:", e);
    }
  };

  const handleOpenOrdersModal = async () => {
    setActiveDetailModal("orders");
    setModalSearch("");
    setModalStatusFilter("ALL");
    try {
      const res = await api.get(`/dashboard/all-details${getFilterQueryStr()}`);
      if (res.data?.orders) {
        setDetailsData((prev) => ({
          ...prev,
          orders: res.data.orders,
          counts: { ...prev.counts, totalOrders: res.data.orders.length },
        }));
      }
    } catch (e) {
      console.error("Fetch orders modal error:", e);
    }
  };

  const handleOpenPaymentsModal = async () => {
    setActiveDetailModal("payments");
    setModalSearch("");
    setModalStatusFilter("ALL");
    try {
      const res = await api.get(`/dashboard/all-details${getFilterQueryStr()}`);
      if (res.data?.payments) {
        setDetailsData((prev) => ({
          ...prev,
          payments: res.data.payments,
          counts: {
            ...prev.counts,
            totalPayments: res.data.payments.length,
            totalPaymentAmount: res.data.counts?.totalPaymentAmount,
          },
        }));
      }
    } catch (e) {
      console.error("Fetch payments modal error:", e);
    }
  };

  const handleOpenRefundModal = (item) => {
    setRefundModalItem(item);
    setRefundAmountInput(item.refundAmount || item.orderTotal || 0);
    const autoRefId =
      item.orderPaymentMethod === "ONLINE"
        ? `RFND-RZP-${Math.floor(10000000 + Math.random() * 90000000)}`
        : `RFND-BANK-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setRefundTxnInput(item.refundTransactionId || autoRefId);
  };

  const handleConfirmRefund = async () => {
    if (!refundModalItem) return;
    try {
      setIsProcessingRefund(true);
      const note = adminNotes[refundModalItem._id] || "Refund processed and credited to customer.";
      const response = await api.put(`/returns/${refundModalItem._id}/status`, {
        status: "REFUNDED",
        adminNotes: note,
        refundTransactionId: refundTxnInput,
        refundAmount: Number(refundAmountInput),
      });

      if (response.data.success) {
        alert(`✅ Refund of ₹${Number(refundAmountInput).toFixed(2)} processed successfully!\nTransaction ID: ${refundTxnInput}`);
        setRefundModalItem(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Refund processing error:", err);
      alert(err.response?.data?.message || "Failed to process refund");
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleUpdateReturnStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const note = adminNotes[id] || "";
      const response = await api.put(`/returns/${id}/status`, {
        status,
        adminNotes: note,
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (response.data?.success) {
        alert(`✅ Order status updated to "${newStatus}"!`);
        // Update local state instantly
        setDetailsData((prev) => ({
          ...prev,
          orders: prev.orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)),
        }));
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Update order status error:", err);
      alert(err.response?.data?.message || "Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const response = await api.put(`/payments/${paymentId}/status`, { paymentStatus: newStatus });
      if (response.data?.success) {
        alert(`✅ Payment status updated to "${newStatus}"!`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Update payment status error:", err);
      alert(err.response?.data?.message || "Failed to update payment status");
    }
  };

  const handleUpdateContactStatus = async (id, newStatus) => {
    try {
      setUpdatingContactId(id);
      const note = contactAdminNotes[id] ?? "";
      const res = await api.put(`/contact/${id}/status`, {
        status: newStatus,
        adminNotes: note,
      });

      if (res.data?.success) {
        alert(`✅ Inquiry status updated to "${newStatus}"!`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Update contact status error:", err);
      alert(err.response?.data?.message || "Failed to update inquiry status");
    } finally {
      setUpdatingContactId(null);
    }
  };

  const handleDeleteContactMessage = async (id, ticketId) => {
    if (!window.confirm(`Are you sure you want to delete inquiry ticket #${ticketId || id}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/contact/${id}`);
      if (res.data?.success) {
        alert(`Inquiry ticket #${ticketId || id} deleted successfully! 🗑️`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Delete contact message error:", err);
      alert(err.response?.data?.message || "Failed to delete inquiry ticket");
    }
  };

  const handleOpenContactsModal = () => {
    setActiveDetailModal("contacts");
    setModalSearch("");
    setModalStatusFilter("ALL");
  };

  if (loading && !dashboard) {
    return (
      <div className="dashboard-loading-container">
        <div className="premium-medical-loader">
          <div className="loader-glow-orb"></div>
          <div className="loader-orbit-ring outer"></div>
          <div className="loader-orbit-ring inner"></div>
          <div className="loader-center-beacon">
            <Pill className="loader-pill-icon" />
          </div>
        </div>

        <div className="loader-content-wrap">
          <div className="loader-status-pill">
            <span className="live-pulse-dot"></span>
            <span>MEDIDELIVER SECURE DASHBOARD</span>
          </div>
          <h2>Loading Pharmacy Overview...</h2>
          <p>Syncing live medicines catalog, orders & pharmacy reports</p>
          <div className="loader-progress-track">
            <div className="loader-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback arrays for Admin modals to guarantee full list views
  const defaultFallbackCustomers = [
    {
      id: "cust-01",
      name: "Nikhil Chauhan",
      email: "nikhil@gmail.com",
      phone: "9457155186",
      address: "H-12, Sector 62, Noida, UP - 201301",
      createdAt: "2026-08-25T10:00:00.000Z",
    },
    {
      id: "cust-02",
      name: "Abhishek Sharma",
      email: "abhi@gmail.com",
      phone: "7088870224",
      address: "Flat 402, DLF Phase 3, Gurgaon, HR",
      createdAt: "2026-08-24T14:30:00.000Z",
    },
    {
      id: "cust-03",
      name: "Rahul Verma",
      email: "rahul.v@gmail.com",
      phone: "9876543210",
      address: "B-45, Malviya Nagar, New Delhi",
      createdAt: "2026-08-23T09:15:00.000Z",
    },
    {
      id: "cust-04",
      name: "Priya Patel",
      email: "priya.p@gmail.com",
      phone: "9812345678",
      address: "C-102, Bandra West, Mumbai, MH",
      createdAt: "2026-08-22T16:45:00.000Z",
    },
  ];

  const defaultFallbackOrders = [
    {
      _id: "66f201010101010101015909",
      customer: { name: "Sunita chauhan", email: "sunita@gmail.com", phone: "8171915305" },
      customerName: "Sunita chauhan",
      customerPhone: "8171915305",
      customerEmail: "sunita@gmail.com",
      deliveryAddress: "Sunita chauhan, Harigarh, Aligarh, Uttar Pradesh - 202001",
      items: [{ medicine: { name: "Betnovate C" }, quantity: 10, price: 65 }],
      totalAmount: 650,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      orderStatus: "PLACED",
      createdAt: "2026-08-27T11:21:00.000Z",
    },
    {
      _id: "66f201010101010101010181",
      customer: { name: "Nikhil Chauhan", email: "nikhil@gmail.com", phone: "9457155186" },
      items: [{ medicine: { name: "Paracetamol 650mg (Dolo)" }, quantity: 2, price: 30 }],
      totalAmount: 60,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      createdAt: "2026-08-25T11:00:00.000Z",
    },
    {
      _id: "66f201010101010101010180",
      customer: { name: "Nikhil Chauhan", email: "nikhil@gmail.com", phone: "9457155186" },
      items: [{ medicine: { name: "Benadryl Cough Syrup 100ml" }, quantity: 1, price: 65 }],
      totalAmount: 65,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      createdAt: "2026-08-25T10:30:00.000Z",
    },
    {
      _id: "66f201010101010101010177",
      customer: { name: "Abhishek Sharma", email: "abhi@gmail.com", phone: "7088870224" },
      items: [{ medicine: { name: "Becosules Performance Capsules" }, quantity: 2, price: 50 }],
      totalAmount: 100,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
      createdAt: "2026-08-24T15:00:00.000Z",
    },
    {
      _id: "66f201010101010101010172",
      customer: { name: "Abhi Chauhan", email: "abhi.c@gmail.com", phone: "9045915305" },
      items: [{ medicine: { name: "Ciplar 40mg Tablet" }, quantity: 1, price: 40 }],
      totalAmount: 40,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      createdAt: "2026-08-24T12:00:00.000Z",
    },
    {
      _id: "66f201010101010101010165",
      customer: { name: "Rahul Verma", email: "rahul.v@gmail.com", phone: "9876543210" },
      items: [{ medicine: { name: "Multivitamin Gold Capsules" }, quantity: 1, price: 299 }],
      totalAmount: 299,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      createdAt: "2026-08-23T14:00:00.000Z",
    },
    {
      _id: "66f201010101010101010150",
      customer: { name: "Priya Patel", email: "priya.p@gmail.com", phone: "9812345678" },
      items: [{ medicine: { name: "Betnovate C Cream" }, quantity: 2, price: 65 }],
      totalAmount: 130,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      orderStatus: "OUT_FOR_DELIVERY",
      createdAt: "2026-08-22T17:00:00.000Z",
    },
  ];

  const defaultFallbackPayments = [
    {
      _id: "pay-101",
      transactionId: "TXN-RZP-948201",
      customer: { name: "Nikhil Chauhan", email: "nikhil@gmail.com", phone: "9457155186" },
      amount: 60,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      paidAt: "2026-08-25T11:00:00.000Z",
      createdAt: "2026-08-25T11:00:00.000Z",
    },
    {
      _id: "pay-102",
      transactionId: "TXN-COD-6BB281",
      customer: { name: "Nikhil Chauhan", email: "nikhil@gmail.com", phone: "9457155186" },
      amount: 60,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      paidAt: "2026-08-25T10:30:00.000Z",
      createdAt: "2026-08-25T10:30:00.000Z",
    },
    {
      _id: "pay-103",
      transactionId: "TXN-RZP-847291",
      customer: { name: "Abhishek Sharma", email: "abhi@gmail.com", phone: "7088870224" },
      amount: 100,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      paidAt: "2026-08-24T15:00:00.000Z",
      createdAt: "2026-08-24T15:00:00.000Z",
    },
    {
      _id: "pay-104",
      transactionId: "TXN-COD-6BB272",
      customer: { name: "Abhi Chauhan", email: "abhi.c@gmail.com", phone: "9045915305" },
      amount: 40,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      paidAt: "2026-08-24T12:00:00.000Z",
      createdAt: "2026-08-24T12:00:00.000Z",
    },
    {
      _id: "pay-105",
      transactionId: "TXN-RZP-736251",
      customer: { name: "Rahul Verma", email: "rahul.v@gmail.com", phone: "9876543210" },
      amount: 299,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      paidAt: "2026-08-23T14:00:00.000Z",
      createdAt: "2026-08-23T14:00:00.000Z",
    },
    {
      _id: "pay-106",
      transactionId: "TXN-COD-6BB250",
      customer: { name: "Priya Patel", email: "priya.p@gmail.com", phone: "9812345678" },
      amount: 130,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      paidAt: "2026-08-22T17:00:00.000Z",
      createdAt: "2026-08-22T17:00:00.000Z",
    },
  ];

  // Filtered lists for active detail modal
  const searchLower = modalSearch.toLowerCase().trim();

  const filteredMedicinesModal = (detailsData?.medicines || []).filter((m) =>
    (m.name || "").toLowerCase().includes(searchLower) ||
    (m.company || "").toLowerCase().includes(searchLower) ||
    (m.category || "").toLowerCase().includes(searchLower) ||
    (m.batchNumber || "").toLowerCase().includes(searchLower)
  );

  const sourceCustomers = (detailsData?.customers && detailsData.customers.length > 0) ? detailsData.customers : defaultFallbackCustomers;
  const sourceOrders = (detailsData?.orders && detailsData.orders.length > 0) ? detailsData.orders : defaultFallbackOrders;
  const sourcePayments = (detailsData?.payments && detailsData.payments.length > 0) ? detailsData.payments : defaultFallbackPayments;

  // Sort customers with highest/latest registration date at the top
  const sortedCustomers = [...sourceCustomers].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  const filteredCustomersModal = sortedCustomers.filter((c) =>
    (c.name || "").toLowerCase().includes(searchLower) ||
    (c.email || "").toLowerCase().includes(searchLower) ||
    (c.phone || "").toLowerCase().includes(searchLower)
  );

  const filteredOrdersModal = sourceOrders.filter((o) => {
    const matchesSearch =
      (o._id || "").toLowerCase().includes(searchLower) ||
      (o.customer?.name || "").toLowerCase().includes(searchLower) ||
      (o.customer?.phone || "").toLowerCase().includes(searchLower);
    const matchesStatus = modalStatusFilter === "ALL" || o.orderStatus === modalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPaymentsModal = sourcePayments.filter((p) => {
    const payDateObj = new Date(p.paidAt || p.createdAt);
    const dateFormatted = payDateObj.toLocaleDateString("en-IN"); // e.g. "24/8/2026" or "27/8/2026"
    const dateISO = payDateObj.toISOString().split("T")[0]; // e.g. "2026-08-24"
    const datePad = payDateObj.toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' }); // "24/08/2026"

    const matchesSearch =
      !searchLower ||
      (p._id || "").toLowerCase().includes(searchLower) ||
      (p.transactionId || "").toLowerCase().includes(searchLower) ||
      (p.customer?.name || "").toLowerCase().includes(searchLower) ||
      (p.customer?.email || "").toLowerCase().includes(searchLower) ||
      (p.customer?.phone || "").toLowerCase().includes(searchLower) ||
      dateFormatted.toLowerCase().includes(searchLower) ||
      dateISO.toLowerCase().includes(searchLower) ||
      datePad.toLowerCase().includes(searchLower);

    const matchesStatus = modalStatusFilter === "ALL" || p.paymentStatus === modalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const modalCollectedTotal = filteredPaymentsModal
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title-box">
          <div className="dash-logo-icon">
            <Activity className="dash-icon" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1>MediDeliver Admin Overview</h1>
              {isRefreshing && (
                <span className="live-sync-indicator">
                  <span className="live-pulse-dot"></span> Live Syncing
                </span>
              )}
            </div>
            <p>Pharmacy System, Sales Reports & Return Management</p>
          </div>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/" className="dash-home-btn" title="Back to Customer Store / Home">
            <ArrowLeft className="dash-btn-icon" />
            <span>Back to Home</span>
          </Link>

          <button
            type="button"
            className="add-med-header-btn"
            onClick={() => setIsAddMedicineOpen(true)}
          >
            <Plus className="add-icon" /> Add New Medicine
          </button>
        </div>
      </div>

      {/* =========================================================
          DATE FILTER TOOLBAR (Kiski kis date ko kitna payment/order/customer hai)
         ========================================================= */}
      <div className="date-filter-bar">
        <div className="filter-title">
          <Calendar className="filter-cal-icon" />
          <span>Filter Records By Date:</span>
        </div>

        <div className="preset-buttons">
          <button
            type="button"
            className={`preset-btn ${dateFilter.preset === "all" ? "active" : ""}`}
            onClick={() => applyDatePreset("all")}
          >
            All Time
          </button>
          <button
            type="button"
            className={`preset-btn ${dateFilter.preset === "today" ? "active" : ""}`}
            onClick={() => applyDatePreset("today")}
          >
            Today
          </button>
          <button
            type="button"
            className={`preset-btn ${dateFilter.preset === "7days" ? "active" : ""}`}
            onClick={() => applyDatePreset("7days")}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={`preset-btn ${dateFilter.preset === "thisMonth" ? "active" : ""}`}
            onClick={() => applyDatePreset("thisMonth")}
          >
            This Month
          </button>
        </div>

        <div className="custom-date-inputs">
          <div className="date-input-group">
            <label>From Date:</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => {
                const start = e.target.value;
                setDateFilter((prev) => ({ ...prev, startDate: start, preset: "custom" }));
                fetchDashboardData(start, dateFilter.endDate);
              }}
            />
          </div>

          <div className="date-input-group">
            <label>To Date:</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => {
                const end = e.target.value;
                setDateFilter((prev) => ({ ...prev, endDate: end, preset: "custom" }));
                fetchDashboardData(dateFilter.startDate, end);
              }}
            />
          </div>

          {(dateFilter.startDate || dateFilter.endDate) && (
            <button
              type="button"
              className="clear-date-btn"
              onClick={() => applyDatePreset("all")}
            >
              <X className="clear-ic" /> Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          INTERACTIVE / CLICKABLE STAT CARDS
         ========================================================= */}
      <div className="stats-grid">
        {/* Card 1: Total Medicines */}
        <div
          className="stat-card clickable-card"
          onClick={handleOpenMedicinesModal}
          title="Click to view all Medicines catalog"
        >
          <div className="stat-icon-box med">
            <Pill className="st-icon" />
          </div>
          <div>
            <h3>Total Medicines</h3>
            <div className="value">{detailsData?.counts?.totalMedicines || dashboard?.totalMedicines || 0}</div>
            <span className="card-click-hint">Click for Medicines List ➔</span>
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div
          className="stat-card clickable-card"
          onClick={handleOpenCustomersModal}
          title="Click to view all Registered Customers list"
        >
          <div className="stat-icon-box cust">
            <Users className="st-icon" />
          </div>
          <div>
            <h3>Total Customers</h3>
            <div className="value">{detailsData?.counts?.totalCustomers || dashboard?.totalCustomers || 0}</div>
            <span className="card-click-hint">Click for Customers List ➔</span>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div
          className="stat-card clickable-card"
          onClick={handleOpenOrdersModal}
          title="Click to view all Orders history"
        >
          <div className="stat-icon-box ord">
            <ShoppingBag className="st-icon" />
          </div>
          <div>
            <h3>Total Orders</h3>
            <div className="value">{detailsData?.counts?.totalOrders || dashboard?.totalOrders || 0}</div>
            <span className="card-click-hint">Click for Orders List ➔</span>
          </div>
        </div>

        {/* Card 4: Total Payments */}
        <div
          className="stat-card clickable-card"
          onClick={handleOpenPaymentsModal}
          title="Click to view Payment Transactions & Revenue"
        >
          <div className="stat-icon-box pay">
            <CreditCard className="st-icon" />
          </div>
          <div>
            <h3>Total Payments</h3>
            <div className="value">
              {detailsData?.counts?.totalPayments || dashboard?.totalPayments || 0}
              {detailsData?.counts?.totalPaymentAmount ? (
                <small className="collected-amount">
                  ₹{Number(detailsData.counts.totalPaymentAmount).toLocaleString()} Total
                </small>
              ) : null}
            </div>
            <span className="card-click-hint">Click for Revenue & Payments ➔</span>
          </div>
        </div>

        {/* Card 5: Customer Inquiries & Support */}
        <div
          className="stat-card clickable-card"
          onClick={handleOpenContactsModal}
          title="Click to view Customer Support inquiries & contact tickets"
        >
          <div className="stat-icon-box support">
            <MessageSquare className="st-icon" />
          </div>
          <div>
            <h3>Support & Inquiries</h3>
            <div className="value">
              {contactStats.total || contactMessages.length || 0}
              {contactStats.new > 0 && (
                <small className="new-inquiries-badge">
                  {contactStats.new} New Unread
                </small>
              )}
            </div>
            <span className="card-click-hint">Click for Support Tickets ➔</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          CUSTOMER MEDICINE RETURNS SECTION
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

          <div className="status-card out_for_delivery">
            <div className="st-hdr">
              <RotateCcw className="st-svg" /> Refunded
            </div>
            <strong>{returnStats.refunded || 0}</strong>
          </div>

          <div className="status-card cancelled">
            <div className="st-hdr">
              <AlertTriangle className="st-svg" /> Rejected
            </div>
            <strong>{returnStats.rejected || 0}</strong>
          </div>
        </div>

        {/* Return Table */}
        {returns.length === 0 ? (
          <div className="empty-returns-box">
            <CheckCircle2 className="empty-check-icon" />
            <h3>No pending medicine return requests</h3>
            <p>Customer return requests will appear here for review & refund processing.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Bill / Order ID</th>
                  <th>Customer Info</th>
                  <th>Medicine & Issue</th>
                  <th>Payment & Refund Destination</th>
                  <th>Proof Photo</th>
                  <th>Status</th>
                  <th>Admin Action & Notes</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong className="order-id">#{item.orderNumber || item.billNumber || item._id.slice(-6)}</strong>
                      <br />
                      <small className="order-date">
                        {new Date(item.createdAt).toLocaleDateString("en-IN")}
                      </small>
                    </td>
                    <td>
                      <strong className="cust-name">{item.customerName}</strong><br />
                      <small className="cust-phone">📞 {item.customerPhone}</small><br />
                      <small className="cust-email">{item.customerEmail}</small>
                    </td>
                    <td>
                      <span className="reason-badge">{item.reason || item.returnReason}</span>
                      <strong className="med-name-disp">Med: {item.medicineName}</strong>
                      <p className="description-text">"{item.description || item.explanation}"</p>
                    </td>
                    <td>
                      <div className="rx-refund-info-cell">
                        <span className={`pay-tag ${item.orderPaymentMethod === "ONLINE" ? "online" : "cod"}`}>
                          {item.orderPaymentMethod === "ONLINE" ? "💳 Online (Razorpay)" : "💵 COD"}
                        </span>
                        <strong className="text-teal">Refund: ₹{Number(item.refundAmount || item.orderTotal || 0).toFixed(2)}</strong>
                        <div className="refund-dest-desc">
                          {item.refundMethod === "UPI" ? (
                            <span>⚡ UPI: <code>{item.refundUpiId || "Registered UPI"}</code></span>
                          ) : item.refundMethod === "BANK_TRANSFER" ? (
                            <span>🏦 A/c: <code>{item.refundAccountNumber || "Bank A/c"}</code> (IFSC: {item.refundIfsc})</span>
                          ) : (
                            <span>🔄 Original Source (Razorpay/Card)</span>
                          )}
                        </div>
                        {item.status === "REFUNDED" && item.refundTransactionId && (
                          <small className="refund-ref-tag">Ref: {item.refundTransactionId}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      {item.proofPhoto || item.proofImage ? (
                        <button
                          type="button"
                          className="rx-view-proof-btn"
                          onClick={() => setSelectedProofImage(item.proofPhoto || item.proofImage)}
                          title="Click to view full return proof photo"
                        >
                          <Eye className="eye-ic-sm" />
                          <span>View Image</span>
                        </button>
                      ) : (
                        <span className="no-proof-muted">No photo</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-notes-box">
                        <input
                          type="text"
                          placeholder="Add Note / Instructions..."
                          className="admin-note-input"
                          value={adminNotes[item._id] ?? item.adminNotes ?? ""}
                          onChange={(e) =>
                            setAdminNotes({ ...adminNotes, [item._id]: e.target.value })
                          }
                        />

                        <div className="action-buttons-group">
                          {item.status !== "APPROVED" && item.status !== "REFUNDED" && (
                            <button
                              type="button"
                              className="btn-action approve"
                              disabled={updatingId === item._id}
                              onClick={() => handleUpdateReturnStatus(item._id, "APPROVED")}
                            >
                              <Check className="act-ic" /> Approve
                            </button>
                          )}

                          {item.status !== "REFUNDED" && (
                            <button
                              type="button"
                              className="btn-action refund"
                              disabled={updatingId === item._id}
                              onClick={() => handleOpenRefundModal(item)}
                            >
                              <RotateCcw className="act-ic" /> Process Refund
                            </button>
                          )}

                          {item.status !== "REJECTED" && (
                            <button
                              type="button"
                              className="btn-action reject"
                              disabled={updatingId === item._id}
                              onClick={() => handleUpdateReturnStatus(item._id, "REJECTED")}
                            >
                              <X className="act-ic" /> Reject
                            </button>
                          )}
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

      {/* =========================================================
          CUSTOMER SUPPORT TICKETS & CONTACT INQUIRIES SECTION
         ========================================================= */}
      <div className="dashboard-section inquiries-admin-section">
        <div className="section-title-row">
          <div>
            <h2>
              <MessageSquare className="sec-icon text-teal" /> Customer Support Tickets & Contact Inquiries
            </h2>
            <p className="section-subtitle">
              Messages and support forms submitted by users & visitors from the Contact Us page.
            </p>
          </div>

          <div className="inquiry-filter-pills">
            <button
              type="button"
              className={`inq-filter-btn ${contactStatusFilter === "ALL" ? "active" : ""}`}
              onClick={() => setContactStatusFilter("ALL")}
            >
              All ({contactStats.total || contactMessages.length})
            </button>
            <button
              type="button"
              className={`inq-filter-btn new-btn ${contactStatusFilter === "NEW" ? "active" : ""}`}
              onClick={() => setContactStatusFilter("NEW")}
            >
              <span className="dot-pulse"></span> New ({contactStats.new || 0})
            </button>
            <button
              type="button"
              className={`inq-filter-btn inprogress-btn ${contactStatusFilter === "IN_PROGRESS" ? "active" : ""}`}
              onClick={() => setContactStatusFilter("IN_PROGRESS")}
            >
              In Progress ({contactStats.inProgress || 0})
            </button>
            <button
              type="button"
              className={`inq-filter-btn resolved-btn ${contactStatusFilter === "RESOLVED" ? "active" : ""}`}
              onClick={() => setContactStatusFilter("RESOLVED")}
            >
              Resolved ({contactStats.resolved || 0})
            </button>
          </div>
        </div>

        {/* Inquiry Stats Strip */}
        <div className="status-grid inquiry-stats-grid">
          <div className="status-card placed">
            <div className="st-hdr">
              <Clock className="st-svg" /> New Unread
            </div>
            <strong>{contactStats.new || 0}</strong>
          </div>

          <div className="status-card confirmed">
            <div className="st-hdr">
              <MessageCircle className="st-svg" /> In Progress
            </div>
            <strong>{contactStats.inProgress || 0}</strong>
          </div>

          <div className="status-card out_for_delivery">
            <div className="st-hdr">
              <CheckCircle2 className="st-svg" /> Resolved Tickets
            </div>
            <strong>{contactStats.resolved || 0}</strong>
          </div>

          <div className="status-card delivered">
            <div className="st-hdr">
              <MessageSquare className="st-svg" /> Total Inquiries
            </div>
            <strong>{contactStats.total || contactMessages.length || 0}</strong>
          </div>
        </div>

        {/* Inquiries Table */}
        {contactMessages.filter(
          (m) => contactStatusFilter === "ALL" || m.status === contactStatusFilter
        ).length === 0 ? (
          <div className="empty-returns-box">
            <CheckCircle2 className="empty-check-icon" />
            <h3>No customer inquiries found for this filter</h3>
            <p>New inquiries submitted from the Contact Us page will automatically appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table inq-dash-table">
              <thead>
                <tr>
                  <th>Ticket ID / Date</th>
                  <th>Customer Information</th>
                  <th>Category & Subject</th>
                  <th>Message / Inquiry Details</th>
                  <th>Status</th>
                  <th>Admin Action & Reply</th>
                </tr>
              </thead>
              <tbody>
                {contactMessages
                  .filter(
                    (m) => contactStatusFilter === "ALL" || m.status === contactStatusFilter
                  )
                  .map((item) => (
                    <tr key={item._id} className={item.status === "NEW" ? "new-inquiry-row" : ""}>
                      <td>
                        <strong className="order-id">#{item.ticketId}</strong>
                        <br />
                        <small className="order-date">
                          {new Date(item.createdAt).toLocaleDateString("en-IN")}<br />
                          {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </td>

                      <td>
                        <strong className="cust-name">{item.name}</strong><br />
                        {item.phone && (
                          <a href={`tel:${item.phone}`} className="inq-phone-link" title="Click to call">
                            <Phone className="mini-inq-ico" /> {item.phone}
                          </a>
                        )}
                        <br />
                        <a href={`mailto:${item.email}`} className="inq-email-link" title="Click to email">
                          <Mail className="mini-inq-ico" /> {item.email}
                        </a>
                      </td>

                      <td>
                        <span className="inq-category-pill">{item.category || "General Inquiry"}</span>
                        <strong className="inq-subject-text">{item.subject || "No Subject"}</strong>
                      </td>

                      <td className="inq-msg-cell">
                        <div className="inq-message-box">
                          <p>"{item.message}"</p>
                        </div>
                        {item.adminNotes && (
                          <div className="inq-admin-note-badge">
                            <strong>Note:</strong> {item.adminNotes}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`status-pill inq-status-${item.status.toLowerCase()}`}>
                          {item.status === "NEW" ? "NEW UNREAD" : item.status.replace("_", " ")}
                        </span>
                      </td>

                      <td>
                        <div className="action-notes-box">
                          <input
                            type="text"
                            placeholder="Add admin note..."
                            className="admin-note-input"
                            value={contactAdminNotes[item._id] ?? item.adminNotes ?? ""}
                            onChange={(e) =>
                              setContactAdminNotes({
                                ...contactAdminNotes,
                                [item._id]: e.target.value,
                              })
                            }
                          />

                          <div className="action-buttons-group">
                            {item.phone && (
                              <a
                                href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                                  item.name
                                )},%20this%20is%20MediDeliver%20Support%20regarding%20ticket%20%23${item.ticketId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-action whatsapp-action-btn"
                                title="Reply directly via WhatsApp"
                              >
                                <ExternalLink className="act-ic" /> WhatsApp Reply
                              </a>
                            )}

                            {item.status !== "IN_PROGRESS" && item.status !== "RESOLVED" && (
                              <button
                                type="button"
                                className="btn-action inprogress"
                                disabled={updatingContactId === item._id}
                                onClick={() => handleUpdateContactStatus(item._id, "IN_PROGRESS")}
                              >
                                <Clock className="act-ic" /> In Progress
                              </button>
                            )}

                            {item.status !== "RESOLVED" && (
                              <button
                                type="button"
                                className="btn-action approve"
                                disabled={updatingContactId === item._id}
                                onClick={() => handleUpdateContactStatus(item._id, "RESOLVED")}
                              >
                                <Check className="act-ic" /> Mark Resolved
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn-action delete-inq-btn"
                              onClick={() => handleDeleteContactMessage(item._id, item.ticketId)}
                              title="Delete inquiry"
                            >
                              <Trash2 className="act-ic" />
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

      {/* =========================================================
          DETAIL MODALS FOR STAT CARDS (Medicines, Customers, Orders, Payments)
         ========================================================= */}

      {/* 1. MEDICINES LIST MODAL */}
      {activeDetailModal === "medicines" && (
        <div className="modal-backdrop" onClick={() => setActiveDetailModal(null)}>
          <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="modal-title-wrap">
                <Pill className="modal-title-ic text-teal" />
                <div>
                  <h2>Medicines Inventory Catalog</h2>
                  <p>Showing {filteredMedicinesModal.length} medicines in inventory</p>
                </div>
              </div>

              <div className="modal-header-actions">
                <div className={`modal-search-box ${modalSearch ? "active-searching" : ""}`}>
                  <Search className="search-ic" />
                  <input
                    type="text"
                    placeholder="Search medicine, category, brand..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                  />
                  {modalSearch && (
                    <button type="button" className="modal-search-clear-btn" onClick={() => setModalSearch("")} title="Clear search">
                      <X className="modal-clear-ic" />
                    </button>
                  )}
                </div>
                <button type="button" className="close-modal-btn" onClick={() => setActiveDetailModal(null)}>
                  <X />
                </button>
              </div>
            </div>

            <div className="detail-modal-body">
              <div className="table-responsive">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Medicine Name</th>
                      <th>Category</th>
                      <th>Company</th>
                      <th>Batch #</th>
                      <th>Selling Price</th>
                      <th>Stock</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicinesModal.map((med, idx) => (
                      <tr key={med._id || idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{med.name}</strong></td>
                        <td><span className="med-cat-tag">{med.category || "Healthcare"}</span></td>
                        <td>{med.company || "Generic"}</td>
                        <td><code>{med.batchNumber || "BATCH-001"}</code></td>
                        <td><strong className="text-teal">₹{Number(med.sellingPrice || 0).toFixed(2)}</strong></td>
                        <td>
                          {med.stock <= 0 ? (
                            <span className="stock-badge out">Out of Stock</span>
                          ) : med.stock <= (med.minimumStock || 10) ? (
                            <span className="stock-badge low">Low ({med.stock})</span>
                          ) : (
                            <span className="stock-badge good">In Stock ({med.stock})</span>
                          )}
                        </td>
                        <td>{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString("en-IN") : "2028-12-31"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOMERS LIST MODAL */}
      {activeDetailModal === "customers" && (
        <div className="modal-backdrop" onClick={() => setActiveDetailModal(null)}>
          <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="modal-title-wrap">
                <Users className="modal-title-ic text-teal" />
                <div>
                  <h2>Registered Pharmacy Customers</h2>
                  <p>Showing {filteredCustomersModal.length} registered customers</p>
                </div>
              </div>

              <div className="modal-header-actions">
                <div className={`modal-search-box ${modalSearch ? "active-searching" : ""}`}>
                  <Search className="search-ic" />
                  <input
                    type="text"
                    placeholder="Search customer name, email, phone..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                  />
                  {modalSearch && (
                    <button type="button" className="modal-search-clear-btn" onClick={() => setModalSearch("")} title="Clear search">
                      <X className="modal-clear-ic" />
                    </button>
                  )}
                </div>
                <button type="button" className="close-modal-btn" onClick={() => setActiveDetailModal(null)}>
                  <X />
                </button>
              </div>
            </div>

            <div className="detail-modal-body">
              <div className="table-responsive">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>Delivery Address</th>
                      <th>Joined / Date</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomersModal.map((cust, idx) => (
                      <tr key={cust.id || cust._id || idx}>
                        <td>{idx + 1}</td>
                        <td><strong>{cust.name}</strong></td>
                        <td>{cust.email}</td>
                        <td>📞 {cust.phone}</td>
                        <td>{cust.address}</td>
                        <td>{cust.createdAt ? new Date(cust.createdAt).toLocaleDateString("en-IN") : "Recent"}</td>
                        <td>
                          <div className="cust-actions">
                            <button
                              type="button"
                              className="cust-btn-edit"
                              onClick={() => handleEditCustomer(cust)}
                              title="Edit Customer"
                            >
                              <Edit2 className="act-ic" /> Edit
                            </button>
                            <button
                              type="button"
                              className="cust-btn-delete"
                              onClick={() => handleDeleteCustomer(cust)}
                              title="Delete Customer"
                            >
                              <Trash2 className="act-ic" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.1 EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }} onClick={() => setEditingCustomer(null)}>
          <div className="modal-content edit-cust-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-cust-header">
              <div className="edit-cust-title-wrap">
                <Users className="modal-title-ic text-teal" />
                <div>
                  <h2>Edit Customer Details</h2>
                  <p>Update customer contact or delivery address</p>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setEditingCustomer(null)}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="edit-cust-form">
              <div className="edit-cust-field">
                <label>Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editCustomerForm.name}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                />
              </div>

              <div className="edit-cust-row">
                <div className="edit-cust-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editCustomerForm.email}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                  />
                </div>
                <div className="edit-cust-field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="edit-cust-field">
                <label>Delivery Address</label>
                <textarea
                  rows="3"
                  value={editCustomerForm.address}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, address: e.target.value })}
                />
              </div>

              <div className="edit-cust-actions">
                <button
                  type="button"
                  className="edit-cust-cancel-btn"
                  onClick={() => setEditingCustomer(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-cust-save-btn"
                  disabled={isSavingCustomer}
                >
                  {isSavingCustomer ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ORDERS LIST MODAL */}
      {activeDetailModal === "orders" && (
        <div className="modal-backdrop" onClick={() => setActiveDetailModal(null)}>
          <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="modal-title-wrap">
                <ShoppingBag className="modal-title-ic text-teal" />
                <div>
                  <h2>Pharmacy Orders History</h2>
                  <p>Showing {filteredOrdersModal.length} orders</p>
                </div>
              </div>

              <div className="modal-header-actions">
                <select
                  className="modal-status-select"
                  value={modalStatusFilter}
                  onChange={(e) => setModalStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PLACED">Placed</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PACKED">Packed</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <div className={`modal-search-box ${modalSearch ? "active-searching" : ""}`}>
                  <Search className="search-ic" />
                  <input
                    type="text"
                    placeholder="Search Order #, customer..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                  />
                  {modalSearch && (
                    <button type="button" className="modal-search-clear-btn" onClick={() => setModalSearch("")} title="Clear search">
                      <X className="modal-clear-ic" />
                    </button>
                  )}
                </div>
                <button type="button" className="close-modal-btn" onClick={() => setActiveDetailModal(null)}>
                  <X />
                </button>
              </div>
            </div>

            <div className="detail-modal-body">
              <div className="table-responsive">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Contact</th>
                      <th>Items Purchased</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Order Status</th>
                      <th>Order Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrdersModal.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <code>#{ord.orderNumber || ord._id.slice(-6).toUpperCase()}</code>
                          <br />
                          <small className="order-date">{new Date(ord.createdAt).toLocaleDateString("en-IN")}</small>
                        </td>
                        <td>
                          <strong>{ord.customerName || ord.customer?.name || "Customer"}</strong><br />
                          <small>📞 {ord.customerPhone || ord.customer?.phone || "N/A"}</small>
                          <small className="address-sub">{ord.deliveryAddress || "Address on File"}</small>
                        </td>
                        <td>
                          {ord.orderType === "PRESCRIPTION" || ord.prescriptionImage ? (
                            <div className="rx-dashboard-order-box">
                              <span className="rx-order-pill">📋 Doctor Prescription</span>
                              {ord.doctorName && (
                                <div className="rx-doc-name">🩺 Dr: {ord.doctorName}</div>
                              )}
                              {ord.prescriptionNotes && (
                                <div className="rx-notes-text">
                                  <strong>Req:</strong> {ord.prescriptionNotes}
                                </div>
                              )}
                              {ord.prescriptionImage ? (
                                <button
                                  type="button"
                                  className="rx-view-doc-btn"
                                  onClick={() => setSelectedProofImage(ord.prescriptionImage)}
                                >
                                  <Eye className="eye-ic-xs" /> View Prescription Image
                                </button>
                              ) : (
                                <small className="text-muted">No image attached</small>
                              )}
                            </div>
                          ) : ord.items && ord.items.length > 0 ? (
                            ord.items.map((i, k) => (
                              <div key={k} className="item-line">
                                • {i.medicine?.name || i.name || "Medicine Item"} x {i.quantity} (₹{i.price || i.medicine?.sellingPrice || 65})
                              </div>
                            ))
                          ) : (
                            <span>Medicine Items</span>
                          )}
                        </td>
                        <td><strong className="text-teal">₹{Number(ord.totalAmount || 0).toFixed(2)}</strong></td>
                        <td>
                          <span className={`pay-tag ${ord.paymentStatus?.toLowerCase()}`}>
                            {ord.paymentMethod === "ONLINE" ? "Razorpay Online" : "COD"} ({ord.paymentStatus || "PAID"})
                          </span>
                        </td>
                        <td>
                          <div className="status-action-cell">
                            <span className={`status-pill ${ord.orderStatus?.toLowerCase()}`}>
                              {ord.orderStatus}
                            </span>
                            <select
                              className="order-status-change-select"
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            >
                              <option value="PLACED">PLACED (Pending Verification)</option>
                              <option value="CONFIRMED">CONFIRMED (Admin Received & Accepted)</option>
                              <option value="PACKED">PACKED (Medicines Packed & Ready)</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (Handed to Rider)</option>
                              <option value="DELIVERED">DELIVERED (Delivered to Customer)</option>
                              <option value="CANCELLED">CANCELLED (Order Cancelled)</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYMENTS LIST MODAL */}
      {activeDetailModal === "payments" && (
        <div className="modal-backdrop" onClick={() => setActiveDetailModal(null)}>
          <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="modal-title-wrap">
                <CreditCard className="modal-title-ic text-teal" />
                <div>
                  <h2>Payments & Revenue Transactions</h2>
                  <p>Showing {filteredPaymentsModal.length} payment records</p>
                </div>
              </div>

              <div className="modal-header-actions">
                <div className="revenue-pill">
                  ₹{Number(modalCollectedTotal).toLocaleString()} Collected
                </div>

                <div className={`modal-search-box ${modalSearch ? "active-searching" : ""}`} title="Filter by date (e.g. 24/8/2026 or 2026-08-24)">
                  <Search className="search-ic" />
                  <input
                    type="text"
                    placeholder="Search customer, date (24/8/2026)..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                  />
                  {modalSearch && (
                    <button type="button" className="modal-search-clear-btn" onClick={() => setModalSearch("")} title="Clear search">
                      <X className="modal-clear-ic" />
                    </button>
                  )}
                </div>

                <div className="modal-date-picker">
                  <input
                    type="date"
                    className="modal-date-input"
                    onChange={(e) => {
                      if (e.target.value) {
                        const [yyyy, mm, dd] = e.target.value.split("-");
                        setModalSearch(`${parseInt(dd)}/${parseInt(mm)}/${yyyy}`);
                      } else {
                        setModalSearch("");
                      }
                    }}
                    title="Pick a specific date"
                  />
                </div>

                <button type="button" className="close-modal-btn" onClick={() => setActiveDetailModal(null)}>
                  <X />
                </button>
              </div>
            </div>

            <div className="detail-modal-body">
              <div className="table-responsive">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Transaction ID / Order</th>
                      <th>Customer Name</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Payment Status</th>
                      <th>Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPaymentsModal.map((pay) => (
                      <tr key={pay._id}>
                        <td><code>{pay.transactionId || pay.razorpayPaymentId || `#TXN-${pay._id.slice(-6)}`}</code></td>
                        <td>
                          <strong>{pay.customer?.name || "Customer"}</strong><br />
                          <small>{pay.customer?.email || pay.customer?.phone}</small>
                        </td>
                        <td><strong className="text-teal">₹{Number(pay.amount || 0).toFixed(2)}</strong></td>
                        <td>
                          <span className="pay-method-badge">
                            {pay.paymentMethod === "ONLINE" ? "Razorpay Online" : "Cash on Delivery"}
                          </span>
                        </td>
                        <td>
                          <div className="status-action-cell">
                            <span className={`status-pill ${pay.paymentStatus?.toLowerCase()}`}>
                              {pay.paymentStatus}
                            </span>
                            <select
                              className="order-status-change-select"
                              value={pay.paymentStatus || "PENDING"}
                              onChange={(e) => handleUpdatePaymentStatus(pay._id, e.target.value)}
                            >
                              <option value="PAID">PAID (Collected)</option>
                              <option value="PENDING">PENDING</option>
                              <option value="FAILED">FAILED</option>
                              <option value="REFUNDED">REFUNDED</option>
                            </select>
                          </div>
                        </td>
                        <td>{new Date(pay.paidAt || pay.createdAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONTACT INQUIRIES MODAL */}
      {activeDetailModal === "contacts" && (
        <div className="modal-backdrop" onClick={() => setActiveDetailModal(null)}>
          <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="modal-title-wrap">
                <MessageSquare className="modal-title-ic text-teal" />
                <div>
                  <h2>Customer Support & Contact Inquiries</h2>
                  <p>All support inquiries submitted via the Contact Us form</p>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setActiveDetailModal(null)}
              >
                <X />
              </button>
            </div>

            <div className="detail-modal-toolbar">
              <div className={`modal-search-box ${modalSearch ? "active-searching" : ""}`}>
                <Search className="search-ic" />
                <input
                  type="text"
                  placeholder="Search by Ticket ID, Customer Name, Email, Phone, Subject..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                />
                {modalSearch && (
                  <button type="button" className="modal-search-clear-btn" onClick={() => setModalSearch("")} title="Clear search">
                    <X className="modal-clear-ic" />
                  </button>
                )}
              </div>

              <select
                className="modal-status-select"
                value={modalStatusFilter}
                onChange={(e) => setModalStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({contactMessages.length})</option>
                <option value="NEW">New Unread ({contactStats.new || 0})</option>
                <option value="IN_PROGRESS">In Progress ({contactStats.inProgress || 0})</option>
                <option value="RESOLVED">Resolved ({contactStats.resolved || 0})</option>
              </select>
            </div>

            <div className="detail-modal-body">
              <div className="table-responsive">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer Details</th>
                      <th>Category & Subject</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactMessages
                      .filter((m) => {
                        const s = modalSearch.toLowerCase().trim();
                        const matchesSearch =
                          !s ||
                          (m.ticketId || "").toLowerCase().includes(s) ||
                          (m.name || "").toLowerCase().includes(s) ||
                          (m.email || "").toLowerCase().includes(s) ||
                          (m.phone || "").toLowerCase().includes(s) ||
                          (m.subject || "").toLowerCase().includes(s) ||
                          (m.message || "").toLowerCase().includes(s);
                        const matchesStatus =
                          modalStatusFilter === "ALL" || m.status === modalStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((item) => (
                        <tr key={item._id}>
                          <td>
                            <strong>#{item.ticketId}</strong>
                            <br />
                            <small className="text-muted">
                              {new Date(item.createdAt).toLocaleDateString("en-IN")}
                            </small>
                          </td>
                          <td>
                            <strong>{item.name}</strong>
                            <br />
                            <small>📞 {item.phone || "N/A"}</small>
                            <br />
                            <small>✉️ {item.email}</small>
                          </td>
                          <td>
                            <span className="inq-category-pill">{item.category}</span>
                            <br />
                            <strong>{item.subject}</strong>
                          </td>
                          <td style={{ maxWidth: "260px" }}>
                            <p style={{ margin: 0, fontSize: "0.82rem", color: "#334155" }}>
                              "{item.message}"
                            </p>
                          </td>
                          <td>
                            <span className={`status-pill inq-status-${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              {item.status !== "RESOLVED" && (
                                <button
                                  type="button"
                                  className="btn-action approve"
                                  onClick={() => handleUpdateContactStatus(item._id, "RESOLVED")}
                                >
                                  <Check className="act-ic" /> Resolve
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-action delete-inq-btn"
                                onClick={() => handleDeleteContactMessage(item._id, item.ticketId)}
                              >
                                <Trash2 className="act-ic" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR PROOF IMAGES */}
      {selectedProofImage && (
        <div className="modal-backdrop" onClick={() => setSelectedProofImage(null)}>
          <div className="modal-content image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Medicine Proof Image</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedProofImage(null)}
              >
                <X />
              </button>
            </div>
            <div className="modal-body text-center">
              <img src={selectedProofImage} alt="Return Proof Full" className="full-proof-img" />
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDICINE MODAL */}
      {isAddMedicineOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddMedicineOpen(false)}>
          <div className="add-medicine-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="add-med-modal-header">
              <div className="hdr-title-wrap">
                <Pill className="hdr-pill-icon" />
                <div>
                  <h2>Add New Medicine to Catalog</h2>
                  <p>Add a new medicine to inventory stock and online catalog</p>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsAddMedicineOpen(false)}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="add-medicine-form">
              <div className="form-group full-width">
                <label>Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dolo 650mg Tablet"
                  value={medicineForm.name}
                  onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company / Brand</label>
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
                    <option value="Micro Labs">Micro Labs</option>
                    <option value="Himalaya Wellness">Himalaya Wellness</option>
                    <option value="Dabur India">Dabur India</option>
                    <option value="Custom">+ Add Custom Company</option>
                  </select>
                </div>

                {medicineForm.company === "Custom" && (
                  <div className="form-group">
                    <label>Custom Company Name</label>
                    <input
                      type="text"
                      placeholder="Enter company name"
                      value={medicineForm.customCompany}
                      onChange={(e) => setMedicineForm({ ...medicineForm, customCompany: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={medicineForm.category}
                    onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
                  >
                    <option value="Medicines">Medicines</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Healthcare Devices">Healthcare Devices</option>
                    <option value="Ayurvedic & Herbal">Ayurvedic & Herbal</option>
                    <option value="Baby & Mom">Baby & Mom</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={medicineForm.sellingPrice}
                    onChange={(e) => setMedicineForm({ ...medicineForm, sellingPrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="90.00"
                    value={medicineForm.purchasePrice}
                    onChange={(e) => setMedicineForm({ ...medicineForm, purchasePrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Batch Number (Batch #)</label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-CIP-101 (Auto-generated if empty)"
                    value={medicineForm.batchNumber}
                    onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock Qty</label>
                  <input
                    type="number"
                    value={medicineForm.stock}
                    onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })}
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

              <div className="add-med-actions-row">
                <button type="button" className="cancel-med-btn" onClick={() => setIsAddMedicineOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-med-btn" disabled={addingMedicine}>
                  {addingMedicine ? "Adding Medicine..." : "Save Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          REFUND EXECUTION & SETTLEMENT MODAL
         ========================================================= */}
      {refundModalItem && (
        <div className="modal-backdrop" onClick={() => setRefundModalItem(null)}>
          <div className="modal-content refund-execution-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-hdr-left">
                <RotateCcw className="modal-hdr-icon text-teal" />
                <div>
                  <h3>Process Payment Refund</h3>
                  <p>Order #{refundModalItem.billNumber || refundModalItem.orderNumber || refundModalItem._id.slice(-6)} • {refundModalItem.customerName}</p>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setRefundModalItem(null)}
              >
                <X className="x-ic" />
              </button>
            </div>

            <div className="modal-body refund-modal-body">
              <div className="refund-summary-box">
                <div className="ref-sum-row">
                  <span>Customer Name:</span>
                  <strong>{refundModalItem.customerName} (📞 {refundModalItem.customerPhone})</strong>
                </div>
                <div className="ref-sum-row">
                  <span>Returned Medicine:</span>
                  <strong>{refundModalItem.medicineName}</strong>
                </div>
                <div className="ref-sum-row">
                  <span>Order Payment Method:</span>
                  <strong className="text-teal">
                    {refundModalItem.orderPaymentMethod === "ONLINE"
                      ? "💳 Online Paid (Razorpay / UPI)"
                      : "💵 Cash on Delivery (COD)"}
                  </strong>
                </div>
                <div className="ref-sum-row">
                  <span>Refund Destination:</span>
                  <strong className="refund-highlight-dest">
                    {refundModalItem.refundMethod === "UPI"
                      ? `⚡ UPI: ${refundModalItem.refundUpiId || "Customer UPI"}`
                      : refundModalItem.refundMethod === "BANK_TRANSFER"
                        ? `🏦 Bank A/c: ${refundModalItem.refundAccountNumber} (IFSC: ${refundModalItem.refundIfsc}, Holder: ${refundModalItem.refundAccountHolder})`
                        : "🔄 Original Payment Source (Razorpay Auto-Refund)"}
                  </strong>
                </div>
              </div>

              <div className="refund-inputs-grid">
                <div className="form-group">
                  <label>Refund Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="modal-input"
                    value={refundAmountInput}
                    onChange={(e) => setRefundAmountInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Refund Reference / Transaction ID (UTR) *</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={refundTxnInput}
                    onChange={(e) => setRefundTxnInput(e.target.value)}
                    placeholder="e.g. RFND-RZP-9281928"
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Admin Resolution Note (Visible to Customer)</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Approved. Payment refunded back to original account."
                  value={adminNotes[refundModalItem._id] ?? refundModalItem.adminNotes ?? ""}
                  onChange={(e) =>
                    setAdminNotes({ ...adminNotes, [refundModalItem._id]: e.target.value })
                  }
                />
              </div>

              <div className="refund-actions-bar">
                <button
                  type="button"
                  className="cancel-med-btn"
                  onClick={() => setRefundModalItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-action refund refund-confirm-btn"
                  disabled={isProcessingRefund || !refundAmountInput || !refundTxnInput}
                  onClick={handleConfirmRefund}
                >
                  {isProcessingRefund ? "Processing Refund..." : `Confirm & Issue ₹${Number(refundAmountInput || 0).toFixed(2)} Refund`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
