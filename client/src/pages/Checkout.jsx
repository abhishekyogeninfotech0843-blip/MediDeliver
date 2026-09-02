import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
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
  Loader2
} from "lucide-react";
import "./Checkout.css";

const INDIAN_STATES_CITIES = {
  "Uttar Pradesh": [
    "Aligarh",
    "Noida",
    "Greater Noida",
    "Ghaziabad",
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Prayagraj (Allahabad)",
    "Meerut",
    "Bareilly",
    "Gorakhpur",
    "Mathura",
    "Moradabad",
  ],
  "Delhi NCR": ["New Delhi", "Central Delhi", "East Delhi", "North Delhi", "South Delhi", "West Delhi"],
  Haryana: ["Gurgaon (Gurugram)", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Navi Mumbai"],
  Karnataka: ["Bangalore (Bengaluru)", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Other / Custom": ["Other City"],
};

const COMMON_PINCODES = {
  202001: { city: "Aligarh", state: "Uttar Pradesh" },
  202002: { city: "Aligarh", state: "Uttar Pradesh" },
  201301: { city: "Noida", state: "Uttar Pradesh" },
  201309: { city: "Greater Noida", state: "Uttar Pradesh" },
  201001: { city: "Ghaziabad", state: "Uttar Pradesh" },
  110001: { city: "New Delhi", state: "Delhi NCR" },
  122001: { city: "Gurgaon (Gurugram)", state: "Haryana" },
  121001: { city: "Faridabad", state: "Haryana" },
  400001: { city: "Mumbai", state: "Maharashtra" },
  411001: { city: "Pune", state: "Maharashtra" },
  560001: { city: "Bangalore (Bengaluru)", state: "Karnataka" },
  600001: { city: "Chennai", state: "Tamil Nadu" },
  500001: { city: "Hyderabad", state: "Telangana" },
  700001: { city: "Kolkata", state: "West Bengal" },
  380001: { city: "Ahmedabad", state: "Gujarat" },
  302001: { city: "Jaipur", state: "Rajasthan" },
};

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: "202001",
    address: "",
    city: "Aligarh",
    state: "Uttar Pradesh",
  });

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
          city: initialLoc.city || prev.city || "Aligarh",
          state: initialLoc.state || prev.state || "Uttar Pradesh",
          pincode: initialLoc.pincode || prev.pincode || "202001",
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

  const deliveryCharge = cartTotal >= 500 ? 0 : 40;
  const finalTotal = cartTotal + deliveryCharge;

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePincodeInput = async (val) => {
    handleAddressChange("pincode", val);

    if (val.length === 6 && /^[0-9]{6}$/.test(val)) {
      const pinNum = Number(val);
      // 1. Instant local dictionary lookup
      if (COMMON_PINCODES[pinNum]) {
        const { city, state } = COMMON_PINCODES[pinNum];
        setAddress((prev) => ({ ...prev, city, state }));
        return;
      }

      // 2. Postal Pincode API lookup
      try {
        setPincodeLoading(true);
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();

        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const rawState = postOffice.State || "";
          const rawDistrict = postOffice.District || postOffice.Block || postOffice.Name || "";

          // Match state key
          const matchedState =
            Object.keys(INDIAN_STATES_CITIES).find(
              (s) => s.toLowerCase() === rawState.toLowerCase()
            ) || rawState || "Uttar Pradesh";

          setAddress((prev) => ({
            ...prev,
            state: matchedState,
            city: rawDistrict || prev.city,
          }));
        }
      } catch (err) {
        console.warn("Pincode lookup error:", err);
      } finally {
        setPincodeLoading(false);
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
      setError("Please select city");
      return false;
    }
    if (!address.state.trim()) {
      setError("Please select state");
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

      const deliveryAddress = `${address.name}, ${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;

      const response = await api.post("/orders", {
        customerName: address.name || user?.name || "Customer",
        customerPhone: address.phone || user?.phone || "",
        customerEmail: user?.email || "",
        customer: user?.id || "6a856810a35113391007d0cb",
        items: orderItems,
        deliveryAddress,
        paymentMethod,
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
      });

      alert("Order placed successfully! 🎉");
      clearCart();
      navigate("/");
    } catch (err) {
      console.error("COD Error:", err);
      setError(err.message);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const order = await createOrder();

      const response = await api.post("/payments/razorpay/order", {
        order: order._id,
      });

      const { razorpayOrder, keyId } = response.data;

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MediDeliver",
        description: "Medicine Order",
        order_id: razorpayOrder.id,
        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await api.post("/payments/razorpay/verify", {
              order: order._id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              alert("Payment successful! Order placed successfully 🎉");
              clearCart();
              navigate("/");
            }
          } catch (err) {
            console.error("Payment Verification Error:", err);
            setError(
              err.response?.data?.message || "Payment verification failed"
            );
          }
        },
        prefill: {
          name: address.name,
          contact: address.phone,
        },
        notes: {
          orderId: order._id,
        },
        theme: {
          color: "#059669",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        setError("Razorpay Checkout is not loaded. Please refresh the page.");
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Online Payment Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError("");
    const isValid = validateAddress();
    if (!isValid) return;

    try {
      setLoading(true);
      if (paymentMethod === "COD") {
        await handleCODPayment();
      } else {
        await handleOnlinePayment();
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="empty-cart-icon-box">
            <ShoppingBag className="empty-bag-svg" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Please add medicines before continuing to checkout.</p>
          <Link to="/medicines" className="shop-btn">
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  const availableCities = INDIAN_STATES_CITIES[address.state] || [address.city || "Aligarh"];

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

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
          <span className="checkout-sub-label">MEDIDELIVER CHECKOUT</span>
          <h1>Shipping & Payment</h1>
          <p>Complete your delivery address and payment method to confirm order.</p>
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
                  <h2>Delivery Address</h2>
                  <p>Where should we deliver your medicines?</p>
                </div>
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
                      <label>PIN Code *</label>
                      {pincodeLoading && (
                        <span className="detecting-spin">
                          <Loader2 className="spin-ic" /> Auto-detecting...
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

                <div className="form-group">
                  <label>Complete Address *</label>
                  <div className="input-wrapper textarea-wrapper">
                    <textarea
                      rows="3"
                      placeholder="House No., Street, Landmark, Area"
                      value={address.address}
                      onChange={(e) =>
                        handleAddressChange("address", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  {/* STATE DROPDOWN */}
                  <div className="form-group">
                    <label>State *</label>
                    <div className="input-wrapper">
                      <select
                        value={address.state || "Uttar Pradesh"}
                        onChange={(e) => {
                          const selectedSt = e.target.value;
                          const cities = INDIAN_STATES_CITIES[selectedSt] || [];
                          setAddress((prev) => ({
                            ...prev,
                            state: selectedSt,
                            city: cities[0] || prev.city,
                          }));
                        }}
                      >
                        {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CITY DROPDOWN */}
                  <div className="form-group">
                    <label>City *</label>
                    <div className="input-wrapper">
                      {INDIAN_STATES_CITIES[address.state] ? (
                        <select
                          value={address.city}
                          onChange={(e) => handleAddressChange("city", e.target.value)}
                        >
                          {availableCities.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Enter city"
                          value={address.city}
                          onChange={(e) => handleAddressChange("city", e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
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
                  <div className="pay-card-icon cod">
                    <Truck className="pay-svg" />
                  </div>
                  <div className="pay-card-info">
                    <div className="pay-card-title">
                      <strong>Cash on Delivery (COD)</strong>
                      <span className="pay-badge blue">Pay at Doorstep</span>
                    </div>
                    <p>Pay with cash or UPI QR code when medicine arrives at your doorstep.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: SUMMARY */}
          <div className="checkout-right">
            <div className="order-summary-card">
              <h2>Order Details</h2>

              <div className="summary-items">
                {cart.map((item) => (
                  <div className="summary-item" key={item._id}>
                    <div className="sum-item-icon">
                      <Pill className="sum-pill-svg" />
                    </div>
                    <div className="sum-item-details">
                      <strong>{item.name}</strong>
                      <small>Qty: {item.quantity}</small>
                    </div>
                    <div className="sum-item-price">
                      ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Delivery Charge</span>
                {deliveryCharge === 0 ? (
                  <span className="free-badge">FREE</span>
                ) : (
                  <strong>₹{deliveryCharge.toFixed(2)}</strong>
                )}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total Payable</span>
                <span className="total-price">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <span>Processing Order...</span>
                ) : (
                  <span>Confirm & Place Order</span>
                )}
              </button>

              <div className="trust-footer">
                <ShieldCheck className="trust-ic" />
                <span>Money-back guarantee & genuine products</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="checkout-footer">
        © 2026 MediDeliver. All rights reserved. Express Healthcare Delivery.
      </footer>
    </div>
  );
};

export default Checkout;
