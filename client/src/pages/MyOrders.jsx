import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
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

const MyOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let currentUser = null;
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      } catch (e) {}
    }

    fetchUserOrders(currentUser);
  }, []);

  const fetchUserOrders = async (currentUser = user, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/orders").catch(() => ({ data: { success: false, orders: [] } }));

      let fetchedOrders = [];
      if (response.data?.success && Array.isArray(response.data.orders)) {
        fetchedOrders = response.data.orders;
      }

      // Filter orders strictly for the current logged-in user!
      if (currentUser && currentUser.name) {
        const userNameLower = currentUser.name.toLowerCase().trim();
        const userEmailLower = (currentUser.email || "").toLowerCase().trim();

        const userSpecificOrders = fetchedOrders.filter((ord) => {
          const custName = (ord.customerName || ord.customer?.name || "").toLowerCase();
          const custEmail = (ord.customer?.email || "").toLowerCase();
          const delivAddr = (ord.deliveryAddress || "").toLowerCase();

          return (
            (userEmailLower && custEmail === userEmailLower) ||
            (custName && (custName.includes(userNameLower) || userNameLower.includes(custName))) ||
            (delivAddr && delivAddr.includes(userNameLower))
          );
        });

        fetchedOrders = userSpecificOrders;
      }

      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Fetch User Orders Error:", err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshingId(null);
    }
  };

  const handleRefreshSingleOrder = async (orderId) => {
    setRefreshingId(orderId);
    await fetchUserOrders(user, true);
    setTimeout(() => setRefreshingId(null), 500);
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

  const filteredOrders = orders.filter((ord) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      (ord._id || "").toLowerCase().includes(searchLower) ||
      (ord.deliveryAddress || "").toLowerCase().includes(searchLower) ||
      (ord.items || []).some((i) => (i.medicine?.name || "").toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === "ALL" || ord.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              className="orders-refresh-all-btn"
              onClick={() => fetchUserOrders(user)}
              title="Refresh order statuses"
            >
              <RefreshCw className={`btn-refresh-ic ${loading ? "spinning" : ""}`} />
              <span>Refresh</span>
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
        <div className="orders-header-row">
          <div>
            <h1>My Medicine Orders & Live Tracking 🛍️</h1>
            <p>Track your medicine orders in real-time — check packing status, admin confirmation & delivery rider location</p>
          </div>

          <Link to="/returns" className="request-return-btn">
            <RotateCcw className="ret-ic" /> Request Medicine Return
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
        {loading ? (
          <div className="orders-loading">
            <div className="spinner">
              <Pill className="spin-pill" />
            </div>
            <p>Loading your order history & live tracking data...</p>
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
            {filteredOrders.map((ord) => {
              const banner = getOrderStatusBanner(ord);
              const trackingSteps = getOrderTrackingSteps(ord);
              const trackingCode = ord.trackingId || `TRK-${ord._id.slice(-6).toUpperCase()}`;

              return (
                <div key={ord._id} className="order-history-card">
                  {/* CARD HEADER */}
                  <div className="ord-card-hdr">
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
                      </div>
                    </div>

                    <div className="ord-hdr-right">
                      {getStatusBadge(ord.orderStatus)}
                      <button
                        type="button"
                        className="refresh-card-btn"
                        onClick={() => handleRefreshSingleOrder(ord._id)}
                        title="Check latest status"
                      >
                        <RefreshCw className={`ref-ic ${refreshingId === ord._id ? "spinning" : ""}`} />
                      </button>
                    </div>
                  </div>

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
                        onClick={() => alert(`📄 Downloading Invoice for Order #${ord._id.slice(-6).toUpperCase()}...`)}
                      >
                        <FileText className="btn-ic" /> Invoice
                      </button>

                      <Link to="/returns" className="return-btn">
                        <RotateCcw className="btn-ic" /> Return Medicine
                      </Link>

                      <Link to="/medicines" className="reorder-btn">
                        Order Again <ChevronRight className="btn-ic" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* FOOTER */}
      <footer className="orders-footer">
        © 2026 MediDeliver. All rights reserved. Express Healthcare & Prescription Delivery.
      </footer>
    </div>
  );
};

export default MyOrders;
