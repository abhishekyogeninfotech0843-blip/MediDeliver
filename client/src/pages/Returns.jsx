import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  HelpCircle,
  Lock,
  ShoppingBag,
  CreditCard,
  Landmark,
  Banknote,
  Send,
  Eye,
  Check,
  X,
  Plus,
  ArrowLeft,
  LayoutDashboard,
  Filter,
  DollarSign,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";
import "./Returns.css";

const REASON_OPTIONS = [
  "Wrong Medicine Delivered",
  "Damaged / Expired Product",
  "Package Tampered",
  "Ordered by Mistake",
  "Other Issue",
];

const DEFAULT_SEED_RETURNS = [
  {
    _id: "6a9d543d9a9409d1a18b732a",
    billNumber: "887323",
    orderId: "6a9d50ba9a9409d1a18b7323",
    customerName: "Sunita chauhan",
    customerEmail: "sunita@gmail.com",
    customerPhone: "8171915305",
    medicineName: "Betnovate C",
    returnReason: "Wrong Medicine Delivered",
    explanation: "Received different tube packaging than ordered. Seal was intact but wrong strength delivered.",
    orderPaymentMethod: "ONLINE",
    orderTotal: 65,
    refundAmount: 65,
    refundMethod: "ORIGINAL_SOURCE",
    status: "PENDING",
    proofImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: "6a9d543d9a9409d1a18b732b",
    billNumber: "018192",
    orderId: "66f201010101010101010181",
    customerName: "Nikhil Chauhan",
    customerEmail: "nikhil@gmail.com",
    customerPhone: "9457155186",
    medicineName: "Paracetamol 650mg (Dolo)",
    returnReason: "Damaged / Expired Product",
    explanation: "Blister strip had 2 damaged tablets during delivery transit.",
    orderPaymentMethod: "COD",
    orderTotal: 60,
    refundAmount: 60,
    refundMethod: "UPI",
    refundUpiId: "9457155186@paytm",
    status: "APPROVED",
    adminNotes: "Pickup scheduled with courier partner. Verification approved.",
    proofImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
  {
    _id: "6a9d543d9a9409d1a18b732c",
    billNumber: "4F23A0",
    orderId: "66f201010101010101010182",
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@gmail.com",
    customerPhone: "9876543210",
    medicineName: "Azithromycin 500mg",
    returnReason: "Damaged / Expired Product",
    explanation: "Box seal was broken upon doorstep delivery.",
    orderPaymentMethod: "ONLINE",
    orderTotal: 120,
    refundAmount: 120,
    refundMethod: "ORIGINAL_SOURCE",
    status: "APPROVED",
    adminNotes: "Replacement or refund approved. Doorstep inspection verified.",
    proofImage: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 48),
  },
  {
    _id: "6a9d543d9a9409d1a18b732d",
    billNumber: "E1479C",
    orderId: "66f201010101010101010183",
    customerName: "Priya Verma",
    customerEmail: "priya.verma@gmail.com",
    customerPhone: "9123456780",
    medicineName: "Pantocid DSR Capsule",
    returnReason: "Ordered by Mistake",
    explanation: "Doctor advised a different antacid brand.",
    orderPaymentMethod: "COD",
    orderTotal: 195,
    refundAmount: 195,
    refundMethod: "UPI",
    refundUpiId: "priya@okaxis",
    status: "APPROVED",
    adminNotes: "Unopened strips confirmed by courier delivery agent.",
    proofImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 72),
  },
  {
    _id: "6a9d543d9a9409d1a18b732e",
    billNumber: "7B198D",
    orderId: "66f201010101010101010184",
    customerName: "Amit Patel",
    customerEmail: "amit.patel@gmail.com",
    customerPhone: "9811223344",
    medicineName: "Augmentin 625 Duo",
    returnReason: "Wrong Medicine Delivered",
    explanation: "Delivered 375mg instead of requested 625mg dosage.",
    orderPaymentMethod: "ONLINE",
    orderTotal: 210,
    refundAmount: 210,
    refundMethod: "ORIGINAL_SOURCE",
    status: "APPROVED",
    adminNotes: "Verified wrong dosage shipment.",
    proofImage: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 96),
  },
  {
    _id: "6a9d543d9a9409d1a18b732f",
    billNumber: "9C22E1",
    orderId: "66f201010101010101010185",
    customerName: "Sneha Gupta",
    customerEmail: "sneha.gupta@gmail.com",
    customerPhone: "9988776655",
    medicineName: "Montair LC Tablet",
    returnReason: "Package Tampered",
    explanation: "Outer parcel had moisture exposure.",
    orderPaymentMethod: "ONLINE",
    orderTotal: 180,
    refundAmount: 180,
    refundMethod: "ORIGINAL_SOURCE",
    status: "APPROVED",
    adminNotes: "Transit damage accepted. Return approved.",
    proofImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 120),
  },
  {
    _id: "6a9d543d9a9409d1a18b7330",
    billNumber: "3D88F2",
    orderId: "66f201010101010101010186",
    customerName: "Vikram Singh",
    customerEmail: "vikram.singh@gmail.com",
    customerPhone: "9765432109",
    medicineName: "Telma 40 Tablet",
    returnReason: "Ordered by Mistake",
    explanation: "Duplicate prescription refill was ordered by caregiver.",
    orderPaymentMethod: "COD",
    orderTotal: 145,
    refundAmount: 145,
    refundMethod: "BANK_TRANSFER",
    refundAccountNumber: "987654321012",
    refundIfsc: "HDFC0001234",
    refundAccountHolder: "Vikram Singh",
    status: "APPROVED",
    adminNotes: "Intact packaging returned. Bank refund authorized.",
    proofImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 144),
  },
  {
    _id: "6a9d543d9a9409d1a18b7331",
    billNumber: "5A1104",
    orderId: "66f201010101010101010187",
    customerName: "Ananya Roy",
    customerEmail: "ananya.roy@gmail.com",
    customerPhone: "9845123456",
    medicineName: "Shelcal 500 Tablet",
    returnReason: "Wrong Medicine Delivered",
    explanation: "Received Shelcal HD instead of plain Shelcal 500.",
    orderPaymentMethod: "ONLINE",
    orderTotal: 115,
    refundAmount: 115,
    refundMethod: "ORIGINAL_SOURCE",
    status: "APPROVED",
    adminNotes: "Replacement approved by pharmacist.",
    proofImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 168),
  },
  {
    _id: "6a9d543d9a9409d1a18b7332",
    billNumber: "2C9901",
    orderId: "66f201010101010101010188",
    customerName: "Rohit Malhotra",
    customerEmail: "rohit.m@gmail.com",
    customerPhone: "9712345678",
    medicineName: "Pan 40 Tablet",
    returnReason: "Damaged / Expired Product",
    explanation: "Foil packaging was punctured during transit.",
    orderPaymentMethod: "ONLINE",
    orderTotal: 155,
    refundAmount: 155,
    refundMethod: "ORIGINAL_SOURCE",
    refundTransactionId: "RFND-RZP-94821104",
    status: "REFUNDED",
    adminNotes: "Refund credited directly to original UPI source via Razorpay Gateway.",
    refundedAt: new Date(Date.now() - 3600000 * 8),
    proofImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 3600000 * 192),
  },
];

const DEFAULT_SEED_STATS = {
  total: 9,
  pending: 1,
  approved: 7,
  rejected: 0,
  refunded: 1,
};

let memoryCachedReturns = DEFAULT_SEED_RETURNS;
let memoryCachedStats = DEFAULT_SEED_STATS;

const getCachedReturns = () => {
  if (memoryCachedReturns && Array.isArray(memoryCachedReturns) && memoryCachedReturns.length > 0) {
    return memoryCachedReturns;
  }
  try {
    const cached = localStorage.getItem("medideliver_admin_returns_cache");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCachedReturns = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_SEED_RETURNS;
};

const getCachedStats = (initialList = []) => {
  if (memoryCachedStats && typeof memoryCachedStats.total === "number" && memoryCachedStats.total > 0) {
    return memoryCachedStats;
  }
  try {
    const cached = localStorage.getItem("medideliver_admin_returns_stats");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.total === "number" && parsed.total > 0) {
        memoryCachedStats = parsed;
        return parsed;
      }
    }
  } catch (e) {}
  if (initialList && initialList.length > 0) {
    const computed = {
      total: initialList.length,
      pending: initialList.filter((r) => r.status === "PENDING").length,
      approved: initialList.filter((r) => r.status === "APPROVED").length,
      rejected: initialList.filter((r) => r.status === "REJECTED").length,
      refunded: initialList.filter((r) => r.status === "REFUNDED").length,
    };
    memoryCachedStats = computed;
    return computed;
  }
  return DEFAULT_SEED_STATS;
};

const Returns = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "submit"); // 'submit' | 'my-returns' | 'track'

  // User Orders State
  const [userOrders, setUserOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [orderValidationError, setOrderValidationError] = useState("");

  // Customer Return Requests List (Instant 0ms initialization)
  const [customerReturns, setCustomerReturns] = useState(() => {
    const cached = getCachedReturns();
    const storedUser = localStorage.getItem("user");
    if (cached.length > 0 && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        const uEmail = (u.email || "").toLowerCase().trim();
        const uName = (u.name || "").toLowerCase().trim();
        const uPhone = (u.phone || "").trim();
        return cached.filter((r) => {
          const rEmail = (r.customerEmail || "").toLowerCase().trim();
          const rName = (r.customerName || "").toLowerCase().trim();
          const rPhone = (r.customerPhone || "").trim();
          return (
            (uEmail && rEmail === uEmail) ||
            (uPhone && rPhone === uPhone) ||
            (uName && rName === uName)
          );
        });
      } catch (e) {}
    }
    return cached.slice(0, 2);
  });

  // Admin Portal State (Instant 0ms Load from Memory Cache)
  const [adminReturns, setAdminReturns] = useState(getCachedReturns);
  const [adminStats, setAdminStats] = useState(() => getCachedStats(getCachedReturns()));
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilterStatus, setAdminFilterStatus] = useState("ALL");
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedProofImage, setSelectedProofImage] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  // Refund Modal State
  const [refundModalItem, setRefundModalItem] = useState(null);
  const [refundTxnInput, setRefundTxnInput] = useState("");
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Submit Form State
  const [formData, setFormData] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      return {
        billNumber: "",
        customerName: u?.name || "",
        customerEmail: u?.email || "",
        customerPhone: u?.phone || "",
        medicineName: "",
        returnReason: "Wrong Medicine Delivered",
        explanation: "",
      };
    } catch (e) {
      return {
        billNumber: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        medicineName: "",
        returnReason: "Wrong Medicine Delivered",
        explanation: "",
      };
    }
  });

  // Refund Preferences State
  const [refundMethod, setRefundMethod] = useState("ORIGINAL_SOURCE");
  const [refundUpiId, setRefundUpiId] = useState("");
  const [refundAccountNumber, setRefundAccountNumber] = useState("");
  const [refundIfsc, setRefundIfsc] = useState("");
  const [refundAccountHolder, setRefundAccountHolder] = useState("");

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

  const isAdmin = user?.role === "admin" || user?.email?.toLowerCase().includes("admin");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let parsedUser = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {}
    }

    const isCurrentAdmin =
      parsedUser?.role === "admin" ||
      parsedUser?.email?.toLowerCase().includes("admin");

    if (isCurrentAdmin) {
      // Prioritize Admin returns fetch immediately
      fetchReturns(parsedUser);
      fetchOrders(parsedUser);
    } else {
      Promise.all([fetchOrders(parsedUser), fetchReturns(parsedUser)]);
    }
  }, []);

  const fetchReturns = async (currentUser) => {
    try {
      const response = await api.get("/returns").catch(() => ({ data: { success: false, returns: [], stats: {} } }));
      if (response.data?.success && Array.isArray(response.data.returns)) {
        const all = response.data.returns;
        setAdminReturns(all);
        memoryCachedReturns = all;
        const freshStats = response.data.stats || {
          total: all.length,
          pending: all.filter((r) => r.status === "PENDING").length,
          approved: all.filter((r) => r.status === "APPROVED").length,
          rejected: all.filter((r) => r.status === "REJECTED").length,
          refunded: all.filter((r) => r.status === "REFUNDED").length,
        };
        setAdminStats(freshStats);
        memoryCachedStats = freshStats;

        // Cache for 0ms instant display next time
        try {
          localStorage.setItem("medideliver_admin_returns_cache", JSON.stringify(all));
          localStorage.setItem("medideliver_admin_returns_stats", JSON.stringify(freshStats));
        } catch (e) {}

        if (currentUser) {
          const uEmail = (currentUser.email || "").toLowerCase().trim();
          const uName = (currentUser.name || "").toLowerCase().trim();
          const uPhone = (currentUser.phone || "").replace(/\D/g, "");
          const uId = currentUser._id || currentUser.id;

          const userSpecific = all.filter((r) => {
            const rEmail = (r.customerEmail || "").toLowerCase().trim();
            const rName = (r.customerName || "").toLowerCase().trim();
            const rPhone = (r.customerPhone || "").replace(/\D/g, "");
            const rCustId = r.customer || r.order?.customer;

            return (
              (uId && rCustId && rCustId.toString() === uId.toString()) ||
              (uEmail && rEmail === uEmail) ||
              (uPhone && rPhone && (uPhone === rPhone || (uPhone.length >= 10 && rPhone.endsWith(uPhone.slice(-10))))) ||
              (uName && rName === uName)
            );
          });
          setCustomerReturns(userSpecific);
        }
      }
    } catch (e) {
      console.error("Fetch returns error:", e);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchOrders = async (currentUser) => {
    try {
      const response = await api
        .get("/orders")
        .catch(() => ({ data: { success: false, orders: [] } }));
      if (response.data?.success && Array.isArray(response.data.orders)) {
        let orders = response.data.orders;

        if (currentUser) {
          const uName = (currentUser.name || "").toLowerCase().trim();
          const uEmail = (currentUser.email || "").toLowerCase().trim();
          const uPhone = (currentUser.phone || "").replace(/\D/g, "");
          const uId = currentUser._id || currentUser.id;

          orders = orders.filter((ord) => {
            const custId = ord.customer?._id || ord.customer?.id || (typeof ord.customer === "string" ? ord.customer : null);
            const custName = (ord.customerName || ord.customer?.name || "").toLowerCase().trim();
            const custEmail = (ord.customerEmail || ord.customer?.email || "").toLowerCase().trim();
            const custPhone = (ord.customerPhone || ord.customer?.phone || "").replace(/\D/g, "");

            return (
              (uId && custId && custId.toString() === uId.toString()) ||
              (uEmail && custEmail === uEmail) ||
              (uPhone && custPhone && (uPhone === custPhone || (uPhone.length >= 10 && custPhone.endsWith(uPhone.slice(-10))))) ||
              (uName && custName === uName)
            );
          });
        }

        setUserOrders(orders);
        const delivered = orders.filter((o) => o.orderStatus === "DELIVERED");
        setDeliveredOrders(delivered);

        // Check if query param specifies an order
        const qOrderId = searchParams.get("orderId");
        const qBill = searchParams.get("billNumber");

        if (qOrderId || qBill) {
          const matched = orders.find(
            (o) =>
              (qOrderId && o._id === qOrderId) ||
              (qBill && o._id.toUpperCase().endsWith(qBill.toUpperCase()))
          );

          if (matched) {
            applySelectedOrder(matched);
          }
        }
      }
    } catch (err) {
      console.error("Fetch orders error in Returns:", err);
    }
  };

  const applySelectedOrder = (ord) => {
    setSelectedOrderId(ord._id);
    setSelectedOrder(ord);

    if (ord.orderStatus !== "DELIVERED") {
      const statusTitle = ord.orderStatus.replace(/_/g, " ");
      setOrderValidationError(
        `⚠️ Return Denied: Order #${ord._id.slice(-6).toUpperCase()} is currently "${statusTitle}". Returns can ONLY be requested after the medicine is delivered to you.`
      );
      setAvailableMedicines([]);
      setFormData((prev) => ({
        ...prev,
        billNumber: ord._id.slice(-6).toUpperCase(),
        medicineName: "",
      }));
      return;
    }

    setOrderValidationError("");
    const meds =
      ord.items?.map((it) => ({
        name: it.medicine?.name || "Medicine",
        quantity: it.quantity || 1,
        price: it.price || 0,
      })) || [];

    setAvailableMedicines(meds);
    setFormData((prev) => ({
      ...prev,
      billNumber: ord._id.slice(-6).toUpperCase(),
      medicineName: meds.length > 0 ? meds[0].name : "",
    }));

    if (ord.paymentMethod === "ONLINE") {
      setRefundMethod("ORIGINAL_SOURCE");
    } else {
      setRefundMethod("UPI");
    }
  };

  const handleSelectOrderDropdown = (ordId) => {
    setSubmitError("");
    if (!ordId) {
      setSelectedOrderId("");
      setSelectedOrder(null);
      setAvailableMedicines([]);
      setOrderValidationError("");
      setFormData((prev) => ({ ...prev, billNumber: "", medicineName: "" }));
      return;
    }

    const ord = userOrders.find((o) => o._id === ordId);
    if (ord) {
      applySelectedOrder(ord);
    }
  };

  const handleBillNumberChange = (val) => {
    const clean = val.trim().toUpperCase();
    setFormData((prev) => ({ ...prev, billNumber: clean }));
    setSubmitError("");

    if (!clean) {
      setSelectedOrder(null);
      setAvailableMedicines([]);
      setOrderValidationError("");
      return;
    }

    const matched = userOrders.find(
      (o) =>
        o._id.toUpperCase().endsWith(clean) ||
        (o.trackingId && o.trackingId.toUpperCase().includes(clean))
    );

    if (matched) {
      applySelectedOrder(matched);
    } else {
      setSelectedOrder(null);
      setAvailableMedicines([]);
      setOrderValidationError(
        `❌ Invalid Order: No order found matching "${clean}". Please enter a valid Order ID from your account.`
      );
    }
  };

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
      setSubmitError("Please select or enter your Delivered Order ID / Bill Number.");
      return;
    }

    if (orderValidationError) {
      setSubmitError(orderValidationError);
      return;
    }

    if (selectedOrder && selectedOrder.orderStatus !== "DELIVERED") {
      setSubmitError(
        `⚠️ Return Denied: You can only return medicines AFTER your order is Delivered. Order #${selectedOrder._id.slice(-6).toUpperCase()} is currently "${selectedOrder.orderStatus}".`
      );
      return;
    }

    if (!formData.medicineName.trim()) {
      setSubmitError("Please select the purchased medicine you wish to return.");
      return;
    }

    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setSubmitError("Please enter your name and contact number.");
      return;
    }

    if (!formData.explanation.trim()) {
      setSubmitError("Please provide a detailed explanation of the issue.");
      return;
    }

    if (!proofImage) {
      setSubmitError("Please upload clear photo proof showing the medicine fault or damage.");
      return;
    }

    if (refundMethod === "UPI" && !refundUpiId.trim()) {
      setSubmitError("Please provide a valid UPI ID (e.g. mobile@paytm or name@okaxis) for your refund.");
      return;
    }

    if (refundMethod === "BANK_TRANSFER" && (!refundAccountNumber.trim() || !refundIfsc.trim())) {
      setSubmitError("Please provide your Bank Account Number and IFSC Code for refund transfer.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const response = await api.post("/returns", {
        ...formData,
        orderId: selectedOrder?._id,
        proofImage,
        refundMethod,
        refundUpiId: refundUpiId.trim(),
        refundAccountNumber: refundAccountNumber.trim(),
        refundIfsc: refundIfsc.trim().toUpperCase(),
        refundAccountHolder: refundAccountHolder.trim() || formData.customerName.trim(),
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
        setRefundUpiId("");
        setRefundAccountNumber("");
        setRefundIfsc("");
        setRefundAccountHolder("");
        setSelectedOrderId("");
        setSelectedOrder(null);
        setAvailableMedicines([]);
        fetchReturns(user);
      } else {
        setSubmitError(response.data.message || "Failed to submit return request.");
      }
    } catch (err) {
      console.error("Return Submit Error:", err);
      setSubmitError(
        err.response?.data?.message ||
          "Server error while submitting return request. Please try again."
      );
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

      const response = await api.get(
        `/returns/track/${encodeURIComponent(trackInput.trim())}`
      );
      if (response.data.success) {
        setTrackingResults(response.data.returns || []);
      } else {
        setTrackError(response.data.message || "No return request found");
      }
    } catch (err) {
      console.error("Track Error:", err);
      setTrackError(
        err.response?.data?.message || "No return request found for this Bill Number"
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  // ADMIN ACTION HANDLERS (Optimistic Instant Response)
  const handleUpdateReturnStatus = async (id, status) => {
    const note = adminNotes[id] || "";
    
    // Instant UI update
    setAdminReturns((prev) => {
      const updated = prev.map((item) => (item._id === id ? { ...item, status, adminNotes: note || item.adminNotes } : item));
      try {
        localStorage.setItem("medideliver_admin_returns_cache", JSON.stringify(updated));
        const newStats = {
          total: updated.length,
          pending: updated.filter((r) => r.status === "PENDING").length,
          approved: updated.filter((r) => r.status === "APPROVED").length,
          rejected: updated.filter((r) => r.status === "REJECTED").length,
          refunded: updated.filter((r) => r.status === "REFUNDED").length,
        };
        setAdminStats(newStats);
        localStorage.setItem("medideliver_admin_returns_stats", JSON.stringify(newStats));
      } catch (e) {}
      return updated;
    });

    try {
      setUpdatingId(id);
      const response = await api.put(`/returns/${id}/status`, {
        status,
        adminNotes: note,
      });

      if (response.data.success) {
        fetchReturns(user);
      }
    } catch (err) {
      console.error("Update return status error:", err);
      fetchReturns(user);
    } finally {
      setUpdatingId(null);
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
    const itemTarget = refundModalItem;
    const note = adminNotes[itemTarget._id] || "Refund processed and credited to customer.";
    const refundAmt = Number(refundAmountInput);

    // Instant UI update
    setAdminReturns((prev) => {
      const updated = prev.map((item) =>
        item._id === itemTarget._id
          ? {
              ...item,
              status: "REFUNDED",
              adminNotes: note,
              refundTransactionId: refundTxnInput,
              refundAmount: refundAmt,
            }
          : item
      );
      try {
        localStorage.setItem("medideliver_admin_returns_cache", JSON.stringify(updated));
        const newStats = {
          total: updated.length,
          pending: updated.filter((r) => r.status === "PENDING").length,
          approved: updated.filter((r) => r.status === "APPROVED").length,
          rejected: updated.filter((r) => r.status === "REJECTED").length,
          refunded: updated.filter((r) => r.status === "REFUNDED").length,
        };
        setAdminStats(newStats);
        localStorage.setItem("medideliver_admin_returns_stats", JSON.stringify(newStats));
      } catch (e) {}
      return updated;
    });

    setRefundModalItem(null);

    try {
      setIsProcessingRefund(true);
      const response = await api.put(`/returns/${itemTarget._id}/status`, {
        status: "REFUNDED",
        adminNotes: note,
        refundTransactionId: refundTxnInput,
        refundAmount: refundAmt,
      });

      if (response.data.success) {
        fetchReturns(user);
      }
    } catch (err) {
      console.error("Refund processing error:", err);
      fetchReturns(user);
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="status-badge approved">
            <CheckCircle2 className="st-ic" /> Approved (Pickup Scheduled)
          </span>
        );
      case "REJECTED":
        return (
          <span className="status-badge rejected">
            <XCircle className="st-ic" /> Request Rejected
          </span>
        );
      case "REFUNDED":
        return (
          <span className="status-badge refunded">
            <ShieldCheck className="st-ic" /> Refund Processed
          </span>
        );
      default:
        return (
          <span className="status-badge pending">
            <Clock className="st-ic" /> Under Review
          </span>
        );
    }
  };

  // Filter admin returns
  const filteredAdminReturns = adminReturns.filter((r) => {
    const sLower = adminSearch.toLowerCase().trim();
    const matchesSearch =
      !sLower ||
      (r.billNumber || "").toLowerCase().includes(sLower) ||
      (r.customerName || "").toLowerCase().includes(sLower) ||
      (r.customerPhone || "").toLowerCase().includes(sLower) ||
      (r.customerEmail || "").toLowerCase().includes(sLower) ||
      (r.medicineName || "").toLowerCase().includes(sLower) ||
      (r.returnReason || "").toLowerCase().includes(sLower);

    const matchesStatus = adminFilterStatus === "ALL" || r.status === adminFilterStatus;
    return matchesSearch && matchesStatus;
  });

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
            <span>{isAdmin ? "Pharmacy Admin Return Portal" : "Medicine Returns Center"}</span>
          </div>

          <UserProfileDropdown user={user} />
        </div>
      </header>

      {/* =========================================================
          VIEW 1: ADMIN RETURNS MANAGEMENT PORTAL (FOR ADMIN ONLY)
          ========================================================= */}
      {isAdmin ? (
        <main className="admin-returns-container">
          {/* Admin Header */}
          <div className="admin-returns-header">
            <div className="admin-hdr-left">
              <div className="admin-shield-icon-box">
                <ShieldCheck className="admin-shield-svg" />
              </div>
              <div>
                <span className="admin-sub-tag">PHARMACY INVENTORY & RETURN CONTROL</span>
                <h1>Customer Return Requests & Inspection Panel</h1>
                <p>Review customer fault claims, inspect uploaded proof photos, approve doorstep pickup, and execute refunds.</p>
              </div>
            </div>

            <div className="admin-hdr-actions">
              <Link to="/dashboard" className="admin-back-dash-btn">
                <LayoutDashboard className="btn-ic" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Return Stats Cards (Clickable Filters) */}
          <div className="admin-stats-grid">
            <button
              type="button"
              className={`admin-stat-card total ${adminFilterStatus === "ALL" ? "active" : ""}`}
              onClick={() => setAdminFilterStatus("ALL")}
            >
              <div className="stat-card-top">
                <span className="stat-title">Total Requests</span>
                <RotateCcw className="stat-ic total" />
              </div>
              <strong>{adminStats.total || adminReturns.length}</strong>
              <small>All customer claims</small>
            </button>

            <button
              type="button"
              className={`admin-stat-card pending ${adminFilterStatus === "PENDING" ? "active" : ""}`}
              onClick={() => setAdminFilterStatus("PENDING")}
            >
              <div className="stat-card-top">
                <span className="stat-title">Pending Review</span>
                <Clock className="stat-ic pending" />
              </div>
              <strong className="text-amber">{adminStats.pending || 0}</strong>
              <small>Needs pharmacist review</small>
            </button>

            <button
              type="button"
              className={`admin-stat-card approved ${adminFilterStatus === "APPROVED" ? "active" : ""}`}
              onClick={() => setAdminFilterStatus("APPROVED")}
            >
              <div className="stat-card-top">
                <span className="stat-title">Approved Returns</span>
                <CheckCircle2 className="stat-ic approved" />
              </div>
              <strong className="text-emerald">{adminStats.approved || 0}</strong>
              <small>Pickup scheduled</small>
            </button>

            <button
              type="button"
              className={`admin-stat-card refunded ${adminFilterStatus === "REFUNDED" ? "active" : ""}`}
              onClick={() => setAdminFilterStatus("REFUNDED")}
            >
              <div className="stat-card-top">
                <span className="stat-title">Refunded</span>
                <DollarSign className="stat-ic refunded" />
              </div>
              <strong className="text-teal">{adminStats.refunded || 0}</strong>
              <small>Payment credited back</small>
            </button>

            <button
              type="button"
              className={`admin-stat-card rejected ${adminFilterStatus === "REJECTED" ? "active" : ""}`}
              onClick={() => setAdminFilterStatus("REJECTED")}
            >
              <div className="stat-card-top">
                <span className="stat-title">Rejected</span>
                <XCircle className="stat-ic rejected" />
              </div>
              <strong className="text-red">{adminStats.rejected || 0}</strong>
              <small>Invalid / Tampered claim</small>
            </button>
          </div>

          {/* Search & Toolbar */}
          <div className="admin-returns-toolbar">
            <div className="admin-search-wrap">
              <Search className="tb-search-ic" />
              <input
                type="text"
                placeholder="Search by Customer Name, Phone, Email, Medicine, or Bill #..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
              {adminSearch && (
                <button type="button" className="tb-clear-btn" onClick={() => setAdminSearch("")}>
                  <X className="clear-ic" />
                </button>
              )}
            </div>

            <div className="admin-filter-wrap">
              <Filter className="filter-ic" />
              <select
                value={adminFilterStatus}
                onChange={(e) => setAdminFilterStatus(e.target.value)}
                className="admin-status-dropdown"
              >
                <option value="ALL">All Statuses ({adminReturns.length})</option>
                <option value="PENDING">Pending Review ({adminStats.pending || 0})</option>
                <option value="APPROVED">Approved ({adminStats.approved || 0})</option>
                <option value="REFUNDED">Refunded ({adminStats.refunded || 0})</option>
                <option value="REJECTED">Rejected ({adminStats.rejected || 0})</option>
              </select>
            </div>
          </div>

          {/* Returns Management Table */}
          <div className="admin-returns-table-card">
            {adminLoading && adminReturns.length === 0 ? (
              <div className="admin-loading-returns">
                <Loader2 className="admin-spin-loader" />
                <h3>Loading Return Requests...</h3>
                <p>Retrieving real-time customer claims, inspection photos, and refund status.</p>
              </div>
            ) : filteredAdminReturns.length === 0 ? (
              <div className="admin-no-returns">
                <RotateCcw className="empty-ic" />
                <h3>No return requests found</h3>
                <p>There are no customer medicine returns matching your active search or filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-ret-table">
                  <thead>
                    <tr>
                      <th>Bill / Ticket ID</th>
                      <th>Customer Contact</th>
                      <th>Medicine & Issue</th>
                      <th>Refund Preference</th>
                      <th>Proof Photo</th>
                      <th>Status</th>
                      <th>Admin Actions & Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminReturns.map((item) => (
                      <tr key={item._id}>
                        {/* Bill / Ticket ID */}
                        <td className="cell-bill">
                          <strong className="bill-num">#{item.billNumber || item._id.slice(-6).toUpperCase()}</strong>
                          <small className="ticket-date">
                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </small>
                          <span className="order-mode-pill">{item.orderPaymentMethod === "ONLINE" ? "💳 Online" : "💵 COD"}</span>
                        </td>

                        {/* Customer Contact */}
                        <td className="cell-cust">
                          <strong>{item.customerName}</strong>
                          <div className="cust-contact-line">
                            <Phone className="mini-ic" />
                            <a href={`tel:${item.customerPhone}`}>{item.customerPhone}</a>
                          </div>
                          {item.customerEmail && (
                            <div className="cust-contact-line">
                              <Mail className="mini-ic" />
                              <span>{item.customerEmail}</span>
                            </div>
                          )}
                        </td>

                        {/* Medicine & Reason */}
                        <td className="cell-med">
                          <div className="med-title-row">
                            <Pill className="med-pill-ic" />
                            <strong>{item.medicineName}</strong>
                          </div>
                          <span className="reason-pill">{item.returnReason}</span>
                          <p className="exp-note">"{item.explanation}"</p>
                        </td>

                        {/* Refund Details */}
                        <td className="cell-refund">
                          <strong className="refund-val">₹{Number(item.refundAmount || item.orderTotal || 0).toFixed(2)}</strong>
                          <div className="refund-dest-box">
                            <span className="dest-method-tag">
                              {item.refundMethod === "UPI"
                                ? "📱 UPI Transfer"
                                : item.refundMethod === "BANK_TRANSFER"
                                ? "🏦 Bank Account"
                                : "💳 Original Payment Source"}
                            </span>
                            {item.refundMethod === "UPI" && item.refundUpiId && (
                              <code className="upi-code">{item.refundUpiId}</code>
                            )}
                            {item.refundMethod === "BANK_TRANSFER" && item.refundAccountNumber && (
                              <small className="bank-meta">
                                A/C: {item.refundAccountNumber} | IFSC: {item.refundIfsc}
                              </small>
                            )}
                            {item.refundTransactionId && (
                              <span className="txn-ref-badge">Txn: {item.refundTransactionId}</span>
                            )}
                          </div>
                        </td>

                        {/* Proof Photo */}
                        <td className="cell-proof">
                          {item.proofImage ? (
                            <button
                              type="button"
                              className="admin-view-proof-btn"
                              onClick={() => setSelectedProofImage(item.proofImage)}
                              title="Click to view full size proof image"
                            >
                              <img src={item.proofImage} alt="Proof" className="proof-thumb-img" />
                              <span><Eye className="eye-ic" /> View</span>
                            </button>
                          ) : (
                            <span className="no-proof-text">No proof photo</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="cell-status">
                          {getStatusBadge(item.status)}
                          {item.adminNotes && (
                            <div className="admin-note-snippet">
                              <strong>Note:</strong> <span>{item.adminNotes}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="cell-actions">
                          <input
                            type="text"
                            placeholder="Add admin note..."
                            className="admin-quick-note"
                            defaultValue={item.adminNotes || ""}
                            onChange={(e) =>
                              setAdminNotes((prev) => ({ ...prev, [item._id]: e.target.value }))
                            }
                          />

                          <div className="action-buttons-wrap">
                            {item.status !== "APPROVED" && item.status !== "REFUNDED" && (
                              <button
                                type="button"
                                className="act-btn approve-btn"
                                onClick={() => handleUpdateReturnStatus(item._id, "APPROVED")}
                                disabled={updatingId === item._id}
                              >
                                <Check className="btn-ic" /> Approve
                              </button>
                            )}

                            {item.status !== "REFUNDED" && (
                              <button
                                type="button"
                                className="act-btn refund-btn"
                                onClick={() => handleOpenRefundModal(item)}
                              >
                                <DollarSign className="btn-ic" /> Refund
                              </button>
                            )}

                            {item.status !== "REJECTED" && (
                              <button
                                type="button"
                                className="act-btn reject-btn"
                                onClick={() => handleUpdateReturnStatus(item._id, "REJECTED")}
                                disabled={updatingId === item._id}
                              >
                                <X className="btn-ic" /> Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      ) : (
        /* =========================================================
           VIEW 2: CUSTOMER RETURN & HISTORY PORTAL (FOR CUSTOMERS)
           ========================================================= */
        <>
          {/* HERO SECTION */}
          <section className="returns-hero">
            <div className="hero-content">
              <span className="hero-tag">ALIGARH PHARMACY GUARANTEE</span>
              <h1>Delivered Medicine Return & Replacement</h1>
              <p>
                Returns are strictly allowed for <strong>Delivered orders</strong>. If you received wrong or damaged medicine, select your delivered order and request 100% free doorstep pickup.
              </p>
            </div>
          </section>

          {/* MAIN CONTAINER */}
          <main className="returns-main">
            {/* CUSTOMER SUMMARY STATS BANNER */}
            {user && (
              <div className="customer-summary-strip">
                <div className="cs-item">
                  <span className="cs-label">Total Orders</span>
                  <strong>{userOrders.length}</strong>
                </div>
                <div className="cs-divider"></div>
                <div className="cs-item">
                  <span className="cs-label">Delivered Orders</span>
                  <strong className="text-emerald">{deliveredOrders.length}</strong>
                </div>
                <div className="cs-divider"></div>
                <div className="cs-item">
                  <span className="cs-label">Return Requests</span>
                  <strong className="text-teal">{customerReturns.length}</strong>
                </div>
              </div>
            )}

            {/* 3 CUSTOMER TABS */}
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
                className={`tab-btn ${activeTab === "my-returns" ? "active" : ""}`}
                onClick={() => setActiveTab("my-returns")}
              >
                <Package className="tab-icon" />
                <span>My Return Requests ({customerReturns.length})</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "track" ? "active" : ""}`}
                onClick={() => setActiveTab("track")}
              >
                <Search className="tab-icon" />
                <span>Track by Bill #</span>
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
                      Your return request for <strong>{submitSuccess.medicineName}</strong> (Order #
                      {submitSuccess.billNumber}) has been logged. Our pharmacy inspector is reviewing your proof image.
                    </p>

                    <div className="ticket-summary">
                      <div className="summary-row">
                        <span>Return Ticket ID:</span>
                        <strong>{submitSuccess._id}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Medicine:</span>
                        <strong>{submitSuccess.medicineName}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Order / Bill Number:</span>
                        <strong>#{submitSuccess.billNumber}</strong>
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
                          setActiveTab("my-returns");
                          setSubmitSuccess(null);
                        }}
                      >
                        <span>View My Return History</span>
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
                      <h3>Request Return for Delivered Medicine</h3>
                      <p>
                        Select your delivered order and upload proof of the faulty/wrong product
                      </p>
                    </div>

                    {/* POLICY ALERT BANNER */}
                    <div className="delivery-policy-alert">
                      <ShieldCheck className="dpa-icon" />
                      <div>
                        <strong>Delivered Orders Only:</strong>
                        <span>
                          {" "}Medicines cannot be returned while an order is placed, packed, or out for delivery. Return unlocks only after your order is successfully delivered.
                        </span>
                      </div>
                    </div>

                    {orderValidationError && (
                      <div className="error-alert-box">
                        <AlertCircle className="err-ic" />
                        <span>{orderValidationError}</span>
                      </div>
                    )}

                    {submitError && (
                      <div className="error-alert-box">
                        <AlertCircle className="err-ic" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* QUICK SELECTOR: DELIVERED ORDERS */}
                    {deliveredOrders.length > 0 ? (
                      <div className="form-group full-width order-select-group">
                        <label>
                          Select Your Delivered Order *
                          <span className="order-pill-badge">
                            {deliveredOrders.length} Delivered Order(s) Available
                          </span>
                        </label>
                        <div className="input-with-icon">
                          <Package className="inp-icon" />
                          <select
                            value={selectedOrderId}
                            onChange={(e) => handleSelectOrderDropdown(e.target.value)}
                            className="order-dropdown-select"
                          >
                            <option value="">-- Click to choose your Delivered Order --</option>
                            {deliveredOrders.map((ord) => (
                              <option key={ord._id} value={ord._id}>
                                Order #{ord._id.slice(-6).toUpperCase()} • Delivered •{" "}
                                {ord.items?.map((it) => it.medicine?.name).join(", ")} (₹
                                {ord.totalAmount})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="no-delivered-orders-banner">
                        <Clock className="ndo-icon" />
                        <div>
                          <strong>No Delivered Orders Yet</strong>
                          <p>
                            You currently do not have any orders marked as Delivered. Returns will become available once your medicines reach your doorstep.
                          </p>
                        </div>
                        <Link to="/my-orders" className="ndo-link">
                          View Order Status <ChevronRight className="nl-ic" />
                        </Link>
                      </div>
                    )}

                    <div className="form-grid">
                      {/* BILL NUMBER / ORDER ID */}
                      <div className="form-group">
                        <label>Order ID / Bill Number *</label>
                        <div className="input-with-icon">
                          <FileText className="inp-icon" />
                          <input
                            type="text"
                            name="billNumber"
                            placeholder="e.g. E1479C"
                            value={formData.billNumber}
                            onChange={(e) => handleBillNumberChange(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* MEDICINE NAME */}
                      <div className="form-group">
                        <label>Purchased Medicine to Return *</label>
                        <div className="input-with-icon">
                          <Pill className="inp-icon" />
                          {availableMedicines.length > 0 ? (
                            <select
                              name="medicineName"
                              value={formData.medicineName}
                              onChange={handleChange}
                              required
                              className="med-select-dropdown"
                            >
                              <option value="">-- Select Purchased Medicine --</option>
                              {availableMedicines.map((m, idx) => (
                                <option key={idx} value={m.name}>
                                  {m.name} (Purchased: {m.quantity} Qty)
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              name="medicineName"
                              placeholder="Select delivered order above first"
                              value={formData.medicineName}
                              onChange={handleChange}
                              required
                              disabled={!formData.billNumber}
                            />
                          )}
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
                          required
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
                          required
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
                      <label>Explain the Issue in Detail *</label>
                      <textarea
                        name="explanation"
                        rows="3"
                        placeholder="Describe what was wrong with the delivered medicine (e.g. broken seal, wrong strength, expired batch)..."
                        value={formData.explanation}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    {/* PROOF UPLOAD */}
                    <div className="form-group full-width">
                      <label>Upload Proof Photo (Fault / Wrong Product Image) *</label>
                      {proofPreview ? (
                        <div className="image-preview-container">
                          <img
                            src={proofPreview}
                            alt="Proof Preview"
                            className="proof-img-preview"
                          />
                          <div className="preview-overlay">
                            <span>Proof Photo Uploaded</span>
                            <button
                              type="button"
                              className="remove-img-btn"
                              onClick={handleRemoveImage}
                            >
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
                          <small>
                            Attach clear photo of the wrong/faulty medicine package (Max 10MB)
                          </small>
                        </label>
                      )}
                    </div>

                    {/* REFUND PREFERENCE SECTION */}
                    <div className="form-group full-width refund-config-card">
                      <div className="refund-config-header">
                        <div className="refund-hdr-badge">
                          <CreditCard className="rc-ic" />
                          <span>REFUND RECOVERY PREFERENCE</span>
                        </div>
                        <h4>Where would you like to receive your payment refund?</h4>
                        <p>
                          Once your return is verified by our pharmacist, the full item amount will be credited back.
                        </p>
                      </div>

                      {selectedOrder && (
                        <div className="order-pay-info-strip">
                          <span>Order Payment Mode:</span>
                          <strong>
                            {selectedOrder.paymentMethod === "ONLINE"
                              ? "💳 Online Payment (Razorpay / UPI / Card)"
                              : "💵 Cash on Delivery (COD)"}
                          </strong>
                        </div>
                      )}

                      <div className="refund-method-options">
                        {(!selectedOrder || selectedOrder.paymentMethod === "ONLINE") && (
                          <label className={`refund-method-card ${refundMethod === "ORIGINAL_SOURCE" ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="refundMethod"
                              value="ORIGINAL_SOURCE"
                              checked={refundMethod === "ORIGINAL_SOURCE"}
                              onChange={() => setRefundMethod("ORIGINAL_SOURCE")}
                            />
                            <div className="rm-sequence-num">1</div>
                            <div className="rm-content">
                              <strong>Original Payment Source (Razorpay / Bank)</strong>
                              <span>Refund will be credited back to your original payment account.</span>
                            </div>
                          </label>
                        )}

                        <label className={`refund-method-card ${refundMethod === "UPI" ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="refundMethod"
                            value="UPI"
                            checked={refundMethod === "UPI"}
                            onChange={() => setRefundMethod("UPI")}
                          />
                          <div className="rm-sequence-num">2</div>
                          <div className="rm-content">
                            <strong>Instant UPI Transfer (PhonePe / GPay / Paytm)</strong>
                            <span>Provide UPI ID for instant direct credit.</span>
                          </div>
                        </label>

                        {refundMethod === "UPI" && (
                          <div className="refund-sub-fields">
                            <label>Your UPI ID *</label>
                            <input
                              type="text"
                              placeholder="e.g. mobile@paytm or name@okaxis"
                              value={refundUpiId}
                              onChange={(e) => setRefundUpiId(e.target.value)}
                              required
                            />
                          </div>
                        )}

                        <label className={`refund-method-card ${refundMethod === "BANK_TRANSFER" ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="refundMethod"
                            value="BANK_TRANSFER"
                            checked={refundMethod === "BANK_TRANSFER"}
                            onChange={() => setRefundMethod("BANK_TRANSFER")}
                          />
                          <div className="rm-sequence-num">3</div>
                          <div className="rm-content">
                            <strong>Direct Bank Account Transfer (IMPS / NEFT)</strong>
                            <span>Direct bank transfer via Account Number and IFSC Code.</span>
                          </div>
                        </label>

                        {refundMethod === "BANK_TRANSFER" && (
                          <div className="refund-sub-fields-grid">
                            <div className="form-group">
                              <label>Account Holder Name</label>
                              <input
                                type="text"
                                placeholder="Name as per bank passbook"
                                value={refundAccountHolder}
                                onChange={(e) => setRefundAccountHolder(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Bank Account Number *</label>
                              <input
                                type="text"
                                placeholder="Enter account number"
                                value={refundAccountNumber}
                                onChange={(e) => setRefundAccountNumber(e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group full-width">
                              <label>Bank IFSC Code *</label>
                              <input
                                type="text"
                                placeholder="e.g. SBIN0001234 or HDFC0000123"
                                value={refundIfsc}
                                onChange={(e) => setRefundIfsc(e.target.value.toUpperCase())}
                                required
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="submit-return-btn"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="btn-spin" />
                          <span>Processing Return Request...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="btn-ic" />
                          <span>Submit Return & Inspection Request</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: MY RETURN REQUESTS (CUSTOMER HISTORY) */}
            {activeTab === "my-returns" && (
              <div className="tab-content-card">
                <div className="my-returns-header">
                  <div>
                    <h3>My Medicine Return Requests</h3>
                    <p>Track all return and refund claims you have submitted since registering your account.</p>
                  </div>
                  <span className="my-returns-count-badge">
                    {customerReturns.length} Return Request(s)
                  </span>
                </div>

                {customerReturns.length === 0 ? (
                  <div className="empty-my-returns-box">
                    <RotateCcw className="emr-icon" />
                    <h4>No Return Requests Filed</h4>
                    <p>You haven't requested any medicine returns. If you have an issue with a delivered order, you can submit a return request easily.</p>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => setActiveTab("submit")}
                    >
                      Submit a Return Request <ArrowRight className="btn-ic" />
                    </button>
                  </div>
                ) : (
                  <div className="my-returns-list">
                    {customerReturns.map((ret) => (
                      <div key={ret._id} className="customer-return-card">
                        <div className="crc-header">
                          <div className="crc-id-block">
                            <span className="crc-ticket-label">Return Ticket</span>
                            <strong className="crc-ticket-id">#{ret.billNumber || ret._id.slice(-6).toUpperCase()}</strong>
                            <small className="crc-date">
                              {new Date(ret.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </small>
                          </div>
                          <div className="crc-status">
                            {getStatusBadge(ret.status)}
                          </div>
                        </div>

                        <div className="crc-body">
                          <div className="crc-med-info">
                            <div className="crc-med-name-row">
                              <Pill className="crc-pill-ic" />
                              <h4>{ret.medicineName}</h4>
                            </div>
                            <span className="crc-reason-tag">Reason: {ret.returnReason}</span>
                            <p className="crc-explanation">"{ret.explanation}"</p>
                          </div>

                          {ret.proofImage && (
                            <div className="crc-proof-thumb-wrap">
                              <img
                                src={ret.proofImage}
                                alt="Proof"
                                className="crc-thumb-img"
                                onClick={() => setSelectedProofImage(ret.proofImage)}
                                title="Click to enlarge proof photo"
                              />
                            </div>
                          )}
                        </div>

                        <div className="crc-footer">
                          <div className="crc-refund-info">
                            <span>Refund Destination: </span>
                            <strong>
                              {ret.refundMethod === "UPI"
                                ? `UPI (${ret.refundUpiId || "Registered UPI"})`
                                : ret.refundMethod === "BANK_TRANSFER"
                                ? `Bank Transfer (A/C ${ret.refundAccountNumber?.slice(-4) || "Account"})`
                                : "Original Payment Source"}
                            </strong>
                            <span className="crc-refund-amt"> • Refund Amount: ₹{Number(ret.refundAmount || ret.orderTotal || 0).toFixed(2)}</span>
                          </div>

                          {ret.adminNotes && (
                            <div className="crc-admin-note">
                              <strong>Pharmacy Admin Remark:</strong> {ret.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TRACK RETURN STATUS BY BILL NUMBER */}
            {activeTab === "track" && (
              <div className="tab-content-card">
                <div className="track-header">
                  <h3>Track Return Request by Bill Number</h3>
                  <p>
                    Enter your Order / Bill Number or Mobile Number to check real-time return and refund status
                  </p>
                </div>

                <form onSubmit={handleTrackReturn} className="track-search-form">
                  <div className="track-input-wrapper">
                    <Search className="tr-icon" />
                    <input
                      type="text"
                      placeholder="Enter Bill Number (e.g. E1479C) or 10-digit mobile number..."
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                    />
                    <button type="submit" className="track-submit-btn" disabled={trackingLoading}>
                      {trackingLoading ? "Searching..." : "Track Status"}
                    </button>
                  </div>
                </form>

                {trackError && (
                  <div className="error-alert-box">
                    <AlertCircle className="err-ic" />
                    <span>{trackError}</span>
                  </div>
                )}

                {trackingResults.length > 0 && (
                  <div className="tracking-results-list">
                    <h4>Found {trackingResults.length} Return Request(s):</h4>
                    {trackingResults.map((item) => (
                      <div key={item._id} className="track-card">
                        <div className="track-card-header">
                          <div>
                            <span className="bill-badge">Order #{item.billNumber}</span>
                            <span className="date-text">
                              Submitted on: {new Date(item.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>

                        <div className="track-card-body">
                          <div className="track-info-col">
                            <p><strong>Customer:</strong> {item.customerName} ({item.customerPhone})</p>
                            <p><strong>Medicine:</strong> {item.medicineName}</p>
                            <p><strong>Reason:</strong> {item.returnReason}</p>
                            <p className="exp-text"><strong>Issue Explanation:</strong> {item.explanation}</p>

                            {item.adminNotes && (
                              <div className="admin-note-box">
                                <strong>Pharmacist Inspector Remark:</strong>
                                <p>{item.adminNotes}</p>
                              </div>
                            )}

                            {item.status === "REFUNDED" && (
                              <div className="tr-refund-card">
                                <div className="tr-refund-hdr">
                                  <ShieldCheck className="tr-ref-ic" />
                                  <div>
                                    <strong>Refund Successfully Credited</strong>
                                    <span>₹{Number(item.refundAmount || item.orderTotal || 0).toFixed(2)} Credited</span>
                                  </div>
                                </div>
                                <div className="tr-refund-details">
                                  <div className="tr-ref-item">
                                    <span>Destination:</span>
                                    <strong>
                                      {item.refundMethod === "UPI"
                                        ? `UPI (${item.refundUpiId})`
                                        : item.refundMethod === "BANK_TRANSFER"
                                        ? `Bank Account (${item.refundAccountNumber})`
                                        : "Original Payment Source"}
                                    </strong>
                                  </div>
                                  {item.refundTransactionId && (
                                    <div className="tr-ref-item">
                                      <span>Transaction Ref ID:</span>
                                      <code>{item.refundTransactionId}</code>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {item.proofImage && (
                            <div className="track-proof-box">
                              <img
                                src={item.proofImage}
                                alt="Proof preview"
                                className="track-proof-thumb"
                                onClick={() => setSelectedProofImage(item.proofImage)}
                                title="Click to view full photo"
                              />
                              <small>Proof Photo Attached</small>
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
        </>
      )}

      {/* LIGHTBOX IMAGE MODAL */}
      {selectedProofImage && (
        <div className="proof-modal-overlay" onClick={() => setSelectedProofImage(null)}>
          <div className="proof-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="proof-modal-hdr">
              <h3>Customer Uploaded Proof Photo</h3>
              <button
                type="button"
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

      {/* REFUND EXECUTION MODAL (ADMIN) */}
      {refundModalItem && (
        <div className="proof-modal-overlay" onClick={() => setRefundModalItem(null)}>
          <div className="proof-modal-content refund-execution-modal" onClick={(e) => e.stopPropagation()}>
            <div className="proof-modal-hdr">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <DollarSign style={{ color: "#0d9488" }} />
                <h3>Process Customer Refund</h3>
              </div>
              <button
                type="button"
                className="close-proof-btn"
                onClick={() => setRefundModalItem(null)}
              >
                <X className="x-ic" />
              </button>
            </div>

            <div className="refund-modal-body">
              <div className="refund-summary-box">
                <div className="ref-sum-row">
                  <span>Customer:</span>
                  <strong>{refundModalItem.customerName} ({refundModalItem.customerPhone})</strong>
                </div>
                <div className="ref-sum-row">
                  <span>Medicine Item:</span>
                  <strong>{refundModalItem.medicineName}</strong>
                </div>
                <div className="ref-sum-row">
                  <span>Order / Bill Number:</span>
                  <strong>#{refundModalItem.billNumber}</strong>
                </div>
                <div className="ref-sum-row">
                  <span>Refund Method:</span>
                  <strong className="refund-highlight-dest">
                    {refundModalItem.refundMethod === "UPI"
                      ? `📱 UPI (${refundModalItem.refundUpiId})`
                      : refundModalItem.refundMethod === "BANK_TRANSFER"
                      ? `🏦 Bank Account (${refundModalItem.refundAccountNumber} / ${refundModalItem.refundIfsc})`
                      : "💳 Original Payment Source (Razorpay/Card)"}
                  </strong>
                </div>
              </div>

              <div className="refund-inputs-grid">
                <div className="form-group">
                  <label>Refund Amount (₹) *</label>
                  <input
                    type="number"
                    value={refundAmountInput}
                    onChange={(e) => setRefundAmountInput(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Refund Reference / Txn ID *</label>
                  <input
                    type="text"
                    value={refundTxnInput}
                    onChange={(e) => setRefundTxnInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="refund-actions-bar">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setRefundModalItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn refund-confirm-btn"
                  onClick={handleConfirmRefund}
                  disabled={isProcessingRefund}
                >
                  {isProcessingRefund ? "Processing..." : `Confirm & Process Refund (₹${Number(refundAmountInput || 0).toFixed(2)})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="returns-footer">
        © 2026 MediDeliver. 100% Genuine Medicine Guarantee & Fast Doorstep Returns.
      </footer>
    </div>
  );
};

export default Returns;
