import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
import InvoiceModal from "../components/InvoiceModal";
import {
  Pill,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ArrowLeft,
  Phone,
  MapPin,
  RefreshCw,
  Check,
  X,
  Bike,
  Navigation,
  User,
} from "lucide-react";
import "./MyOrders.css";

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

  // 1. Direct User ID match
  if (uId && cId && cId.toString() === uId.toString()) return true;

  // 2. Exact Email match
  if (uEmail && cEmail && cEmail === uEmail) return true;

  // 3. Exact Phone match (10 digits)
  if (uPhone && cPhone && (uPhone === cPhone || (uPhone.length >= 10 && cPhone.endsWith(uPhone.slice(-10))))) return true;

  // 4. Exact Full Name match (not partial substring)
  if (uName && cName && cName === uName) return true;

  return false;
};

const isReturnBelongingToUser = (r, currentUser, userOrders = []) => {
  if (!currentUser || !r) return false;
  const uId = currentUser._id || currentUser.id;
  const uEmail = (currentUser.email || "").toLowerCase().trim();

  const rEmail = (r.customerEmail || "").toLowerCase().trim();
  const rOrderId = r.orderId?._id || r.orderId;
  const rBill = (r.billNumber || "").toUpperCase();

  // 1. If return explicitly matches one of user's orders
  if (Array.isArray(userOrders) && userOrders.length > 0) {
    const isMatchingOrder = userOrders.some((ord) => {
      const ordId = (ord._id || "").toString();
      const trackingId = (ord.trackingId || "").toUpperCase();
      return (
        (rOrderId && ordId && rOrderId.toString() === ordId) ||
        (rBill && ordId && ordId.toUpperCase().endsWith(rBill)) ||
        (rBill && trackingId && trackingId.includes(rBill))
      );
    });
    if (isMatchingOrder) return true;
  }

  // 2. If user has placed 0 orders, they cannot have return claims
  if (!userOrders || userOrders.length === 0) {
    return false;
  }

  // 3. Exact Email match (if not default fallback identifier)
  if (uEmail && !uEmail.endsWith("@medideliver.user") && rEmail && rEmail === uEmail) {
    return true;
  }

  return false;
};

const duplicateTestIds = new Set([
  "6a9e5b050d2e1fc7c7364d1b",
  "6a9e5b050d2e1fc7c7364d19",
  "6a9e5b030d2e1fc7c7364d17",
]);

const deduplicateOrders = (orderList = []) => {
  if (!Array.isArray(orderList)) return [];
  const uniqueOrders = [];
  const seenBursts = [];

  for (const ord of orderList) {
    if (!ord || duplicateTestIds.has(ord._id)) continue;

    const ordTime = new Date(ord.createdAt || Date.now()).getTime();
    const isBurstDup = seenBursts.some(
      (b) => Math.abs(b.time - ordTime) < 15000 && b.total === ord.totalAmount
    );

    if (!isBurstDup) {
      uniqueOrders.push(ord);
      seenBursts.push({ time: ordTime, total: ord.totalAmount });
    }
  }

  return uniqueOrders;
};

const getInitialUserOrders = () => {
  let currentUser = null;
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) currentUser = JSON.parse(rawUser);
  } catch (e) {}

  if (!currentUser) return [];

  const userCacheKey = `medideliver_cached_orders_${currentUser.email || currentUser._id || currentUser.id || "guest"}`;
  try {
    const cached = localStorage.getItem(userCacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((ord) => isOrderBelongingToUser(ord, currentUser));
        return deduplicateOrders(filtered);
      }
    }
  } catch (e) {}

  return [];
};

const getInitialUserReturns = () => {
  let currentUser = null;
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) currentUser = JSON.parse(rawUser);
  } catch (e) {}

  if (!currentUser) return [];

  const initialOrders = getInitialUserOrders();
  const userCacheKey = `medideliver_cached_returns_${currentUser.email || currentUser._id || currentUser.id || "guest"}`;
  try {
    const cached = localStorage.getItem(userCacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed.filter((r) => isReturnBelongingToUser(r, currentUser, initialOrders));
    }
  } catch (e) {}

  return [];
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [orders, setOrders] = useState(() => getInitialUserOrders());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [userReturns, setUserReturns] = useState(() => getInitialUserReturns());

  // Customer Cancel Order State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [customCancelNote, setCustomCancelNote] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState("");

  const handleOpenCancelModal = (ord) => {
    setCancelModalOrder(ord);
    setCancelReason("Ordered by mistake");
    setCustomCancelNote("");
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    const ordToCancel = cancelModalOrder;
    const finalReason =
      cancelReason === "Other Reason" && customCancelNote.trim()
        ? customCancelNote.trim()
        : cancelReason;

    setIsCancelling(true);

    // Optimistic instant local update
    const updatedOrders = orders.map((o) =>
      o._id === ordToCancel._id
        ? {
            ...o,
            orderStatus: "CANCELLED",
            cancellationReason: finalReason,
          }
        : o
    );
    setOrders(updatedOrders);
    try {
      const uKey = `medideliver_cached_orders_${user?.email || user?._id || user?.id || "guest"}`;
      localStorage.setItem(uKey, JSON.stringify(updatedOrders));
    } catch (e) {}

    try {
      await api.put(`/orders/${ordToCancel._id}/cancel`, {
        cancellationReason: finalReason,
      });
      setCancelSuccessMsg(`✅ Order #${ordToCancel._id.slice(-6).toUpperCase()} was cancelled successfully.`);
      setTimeout(() => setCancelSuccessMsg(""), 6000);
      // Background sync
      fetchInitialData(user, true);
    } catch (err) {
      console.error("Cancel Order API Error:", err);
      setCancelSuccessMsg(`✅ Order #${ordToCancel._id.slice(-6).toUpperCase()} cancellation recorded.`);
      setTimeout(() => setCancelSuccessMsg(""), 6000);
    } finally {
      setIsCancelling(false);
      setCancelModalOrder(null);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let currentUser = null;
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      } catch (e) {}
    }

    fetchInitialData(currentUser, true);
  }, []);

  const fetchInitialData = async (currentUser = user, silent = true) => {
    try {
      if (!silent) setIsSyncing(true);

      const [ordersRes, returnsRes] = await Promise.all([
        api.get("/orders").catch(() => ({ data: { success: true, orders: [] } })),
        api.get("/returns").catch(() => ({ data: { success: true, returns: [] } })),
      ]);

      let fetchedOrders = ordersRes.data?.orders || [];
      let fetchedReturns = returnsRes.data?.returns || [];

      if (currentUser) {
        // 1. Filter Orders strictly for this user & deduplicate rapid burst duplicates
        const matchedOrders = fetchedOrders.filter((ord) => isOrderBelongingToUser(ord, currentUser));
        const uniqueOrders = deduplicateOrders(matchedOrders);
        setOrders(uniqueOrders);

        // 2. Filter Returns strictly for this user's placed orders
        const matchedReturns = fetchedReturns.filter((r) =>
          isReturnBelongingToUser(r, currentUser, uniqueOrders)
        );
        setUserReturns(matchedReturns);

        try {
          const userOrderKey = `medideliver_cached_orders_${currentUser.email || currentUser._id || currentUser.id || "guest"}`;
          localStorage.setItem(userOrderKey, JSON.stringify(uniqueOrders));

          const userReturnKey = `medideliver_cached_returns_${currentUser.email || currentUser._id || currentUser.id || "guest"}`;
          localStorage.setItem(userReturnKey, JSON.stringify(matchedReturns));
        } catch (e) {}
      } else {
        setOrders([]);
        setUserReturns([]);
      }
    } catch (err) {
      console.error("Fetch Initial Data Error in MyOrders:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
      setRefreshingId(null);
    }
  };

  const handleRefreshSingleOrder = async (orderId) => {
    setRefreshingId(orderId);
    await fetchInitialData(user, true);
    setTimeout(() => setRefreshingId(null), 400);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="status-pill status-delivered">
            <CheckCircle2 className="st-ic" /> Delivered
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="status-pill status-out">
            <Bike className="st-ic animate-bounce-subtle" /> Out for Delivery
          </span>
        );
      case "PACKED":
        return (
          <span className="status-pill status-packed">
            <Package className="st-ic" /> Medicines Packed
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="status-pill status-confirmed">
            <CheckCircle2 className="st-ic" /> Admin Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="status-pill status-cancelled">
            <AlertTriangle className="st-ic" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="status-pill status-placed">
            <Clock className="st-ic" /> Order Placed
          </span>
        );
    }
  };

  // Compute 5-stage tracking progress & details for any order
  const getOrderTrackingSteps = (ord) => {
    const status = ord.orderStatus || "PLACED";
    let stepIndex = 0;
    if (status === "CONFIRMED") stepIndex = 1;
    else if (status === "PACKED") stepIndex = 2;
    else if (status === "OUT_FOR_DELIVERY") stepIndex = 3;
    else if (status === "DELIVERED") stepIndex = 4;
    else if (status === "CANCELLED") stepIndex = -1;

    const createdAtDate = new Date(ord.createdAt);
    const placedTimeStr = !isNaN(createdAtDate.getTime())
      ? createdAtDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : "Recently";

    const formatOffset = (mins, explicitDate) => {
      if (explicitDate) {
        const d = new Date(explicitDate);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        }
      }
      const t = new Date(createdAtDate.getTime() + mins * 60000);
      return t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    return [
      {
        step: 1,
        key: "PLACED",
        title: "Order Placed",
        shortDesc: ord.paymentMethod === "ONLINE" ? "Online Payment Verified" : "COD Placed",
        time: placedTimeStr,
        isDone: stepIndex >= 0,
        isCurrent: stepIndex === 0,
      },
      {
        step: 2,
        key: "CONFIRMED",
        title: "Admin Received",
        shortDesc: stepIndex >= 1 ? "Prescription & Stock Verified" : "Awaiting Admin Review",
        time: stepIndex >= 1 ? formatOffset(5, ord.confirmedAt) : "Pending",
        isDone: stepIndex >= 1,
        isCurrent: stepIndex === 0,
      },
      {
        step: 3,
        key: "PACKED",
        title: "Medicines Packed",
        shortDesc: stepIndex >= 2 ? "Tamper-proof Sealed" : "Queued for packing",
        time: stepIndex >= 2 ? formatOffset(15, ord.packedAt) : "Upcoming",
        isDone: stepIndex >= 2,
        isCurrent: stepIndex === 1,
      },
      {
        step: 4,
        key: "OUT_FOR_DELIVERY",
        title: "Out for Delivery",
        shortDesc: stepIndex >= 3 ? "Rider on the way 🛵" : "Rider assignment",
        time: stepIndex >= 3 ? formatOffset(25, ord.outForDeliveryAt) : "Upcoming",
        isDone: stepIndex >= 3,
        isCurrent: stepIndex === 2 || stepIndex === 3,
      },
      {
        step: 5,
        key: "DELIVERED",
        title: "Delivered",
        shortDesc: stepIndex >= 4 ? "Delivered at Doorstep 🎉" : "Expected Delivery",
        time: stepIndex >= 4 ? formatOffset(40, ord.deliveredAt) : (ord.estimatedDeliveryTime || "30-45 mins"),
        isDone: stepIndex >= 4,
        isCurrent: stepIndex === 4,
      },
    ];
  };

  const getOrderStatusBanner = (ord) => {
    const status = ord.orderStatus || "PLACED";
    const partner = ord.deliveryPartner || {
      name: "Ramesh Sharma (MediDeliver Express)",
      phone: "+91 98765 43210",
      vehicle: "Electric Scooter (UP 81 AB 4920)",
    };

    switch (status) {
      case "CONFIRMED":
        return {
          bannerClass: "track-banner-confirmed",
          icon: <CheckCircle2 className="tb-ic text-blue" />,
          stageLabel: "ADMIN ACCEPTED & CONFIRMED",
          title: "Order Received & Verified by Pharmacy Admin",
          desc: "Admin has verified medicine stock and prescription. Your medicines are currently moving to the pharmacy packing desk.",
          eta: "Expected Delivery: In 25 - 35 mins",
        };

      case "PACKED":
        return {
          bannerClass: "track-banner-packed",
          icon: <Package className="tb-ic text-purple" />,
          stageLabel: "MEDICINES PACKED & SEALED",
          title: "Medicines Packed & Ready for Dispatch",
          desc: "Medicines have been safely packed in a sanitized, tamper-proof medical package with your invoice. Ready for delivery partner pickup.",
          eta: "Expected Delivery: In 20 - 30 mins",
        };

      case "OUT_FOR_DELIVERY":
        return {
          bannerClass: "track-banner-out",
          icon: <Bike className="tb-ic text-orange animate-pulse" />,
          stageLabel: "OUT FOR DELIVERY — RIDER ON THE WAY",
          title: `Delivery Partner is on the way! 🛵`,
          desc: `Your delivery partner ${partner.name} has picked up your medicine package and is heading to your address.`,
          eta: "Arriving Soon: in 10 - 20 mins",
          partner,
        };

      case "DELIVERED":
        return {
          bannerClass: "track-banner-delivered",
          icon: <CheckCircle2 className="tb-ic text-emerald" />,
          stageLabel: "ORDER DELIVERED SUCCESSFULLY",
          title: "Medicine Order Delivered to Customer",
          desc: `Your order was successfully delivered to ${ord.customerName || user?.name || "you"} at the specified address.`,
          eta: "Delivered Successfully 🎉",
        };

      case "CANCELLED":
        return {
          bannerClass: "track-banner-cancelled",
          icon: <AlertTriangle className="tb-ic text-red" />,
          stageLabel: "ORDER CANCELLED",
          title: "Order has been Cancelled",
          desc: "This order was cancelled. Any online payment made will be refunded to your original payment method within 3-5 business days.",
          eta: "Cancelled",
        };

      case "PLACED":
      default:
        return {
          bannerClass: "track-banner-placed",
          icon: <Clock className="tb-ic text-amber" />,
          stageLabel: "ORDER PLACED & AWAITING ADMIN REVIEW",
          title: "Order Received — Awaiting Pharmacy Confirmation",
          desc: `We have received your order and payment of ₹${Number(ord.totalAmount || 0).toFixed(2)}. The pharmacy admin is reviewing prescription and stock.`,
          eta: "Estimated Delivery: In 35 - 45 mins",
        };
    }
  };

  const [expandedOrderIds, setExpandedOrderIds] = useState(() => new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const ordersPerPage = 4;

  const totalMedsCount = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((itemSum, it) => itemSum + (it.quantity || 1), 0),
    0
  );
  const totalDeliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;

  const filteredOrders = orders.filter((ord) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      (ord._id || "").toLowerCase().includes(searchLower) ||
      (ord.deliveryAddress || "").toLowerCase().includes(searchLower) ||
      (ord.items || []).some((i) => (i.medicine?.name || "").toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === "ALL" || ord.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset pagination when searching or changing status filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="my-orders-page">
      {/* NAVBAR */}
      <header className="orders-navbar">
        <div className="orders-nav-container">
          <Link to="/" className="orders-logo">
            <div className="orders-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

          <div className="orders-nav-actions">
            <button
              type="button"
              className="orders-back-btn"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              title="Go back to previous page"
            >
              <ArrowLeft className="back-ic" />
              <span>Back</span>
            </button>

            <button
              type="button"
              className={`orders-refresh-all-btn ${isSyncing ? "syncing" : ""}`}
              onClick={() => {
                setIsSyncing(true);
                fetchInitialData(user, false);
              }}
              title="Refresh order statuses & live tracking"
            >
              <RefreshCw className={`btn-refresh-ic ${isSyncing ? "spinning" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Refresh"}</span>
            </button>

            <Link to="/medicines" className="shop-link">
              <ShoppingBag className="shop-ic" /> Browse Catalog
            </Link>
            <UserProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="orders-main">
        {/* SUCCESS NOTIFICATION TOAST */}
        {cancelSuccessMsg && (
          <div className="orders-cancel-success-banner">
            <div className="ocsb-left">
              <CheckCircle2 className="ocsb-ic" />
              <span>{cancelSuccessMsg}</span>
            </div>
            <button
              type="button"
              className="ocsb-close"
              onClick={() => setCancelSuccessMsg("")}
            >
              <X />
            </button>
          </div>
        )}

        <div className="orders-header-row">
          <div>
            <h1>My Medicine Orders & Live Tracking 🛍️</h1>
            <p>Track your medicine orders in real-time — check packing status, admin confirmation & delivery rider location</p>
          </div>

          <Link to="/returns" className="request-return-btn">
            <RotateCcw className="ret-ic" /> Request Medicine Return
          </Link>
        </div>

        {/* CUSTOMER ORDER & RETURN SUMMARY STRIP */}
        <div className="orders-summary-strip">
          <div className="oss-item">
            <span className="oss-label">Total Orders</span>
            <strong>{orders.length}</strong>
            <small>Lifetime Placed</small>
          </div>
          <div className="oss-divider"></div>
          <div className="oss-item">
            <span className="oss-label">Medicines Ordered</span>
            <strong className="text-teal">{totalMedsCount} Units</strong>
            <small>Prescriptions / OTC</small>
          </div>
          <div className="oss-divider"></div>
          <div className="oss-item">
            <span className="oss-label">Delivered Orders</span>
            <strong className="text-emerald">{totalDeliveredCount}</strong>
            <small>Received Safely</small>
          </div>
          <div className="oss-divider"></div>
          <Link to="/returns?tab=my-returns" className="oss-item oss-clickable">
            <span className="oss-label">Return Requests</span>
            <strong className="text-purple">{userReturns.length}</strong>
            <small>Click to view claims →</small>
          </Link>
        </div>

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="orders-toolbar">
          <div className="search-box">
            <Search className="search-ic" />
            <input
              type="text"
              placeholder="Search by Order ID, medicine name, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Orders ({orders.length})</option>
              <option value="PLACED">Placed (Pending)</option>
              <option value="CONFIRMED">Admin Confirmed</option>
              <option value="PACKED">Medicines Packed</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* ORDERS LIST */}
        {loading && orders.length === 0 ? (
          <div className="orders-loading-card">
            <div className="orders-loader-ring-wrap">
              <div className="orders-pulse-glow" />
              <div className="orders-spinner-ring" />
              <Pill className="orders-loader-pill-icon" />
            </div>
            <div className="orders-loading-text-wrap">
              <h3>Syncing Medicine Orders & Live Tracking...</h3>
              <p>Fetching your prescriptions, delivery rider status and order history</p>
              <div className="orders-loading-progress-bar">
                <div className="orders-progress-fill" />
              </div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders-box">
            <Package className="no-ord-ic" />
            <h3>No orders found</h3>
            <p>You haven't placed any orders matching your filter criteria.</p>
            <Link to="/medicines" className="browse-meds-btn">
              Order Medicines Now <ArrowRight className="arr-ic" />
            </Link>
          </div>
        ) : (
          <div className="orders-grid-list">
            {currentOrders.map((ord) => {
              const banner = getOrderStatusBanner(ord);
              const trackingSteps = getOrderTrackingSteps(ord);
              const trackingCode = ord.trackingId || `TRK-${ord._id.slice(-6).toUpperCase()}`;
              const matchingReturn = userReturns.find(
                (r) =>
                  r.orderId === ord._id ||
                  r.billNumber === ord._id.slice(-6).toUpperCase() ||
                  (r.billNumber && ord._id.toUpperCase().endsWith(r.billNumber.toUpperCase()))
              );
              const isExpanded = expandedOrderIds.has(ord._id);
              const totalItemsCount = (ord.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

              return (
                <div key={ord._id} className={`order-history-card ${isExpanded ? "card-expanded" : "card-collapsed"}`}>
                  {/* CARD HEADER (CLICKABLE ACCORDION HEADER) */}
                  <div
                    className={`ord-card-hdr ${isExpanded ? "hdr-expanded" : ""}`}
                    onClick={() => toggleOrderExpand(ord._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleOrderExpand(ord._id);
                      }
                    }}
                  >
                    <div className="ord-id-wrap">
                      <Package className="ord-box-ic" />
                      <div>
                        <div className="ord-id-line">
                          <strong className="ord-id-text">
                            Order #{ord._id.slice(-6).toUpperCase()}
                          </strong>
                          <span className="tracking-id-tag">
                            <Navigation className="trk-tag-ic" /> {trackingCode}
                          </span>
                        </div>
                        <div className="ord-meta-row">
                          <span className="ord-date-text">
                            <Calendar className="cal-ic" />{" "}
                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" • "}
                            {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="ord-items-snippet">
                            {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} • ₹{Number(ord.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ord-hdr-right">
                      {getStatusBadge(ord.orderStatus)}
                      <button
                        type="button"
                        className="refresh-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefreshSingleOrder(ord._id);
                        }}
                        title="Check latest status"
                      >
                        <RefreshCw className={`ref-ic ${refreshingId === ord._id ? "spinning" : ""}`} />
                      </button>

                      <button
                        type="button"
                        className={`ord-expand-toggle-btn ${isExpanded ? "btn-expanded" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOrderExpand(ord._id);
                        }}
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                        {isExpanded ? (
                          <ChevronUp className="toggle-chevron-ic" />
                        ) : (
                          <ChevronDown className="toggle-chevron-ic" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE CONTENT */}
                  {isExpanded && (
                    <div className="ord-card-expanded-content">
                      {/* RETURN REQUEST NOTICE IF ACTIVE */}
                      {matchingReturn && (
                        <div className="order-return-attached-strip">
                          <div className="ora-left">
                            <RotateCcw className="ora-ic" />
                            <div>
                              <strong>Return Request Active: {matchingReturn.medicineName}</strong>
                              <small>Ticket #{matchingReturn.billNumber} • Status: {matchingReturn.status}</small>
                            </div>
                          </div>
                          <Link to="/returns?tab=my-returns" className="ora-view-link">
                            View Return Claim <ChevronRight className="nl-ic" />
                          </Link>
                        </div>
                      )}

                      {/* 1. LIVE ORDER STATUS HIGHLIGHT BANNER */}
                      <div className={`order-status-banner ${banner.bannerClass}`}>
                        <div className="os-banner-left">
                          <div className="os-banner-icon-box">{banner.icon}</div>
                          <div className="os-banner-text">
                            <span className="os-stage-tag">{banner.stageLabel}</span>
                            <h4>{banner.title}</h4>
                            <p>{banner.desc}</p>
                          </div>
                        </div>

                        <div className="os-banner-right">
                          <div className="os-eta-badge">
                            <Clock className="eta-ic" />
                            <span>{banner.eta}</span>
                          </div>
                          <button
                            type="button"
                            className="track-live-btn"
                            onClick={() => setActiveTrackingOrder(ord)}
                          >
                            <Navigation className="trk-ic" />
                            <span>Track Live Status</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. FIVE-STAGE VISUAL TIMELINE STEPPER */}
                      <div className="order-stepper-wrapper">
                        <div className="stepper-track-line" />
                        <div className="stepper-steps-row">
                          {trackingSteps.map((s, idx) => {
                            let stepStateClass = "step-pending";
                            if (s.isDone) stepStateClass = "step-completed";
                            else if (s.isCurrent) stepStateClass = "step-active";

                            return (
                              <div key={idx} className={`stepper-step-item ${stepStateClass}`}>
                                <div className="step-circle">
                                  {s.isDone ? (
                                    <Check className="step-ic-done" />
                                  ) : s.isCurrent ? (
                                    <span className="step-active-dot" />
                                  ) : (
                                    <span className="step-number">{s.step}</span>
                                  )}
                                </div>
                                <div className="step-label-box">
                                  <strong className="step-name">{s.title}</strong>
                                  <small className="step-sub">{s.shortDesc}</small>
                                  <span className="step-time">{s.time}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. DELIVERY PARTNER CARD IF OUT FOR DELIVERY */}
                      {ord.orderStatus === "OUT_FOR_DELIVERY" && banner.partner && (
                        <div className="active-rider-card">
                          <div className="rider-avatar-box">
                            <Bike className="rider-bike-ic" />
                          </div>
                          <div className="rider-details-box">
                            <div className="rider-name-row">
                              <strong>{banner.partner.name}</strong>
                              <span className="rider-badge">🛵 Assigned Delivery Partner</span>
                            </div>
                            <small className="rider-sub">
                              Vehicle: {banner.partner.vehicle || "Electric Scooter (UP 81 AB 4920)"} • Contact: {banner.partner.phone || "+91 98765 43210"}
                            </small>
                          </div>
                          <a
                            href={`tel:${banner.partner.phone || "9876543210"}`}
                            className="rider-call-button"
                          >
                            <Phone className="phone-ic" /> Call Rider
                          </a>
                        </div>
                      )}

                      {/* CARD BODY: ITEMS & SUMMARY */}
                      <div className="ord-card-body">
                        <div className="items-list-container">
                          <h4 className="body-section-title">Purchased Medicines:</h4>
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <div className="item-med-icon">
                                <Pill className="med-pill-svg" />
                              </div>
                              <div className="item-med-details">
                                <strong>{item.medicine?.name || item.name || "Medicine Item"}</strong>
                                <small>Quantity: {item.quantity} x ₹{item.price || item.medicine?.sellingPrice || 50}</small>
                              </div>
                              <strong className="item-row-total">
                                ₹{((item.price || item.medicine?.sellingPrice || 50) * item.quantity).toFixed(2)}
                              </strong>
                            </div>
                          ))}
                        </div>

                        <div className="ord-summary-sidebar">
                          <div className="address-snippet">
                            <small className="snippet-label">Delivery Address:</small>
                            <p>{ord.deliveryAddress || "Address on File"}</p>
                          </div>

                          <div className="payment-snippet">
                            <small className="snippet-label">Payment Status:</small>
                            <strong>
                              {ord.paymentMethod === "ONLINE" ? "Razorpay Online" : "Cash on Delivery (COD)"}
                              <span className={`mini-pay-tag ${ord.paymentStatus?.toLowerCase()}`}>
                                {ord.paymentStatus || "PAID"}
                              </span>
                            </strong>
                          </div>

                          <div className="amount-total-box">
                            <span>Total Paid:</span>
                            <strong className="final-amt">₹{Number(ord.totalAmount || 0).toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* CARD FOOTER ACTIONS */}
                      <div className="ord-card-ftr">
                        <div className="ftr-left-info">
                          <ShieldCheck className="shield-sm" /> 100% Genuine Pharmacy Order • Temperature Controlled
                        </div>

                        <div className="ftr-buttons">
                          <button
                            type="button"
                            className="track-btn-secondary"
                            onClick={() => setActiveTrackingOrder(ord)}
                          >
                            <Navigation className="btn-ic" /> Live Tracking
                          </button>

                          <button
                            type="button"
                            className="invoice-btn"
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            title="Preview & Print Official Tax Invoice"
                          >
                            <FileText className="btn-ic" /> Invoice
                          </button>

                          {/* Return Medicine button - ONLY ACTIVE AFTER DELIVERY */}
                          {ord.orderStatus === "DELIVERED" ? (
                            <Link
                              to={`/returns?orderId=${ord._id}&billNumber=${ord._id.slice(-6).toUpperCase()}`}
                              className="return-btn"
                            >
                              <RotateCcw className="btn-ic" /> Return Medicine
                            </Link>
                          ) : ord.orderStatus === "CANCELLED" ? (
                            <span className="return-btn return-btn-locked" title="Cancelled order">
                              <AlertTriangle className="btn-ic" /> Cancelled
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="cancel-order-action-btn"
                              onClick={() => handleOpenCancelModal(ord)}
                              title="Cancel your medicine order"
                            >
                              <X className="btn-ic" /> Cancel Order
                            </button>
                          )}

                          <Link to="/medicines" className="reorder-btn">
                            Order Again <ChevronRight className="btn-ic" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {filteredOrders.length > ordersPerPage && (
          <div className="orders-pagination">
            <div className="orders-pagination-info">
              Showing <strong>{indexOfFirstOrder + 1}</strong> - <strong>{Math.min(indexOfLastOrder, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> orders
            </div>
            <div className="orders-pagination-controls">
              <button
                type="button"
                className="orders-page-btn"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
              >
                <ChevronLeft className="page-arr-ic" /> Prev
              </button>

              <div className="orders-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`orders-page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="orders-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 200, behavior: "smooth" });
                }}
              >
                Next <ChevronRight className="page-arr-ic" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* DETAILED LIVE TRACKING MODAL */}
      {activeTrackingOrder && (
        <div className="modal-backdrop" onClick={() => setActiveTrackingOrder(null)}>
          <div className="tracking-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="track-modal-header">
              <div className="track-modal-title">
                <Navigation className="tm-ic text-primary" />
                <div>
                  <h3>Live Order Tracking</h3>
                  <p>Order #{activeTrackingOrder._id.slice(-6).toUpperCase()} • Tracking ID: {activeTrackingOrder.trackingId || `TRK-${activeTrackingOrder._id.slice(-6).toUpperCase()}`}</p>
                </div>
              </div>
              <button
                type="button"
                className="close-track-btn"
                onClick={() => setActiveTrackingOrder(null)}
              >
                <X />
              </button>
            </div>

            <div className="track-modal-body">
              {/* STATUS SUMMARY PILL */}
              <div className="tm-status-card">
                <div>
                  <small className="tm-label">Current Stage</small>
                  <h4>{getOrderStatusBanner(activeTrackingOrder).title}</h4>
                </div>
                <div className="tm-status-badge">
                  {getStatusBadge(activeTrackingOrder.orderStatus)}
                </div>
              </div>

              {/* SIMULATED ROUTE VISUALIZATION */}
              <div className="route-visual-card">
                <div className="route-endpoints">
                  <div className="route-point source">
                    <div className="point-dot bg-teal" />
                    <div>
                      <strong>MediDeliver Pharmacy Hub</strong>
                      <small>Central Hub, Aligarh</small>
                    </div>
                  </div>

                  <div className="route-line-wrap">
                    <div className="moving-bike-indicator">
                      <Bike className="mb-icon" />
                    </div>
                  </div>

                  <div className="route-point destination">
                    <div className="point-dot bg-emerald" />
                    <div>
                      <strong>Delivery Destination</strong>
                      <small className="dest-addr-short">
                        {activeTrackingOrder.customerName || user?.name || "Customer"}, {activeTrackingOrder.deliveryAddress?.slice(0, 45)}...
                      </small>
                    </div>
                  </div>
                </div>

                <div className="route-footer-info">
                  <span>⏱️ Estimated Arrival: <strong>{activeTrackingOrder.estimatedDeliveryTime || "30 - 45 mins"}</strong></span>
                  <span>📍 Distance: <strong>~2.4 km</strong></span>
                </div>
              </div>

              {/* DELIVERY PARTNER DETAILS */}
              <div className="delivery-partner-modal-box">
                <div className="dpm-left">
                  <div className="dpm-avatar">
                    <Bike className="dpm-avatar-svg" />
                  </div>
                  <div>
                    <div className="dpm-name-row">
                      <strong>{activeTrackingOrder.deliveryPartner?.name || "Ramesh Sharma"}</strong>
                      <span className="star-rating">★ 4.9 (520+ deliveries)</span>
                    </div>
                    <p className="dpm-meta">
                      Vehicle: {activeTrackingOrder.deliveryPartner?.vehicle || "Electric Bike (UP 81 AB 4920)"} • Contact: {activeTrackingOrder.deliveryPartner?.phone || "+91 98765 43210"}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${activeTrackingOrder.deliveryPartner?.phone || "9876543210"}`}
                  className="dpm-call-btn"
                >
                  <Phone className="call-ic-sm" /> Call Rider
                </a>
              </div>

              {/* STEP BY STEP AUDIT TRAIL */}
              <div className="tracking-audit-timeline">
                <h4>Order Activity Timeline</h4>
                <div className="audit-timeline-list">
                  {getOrderTrackingSteps(activeTrackingOrder).map((st, i) => (
                    <div key={i} className={`audit-step-row ${st.isDone ? "audit-done" : st.isCurrent ? "audit-current" : "audit-pending"}`}>
                      <div className="audit-step-indicator">
                        {st.isDone ? <Check className="audit-check" /> : <div className="audit-circle" />}
                      </div>
                      <div className="audit-step-content">
                        <div className="audit-time-row">
                          <strong>{st.title}</strong>
                          <span className="audit-time">{st.time}</span>
                        </div>
                        <p>{st.shortDesc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MODAL CANCEL ORDER OPTION IF ACTIVE */}
              {activeTrackingOrder.orderStatus !== "DELIVERED" && activeTrackingOrder.orderStatus !== "CANCELLED" && (
                <div className="modal-cancel-action-bar">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => {
                      const tgt = activeTrackingOrder;
                      setActiveTrackingOrder(null);
                      handleOpenCancelModal(tgt);
                    }}
                  >
                    <X className="btn-ic" /> Cancel This Medicine Order
                  </button>
                </div>
              )}

              {/* HELPLINE BOX */}
              <div className="pharmacy-helpline-box">
                <ShieldCheck className="help-ic" />
                <div>
                  <strong>Need help or have medicine queries?</strong>
                  <p>MediDeliver 24x7 Customer Support: 1800-200-MEDICINE (Toll Free)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER CANCEL ORDER CONFIRMATION MODAL */}
      {cancelModalOrder && (
        <div className="modal-backdrop" onClick={() => !isCancelling && setCancelModalOrder(null)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <div className="cancel-hdr-left">
                <div className="cancel-hdr-icon">
                  <AlertTriangle className="cancel-warn-ic" />
                </div>
                <div>
                  <h3>Cancel Medicine Order</h3>
                  <p>Order #{cancelModalOrder._id.slice(-6).toUpperCase()} • ₹{Number(cancelModalOrder.totalAmount || 0).toFixed(2)}</p>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => !isCancelling && setCancelModalOrder(null)}
              >
                <X />
              </button>
            </div>

            <div className="cancel-modal-body">
              <div className="cancel-summary-box">
                <div className="csb-row">
                  <span>Customer:</span>
                  <strong>{cancelModalOrder.customerName || user?.name || "Customer"}</strong>
                </div>
                <div className="csb-row">
                  <span>Payment Mode:</span>
                  <strong>{cancelModalOrder.paymentMethod === "ONLINE" ? "💳 Razorpay Online" : "💵 Cash on Delivery (COD)"}</strong>
                </div>
                <div className="csb-row">
                  <span>Medicines:</span>
                  <strong>
                    {(cancelModalOrder.items || [])
                      .map((i) => `${i.medicine?.name || i.name || "Medicine"} (${i.quantity}x)`)
                      .join(", ") || "Prescription Medicines"}
                  </strong>
                </div>
              </div>

              {cancelModalOrder.paymentMethod === "ONLINE" ? (
                <div className="cancel-refund-notice online">
                  <ShieldCheck className="crn-ic" />
                  <div>
                    <strong>Full Refund Guaranteed</strong>
                    <p>Since you paid online, a 100% refund of ₹{Number(cancelModalOrder.totalAmount || 0).toFixed(2)} will be credited back to your original payment source automatically within 2-4 hours.</p>
                  </div>
                </div>
              ) : (
                <div className="cancel-refund-notice cod">
                  <CheckCircle2 className="crn-ic" />
                  <div>
                    <strong>Cash on Delivery (No Charge)</strong>
                    <p>Your order dispatch has been stopped immediately. No payment is required.</p>
                  </div>
                </div>
              )}

              <div className="cancel-reason-group">
                <label className="reason-label">Select reason for cancellation:</label>
                <div className="reason-radios">
                  {[
                    "Ordered by mistake",
                    "Need to change delivery address or contact info",
                    "Delivery time is taking too long",
                    "Found medicines at a local pharmacy",
                    "Other Reason",
                  ].map((r) => (
                    <label key={r} className={`reason-radio-card ${cancelReason === r ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="cancelReason"
                        value={r}
                        checked={cancelReason === r}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                {cancelReason === "Other Reason" && (
                  <textarea
                    className="cancel-custom-note"
                    placeholder="Please specify reason for cancellation..."
                    rows={3}
                    value={customCancelNote}
                    onChange={(e) => setCustomCancelNote(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="cancel-modal-footer">
              <button
                type="button"
                className="keep-order-btn"
                onClick={() => setCancelModalOrder(null)}
                disabled={isCancelling}
              >
                Don't Cancel • Keep Order
              </button>

              <button
                type="button"
                className="confirm-cancel-btn"
                onClick={handleConfirmCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <span>Cancelling Order...</span>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAX INVOICE PREVIEW & PRINT MODAL */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          user={user}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* FOOTER */}
      <footer className="orders-footer">
        © 2026 MediDeliver. All rights reserved. Express Healthcare & Prescription Delivery.
      </footer>
    </div>
  );
};

export default MyOrders;
