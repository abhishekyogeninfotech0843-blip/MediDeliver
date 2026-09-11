import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
import InteractiveMapPicker from "../components/InteractiveMapPicker";
import {
  Pill,
  Lock,
  ShieldCheck,
  MapPin,
  CreditCard,
  Truck,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Building,
  Map,
  ShoppingBag,
  Loader2,
  Clock,
  ShieldAlert,
  Sparkles,
  Compass,
  ArrowLeft,
  Edit3
} from "lucide-react";
import {
  STORE_LOCATION,
  ALIGARH_AREAS,
  ALIGARH_PINCODE_MAP,
  getDeliveryEstimate,
  detectAligarhCustomLocation
} from "../utils/deliveryZone";
import "./Checkout.css";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [customLocQuery, setCustomLocQuery] = useState("");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: "202001",
    address: "",
    city: "Centre Point",
    state: "Uttar Pradesh",
    lat: 27.8974,
    lng: 78.088,
  });

  const handleMapLocationSelect = (loc) => {
    if (!loc) return;
    setAddress((prev) => ({
      ...prev,
      city: loc.city || loc.area || prev.city,
      pincode: loc.pincode || prev.pincode,
      lat: loc.lat || prev.lat,
      lng: loc.lng || prev.lng,
      address: prev.address ? prev.address : `${loc.city || loc.area}, Aligarh, Uttar Pradesh - ${loc.pincode}`,
    }));
    setError("");
    setShowMapPicker(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let initialUser = {};
    if (storedUser) {
      try {
        initialUser = JSON.parse(storedUser);
        setUser(initialUser);
      } catch (e) {}
    }

    const syncLocationToAddress = (locDetail) => {
      let initialLoc = locDetail;
      if (!initialLoc) {
        const savedLoc = localStorage.getItem("deliveryLocation");
        if (savedLoc) {
          try {
            initialLoc = JSON.parse(savedLoc);
          } catch (e) {}
        }
      }

      if (initialLoc && initialLoc.city) {
        setAddress((prev) => ({
          ...prev,
          name: prev.name || initialUser.name || "",
          phone: prev.phone || initialUser.phone || "",
          address: initialLoc.fullAddress || initialLoc.area || prev.address,
          city: initialLoc.area || initialLoc.city || "Centre Point",
          state: "Uttar Pradesh",
          pincode: initialLoc.pincode || "202001",
          lat: initialLoc.lat || 27.8974,
          lng: initialLoc.lng || 78.088,
        }));
      } else {
        setAddress((prev) => ({
          ...prev,
          name: prev.name || initialUser.name || "",
          phone: prev.phone || initialUser.phone || "",
        }));
      }
    };

    syncLocationToAddress();

    const handleLocationEvent = (e) => {
      if (e.detail) {
        syncLocationToAddress(e.detail);
      }
    };

    window.addEventListener("deliveryLocationUpdated", handleLocationEvent);
    return () => {
      window.removeEventListener("deliveryLocationUpdated", handleLocationEvent);
    };
  }, []);

  // Compute live estimate based on address inputs
  const deliveryEstimate = getDeliveryEstimate({
    lat: address.lat,
    lng: address.lng,
    pincode: address.pincode,
    city: address.city,
    address: address.address,
  });

  const deliveryCharge = cartTotal >= 500 ? 0 : 40;
  const finalTotal = cartTotal + deliveryCharge;

  const handleAddressChange = (field, value) => {
    setAddress((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "address" && value.length >= 3) {
        const custom = detectAligarhCustomLocation(value);
        if (custom && custom.isDeliverable) {
          next.lat = custom.lat;
          next.lng = custom.lng;
        }
      }
      return next;
    });
  };

  const handleCityChange = (cityName) => {
    const matched = ALIGARH_AREAS.find((a) => a.name === cityName);
    if (matched) {
      setAddress((prev) => ({
        ...prev,
        city: matched.name,
        pincode: matched.pincode,
        lat: matched.lat,
        lng: matched.lng,
      }));
      setError("");
    } else {
      const custom = detectAligarhCustomLocation(cityName);
      if (custom && custom.isDeliverable) {
        setAddress((prev) => ({
          ...prev,
          city: custom.area,
          pincode: custom.pincode,
          lat: custom.lat,
          lng: custom.lng,
        }));
        setError("");
      } else {
        handleAddressChange("city", cityName);
      }
    }
  };

  const handlePincodeInput = (val) => {
    handleAddressChange("pincode", val);

    if (val.length === 6 && /^[0-9]{6}$/.test(val)) {
      if (!val.startsWith("202")) {
        setError(
          `❌ PIN code ${val} is outside Aligarh district. MediDeliver operates exclusively within Aligarh District (PIN: 202xxx).`
        );
        return;
      }

      setError("");
      if (ALIGARH_PINCODE_MAP[val]) {
        const info = ALIGARH_PINCODE_MAP[val];
        setAddress((prev) => ({
          ...prev,
          city: info.area,
          state: "Uttar Pradesh",
        }));
      }
    }
  };

  const validateAddress = () => {
    if (!address.name.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!address.phone.trim()) {
      setError("Please enter your mobile number");
      return false;
    }
    if (!/^[0-9]{10}$/.test(address.phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!address.pincode.trim()) {
      setError("Please enter PIN code");
      return false;
    }
    if (!/^[0-9]{6}$/.test(address.pincode)) {
      setError("Please enter a valid 6-digit PIN code");
      return false;
    }
    if (!address.address.trim()) {
      setError("Please enter delivery address");
      return false;
    }
    if (!address.city.trim()) {
      setError("Please select city / locality in Aligarh");
      return false;
    }

    // Aligarh service area validation
    if (!deliveryEstimate.isDeliverable) {
      setError(
        deliveryEstimate.message ||
          "Delivery is not available outside Aligarh District (up to 45 km radius)."
      );
      return false;
    }

    return true;
  };

  const createOrder = async () => {
    try {
      const orderItems = cart.map((medicine) => ({
        medicine: medicine._id,
        quantity: medicine.quantity,
      }));

      const deliveryAddress = `${address.name}, ${address.address}, ${address.city}, Aligarh, Uttar Pradesh - ${address.pincode}`;

      const response = await api.post("/orders", {
        customerName: address.name || user?.name || "Customer",
        customerPhone: address.phone || user?.phone || "",
        customerEmail: user?.email || "",
        customer: user?._id || user?.id || "6a856810a35113391007d0cb",
        items: orderItems,
        deliveryAddress,
        paymentMethod,
        deliveryDistance: deliveryEstimate.distanceKm || 4.0,
        estimatedDeliveryTime: deliveryEstimate.deliveryTime || "30-45 mins",
      });

      return response.data.order;
    } catch (err) {
      console.error("Create Order Error:", err);
      throw new Error(err.response?.data?.message || "Unable to create order");
    }
  };

  const handleCODPayment = async () => {
    try {
      const order = await createOrder();

      await api.post("/payments", {
        order: order._id,
        paymentMethod: "COD",
        amount: finalTotal,
      });

      clearCart();
      navigate(`/order-success?orderId=${order._id}`);
    } catch (err) {
      isSubmittingRef.current = false;
      setError(err.message || "Failed to place COD order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async () => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        isSubmittingRef.current = false;
        setError("Razorpay SDK failed to load. Please check internet connection.");
        setLoading(false);
        return;
      }

      const order = await createOrder();

      const rpRes = await api.post("/payments/create-razorpay-order", {
        amount: finalTotal,
      });

      if (!rpRes.data.success) {
        isSubmittingRef.current = false;
        setError("Failed to initialize online payment. Please try COD.");
        setLoading(false);
        return;
      }

      const razorpayOrder = rpRes.data.order || rpRes.data.razorpayOrder;
      const razorpayKey = rpRes.data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere";

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "MediDeliver Aligarh",
        description: `Order Payment (${deliveryEstimate.deliveryTime} Delivery)`,
        order_id: razorpayOrder.id,
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email || "customer@medideliver.com",
        },
        theme: {
          color: "#0d9488",
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await api.post("/payments/verify-razorpay-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
              paymentMethod: "ONLINE",
            });

            if (verifyRes.data.success) {
              clearCart();
              navigate(`/order-success?orderId=${order._id}`);
            } else {
              isSubmittingRef.current = false;
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            isSubmittingRef.current = false;
            setError("Error verifying payment.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            isSubmittingRef.current = false;
            setLoading(false);
            setError("Payment window closed. Order was not placed.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Online payment error:", err);
      isSubmittingRef.current = false;
      setError(err.message || "Failed to process payment. Please try again.");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isSubmittingRef.current || loading) return;
    setError("");
    if (!validateAddress()) return;

    try {
      isSubmittingRef.current = true;
      setLoading(true);
      if (paymentMethod === "COD") {
        await handleCODPayment();
      } else {
        await handleOnlinePayment();
      }
    } catch (err) {
      isSubmittingRef.current = false;
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <header className="checkout-navbar">
          <div className="checkout-nav-container">
            <Link to="/" className="checkout-logo">
              <div className="checkout-logo-icon">
                <Pill className="nav-pill-icon" />
              </div>
              Medi<span>Deliver</span>
            </Link>
          </div>
        </header>
        <div className="checkout-empty">
          <ShoppingBag className="empty-cart-svg" />
          <h2>Your Cart is Empty</h2>
          <p>Please add medicines to your cart before proceeding to checkout.</p>
          <Link to="/medicines" className="shop-btn">
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* NAVBAR */}
      <header className="checkout-navbar">
        <div className="checkout-nav-container">
          <Link to="/" className="checkout-logo">
            <div className="checkout-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              className="orders-back-btn"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/cart");
                }
              }}
              title="Go back to cart"
            >
              <ArrowLeft className="back-ic" />
              <span>Back</span>
            </button>

            <div className="checkout-secure-badge">
              <Lock className="lock-sm" /> <span>256-bit Encrypted Checkout</span>
            </div>
            <UserProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="checkout-content">
        <div className="checkout-heading">
          <span className="checkout-sub-label">MEDIDELIVER ALIGARH</span>
          <h1>Shipping & Payment</h1>
          <p>Exclusive pharmacy delivery for Aligarh District (Up to 45 km radius).</p>
        </div>

        {error && (
          <div className="checkout-error-alert">
            <AlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="checkout-layout">
          {/* LEFT SIDE */}
          <div className="checkout-left">
            {/* STEP 1: ADDRESS */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <span className="step-number">1</span>
                <div>
                  <h2>Delivery Address (Aligarh District)</h2>
                  <p>Medicines will be dispatched directly from our Aligarh Central Pharmacy.</p>
                </div>
              </div>

              {/* Service Boundary Notice */}
              <div className="checkout-zone-tag">
                <Truck className="cz-icon" />
                <span>
                  <strong>Aligarh Coverage Zone:</strong> We deliver to all Aligarh city localities and Tehsils (Koil, Atrauli, Khair, Iglas, Gabhana).
                </span>
              </div>

              {/* Interactive Map Action Card */}
              <div className="checkout-map-action-card">
                <div className="cma-left">
                  <div className="cma-icon-wrap">
                    <Map className="cma-icon" />
                  </div>
                  <div className="cma-text">
                    <h4>Pin Custom Delivery Location on Map</h4>
                    <p>Ordering for another address? (e.g. Gular Road, Banna Devi Thana, Civil Lines)</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="cma-open-btn"
                  onClick={() => setShowMapPicker(true)}
                >
                  <MapPin className="cma-btn-icon" />
                  <span>Pin on Map</span>
                </button>
              </div>

              {/* Pinned Location Status Bar */}
              <div className="checkout-pinned-status-bar">
                <div className="cps-info">
                  <MapPin className="cps-pin-icon" />
                  <div>
                    <strong>📍 Selected Spot: {address.city || "Centre Point, Aligarh"}</strong>
                    <span>PIN: {address.pincode} • Coords: {address.lat?.toFixed(4)}, {address.lng?.toFixed(4)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="cps-adjust-btn"
                  onClick={() => setShowMapPicker(true)}
                >
                  <Edit3 style={{ width: 13, height: 13, display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                  Adjust on Map
                </button>
              </div>

              <div className="address-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={address.name}
                      onChange={(e) =>
                        handleAddressChange("name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number *</label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        placeholder="10 digit mobile number"
                        value={address.phone}
                        onChange={(e) =>
                          handleAddressChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="pincode-label-row">
                      <label>PIN Code (Aligarh: 202xxx) *</label>
                      {pincodeLoading && (
                        <span className="detecting-spin">
                          <Loader2 className="spin-ic" /> Checking...
                        </span>
                      )}
                    </div>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="e.g. 202001"
                        value={address.pincode}
                        onChange={(e) => handlePincodeInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Location Quick Finder */}
                <div className="form-group">
                  <div className="pincode-label-row">
                    <label>
                      <Sparkles style={{ width: 14, height: 14, color: "#0d9488", display: "inline", marginRight: 4 }} />
                      Quick Search Custom Location / Colony in Aligarh
                    </label>
                    <span
                      style={{ fontSize: "12px", color: "#0d9488", cursor: "pointer", fontWeight: 600 }}
                      onClick={() => setShowMapPicker(true)}
                    >
                      📍 Open Full Map
                    </span>
                  </div>
                  <div className="input-wrapper" style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Type custom location (e.g. Gular Road, Banna Devi Thana, Centre Point)..."
                      value={customLocQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomLocQuery(val);
                        if (val.length >= 2) {
                          const custom = detectAligarhCustomLocation(val);
                          if (custom && custom.isDeliverable) {
                            setAddress((prev) => ({
                              ...prev,
                              city: custom.area || val,
                              pincode: custom.pincode || prev.pincode,
                              lat: custom.lat || prev.lat,
                              lng: custom.lng || prev.lng,
                            }));
                            setError("");
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="cps-adjust-btn"
                      style={{ padding: "0 16px", height: "42px", display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={() => setShowMapPicker(true)}
                    >
                      <MapPin style={{ width: 16, height: 16 }} />
                      <span>Pin on Map</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Complete Street Address & Landmark *</label>
                  <div className="input-wrapper textarea-wrapper">
                    <textarea
                      rows="3"
                      placeholder="House No., Street, Colony, Landmark (e.g. Near Banna Devi Thana / Gular Road / Centre Point)"
                      value={address.address}
                      onChange={(e) =>
                        handleAddressChange("address", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  {/* STATE - LOCKED TO UP */}
                  <div className="form-group">
                    <label>State (Service Region) *</label>
                    <div className="input-wrapper">
                      <select value="Uttar Pradesh" disabled>
                        <option value="Uttar Pradesh">
                          Uttar Pradesh (Aligarh District Service)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* ALIGARH LOCALITY / TEHSIL SELECTOR */}
                  <div className="form-group">
                    <label>Locality / Tehsil in Aligarh *</label>
                    <div className="input-wrapper">
                      <select
                        value={address.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                      >
                        {!ALIGARH_AREAS.some((a) => a.name === address.city) && (
                          <option value={address.city}>
                            📍 {address.city} (Custom Area)
                          </option>
                        )}
                        {ALIGARH_AREAS.map((a) => (
                          <option key={a.name} value={a.name}>
                            {a.name} ({a.pincode}) - {a.deliveryTime}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dynamic Delivery Time & Distance Card */}
                {deliveryEstimate.isDeliverable ? (
                  <div className="checkout-delivery-estimate-card">
                    <div className="cd-est-icon">
                      <Clock className="cd-svg" />
                    </div>
                    <div className="cd-est-info">
                      <div className="cd-badge-row">
                        <span className="cd-badge">{deliveryEstimate.deliveryBadge}</span>
                        <span className="cd-dist">
                          ~{deliveryEstimate.distanceKm} km from Pharmacy Hub
                        </span>
                      </div>
                      <h4 className="cd-time">
                        Estimated Delivery: {deliveryEstimate.deliveryTime}
                      </h4>
                      <p className="cd-note">{deliveryEstimate.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="checkout-delivery-alert-card">
                    <ShieldAlert className="cd-alert-svg" />
                    <div>
                      <h4>Delivery Not Available at this Location</h4>
                      <p>{deliveryEstimate.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: PAYMENT */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <span className="step-number">2</span>
                <div>
                  <h2>Payment Option</h2>
                  <p>Choose your preferred payment method.</p>
                </div>
              </div>

              <div className="payment-options">
                {/* ONLINE */}
                <label
                  className={`payment-option-card ${paymentMethod === "ONLINE" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                  />
                  <div className="pay-card-icon">
                    <CreditCard className="pay-svg" />
                  </div>
                  <div className="pay-card-info">
                    <div className="pay-card-title">
                      <strong>Razorpay Online Payment</strong>
                      <span className="pay-badge green">Instant & Fast</span>
                    </div>
                    <p>UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Net Banking</p>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`payment-option-card ${paymentMethod === "COD" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <div className="pay-card-icon">
                    <Truck className="pay-svg" />
                  </div>
                  <div className="pay-card-info">
                    <div className="pay-card-title">
                      <strong>Cash on Delivery (COD)</strong>
                      <span className="pay-badge blue">Pay at Doorstep</span>
                    </div>
                    <p>Pay cash or scan QR when medicines arrive at your doorstep</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SUMMARY */}
          <div className="checkout-right">
            <div className="checkout-summary">
              <div className="summary-header-row">
                <div className="sum-hdr-left">
                  <div className="sum-hdr-icon">
                    <ShoppingBag className="sum-bag-ic" />
                  </div>
                  <div>
                    <h3>Order Summary</h3>
                    <p className="summary-subtitle">
                      {cart.length} medicine{cart.length !== 1 ? "s" : ""} in cart
                    </p>
                  </div>
                </div>
                <span className="items-count-badge">
                  {cart.reduce((total, it) => total + (it.quantity || 1), 0)} Items
                </span>
              </div>

              <div className="summary-items-list">
                {cart.map((item) => (
                  <div key={item._id} className="summary-item-row">
                    <div className="sum-item-left">
                      <div className="sum-item-med-icon">
                        <Pill className="sum-pill-ic" />
                      </div>
                      <div className="sum-item-details">
                        <strong className="sum-item-name">{item.name}</strong>
                        <div className="sum-item-meta">
                          <span className="sum-qty-pill">Qty: {item.quantity}</span>
                          <span className="sum-unit-price">₹{item.sellingPrice} each</span>
                        </div>
                      </div>
                    </div>
                    <div className="sum-item-right">
                      <span className="sum-item-price">
                        ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-pricing-table">
                <div className="summary-row">
                  <span>Item Subtotal</span>
                  <strong>₹{cartTotal.toFixed(2)}</strong>
                </div>

                <div className="summary-row">
                  <span>Delivery Partner Fee</span>
                  {deliveryCharge === 0 ? (
                    <span className="free-badge">🎉 FREE Delivery</span>
                  ) : (
                    <strong>₹{deliveryCharge.toFixed(2)}</strong>
                  )}
                </div>

                {/* Dynamic Delivery Time summary line */}
                <div className="summary-row">
                  <span className="est-time-label">
                    <Clock className="mini-clock-ic" /> Estimated Arrival
                  </span>
                  <span className="est-time-val">
                    {deliveryEstimate.isDeliverable
                      ? deliveryEstimate.deliveryTime
                      : "Not Deliverable"}
                  </span>
                </div>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <div>
                  <span className="total-label">Total Payable</span>
                  <small className="tax-inclusive-tag">Inclusive of all taxes</small>
                </div>
                <span className="total-price">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className={`place-order-btn ${!deliveryEstimate.isDeliverable ? "disabled-btn" : ""}`}
                onClick={handlePlaceOrder}
                disabled={loading || !deliveryEstimate.isDeliverable}
                title={
                  !deliveryEstimate.isDeliverable
                    ? "Cannot order outside Aligarh district"
                    : "Place Order"
                }
              >
                {loading ? (
                  <span className="btn-spinner-wrap">
                    <Loader2 className="spin-ic" /> Processing Order...
                  </span>
                ) : !deliveryEstimate.isDeliverable ? (
                  <span>Outside Aligarh Service Zone</span>
                ) : (
                  <span>
                    Confirm & Place Order • ₹{finalTotal.toFixed(2)}
                  </span>
                )}
              </button>

              <div className="trust-footer">
                <ShieldCheck className="trust-ic" />
                <span>100% Genuine Medicines • Direct Aligarh Pharmacy Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* INTERACTIVE MAP LOCATION PICKER MODAL */}
      {showMapPicker && (
        <div
          className="checkout-map-modal-backdrop"
          onClick={() => setShowMapPicker(false)}
        >
          <div
            className="checkout-map-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <InteractiveMapPicker
              initialLat={address.lat}
              initialLng={address.lng}
              initialCity={address.city}
              initialPincode={address.pincode}
              initialAddress={address.address}
              onLocationSelect={handleMapLocationSelect}
              onClose={() => setShowMapPicker(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="checkout-footer">
        © 2026 MediDeliver Aligarh. All rights reserved. 24/7 Healthcare Delivery.
      </footer>
    </div>
  );
};

export default Checkout;
