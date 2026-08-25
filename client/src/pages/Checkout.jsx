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
  ShoppingBag
} from "lucide-react";
import "./Checkout.css";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
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

    const savedLoc = localStorage.getItem("deliveryLocation");
    let initialLoc = {};
    if (savedLoc) {
      try {
        initialLoc = JSON.parse(savedLoc);
      } catch (e) {}
    }

    setAddress((prev) => ({
      ...prev,
      name: prev.name || initialUser.name || "",
      phone: prev.phone || initialUser.phone || "",
      address: prev.address || initialLoc.fullAddress || initialLoc.area || "",
      city: prev.city || initialLoc.city || "",
      state: prev.state || initialLoc.state || "",
      pincode: prev.pincode || initialLoc.pincode || "",
    }));
  }, []);

  const deliveryCharge = cartTotal >= 500 ? 0 : 40;
  const finalTotal = cartTotal + deliveryCharge;

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      setError("Please enter city");
      return false;
    }
    if (!address.state.trim()) {
      setError("Please enter state");
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
        customer: "6a856810a35113391007d0cb",
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
              err.response?.data?.message || "Payment verification failed",
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
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User className="field-icon" />
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
                    <label>Mobile Number</label>
                    <div className="input-wrapper">
                      <Phone className="field-icon" />
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
                    <label>PIN Code</label>
                    <div className="input-wrapper">
                      <MapPin className="field-icon" />
                      <input
                        type="text"
                        placeholder="6 digit PIN code"
                        value={address.pincode}
                        onChange={(e) =>
                          handleAddressChange("pincode", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Complete Address</label>
                  <div className="input-wrapper textarea-wrapper">
                    <Building className="field-icon textarea-icon" />
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
                  <div className="form-group">
                    <label>City</label>
                    <div className="input-wrapper">
                      <Map className="field-icon" />
                      <input
                        type="text"
                        placeholder="City"
                        value={address.city}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <div className="input-wrapper">
                      <Map className="field-icon" />
                      <input
                        type="text"
                        placeholder="State"
                        value={address.state}
                        onChange={(e) =>
                          handleAddressChange("state", e.target.value)
                        }
                      />
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
                {/* COD CARD */}
                <label
                  className={`payment-option-card ${
                    paymentMethod === "COD" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />

                  <div className="option-icon-wrap cod">
                    <Truck className="opt-svg" />
                  </div>

                  <div className="option-info">
                    <strong>Cash on Delivery (COD)</strong>
                    <p>Pay in cash when your medicines reach your doorstep.</p>
                  </div>
                </label>

                {/* ONLINE CARD */}
                <label
                  className={`payment-option-card ${
                    paymentMethod === "ONLINE" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />

                  <div className="option-icon-wrap online">
                    <CreditCard className="opt-svg" />
                  </div>

                  <div className="option-info">
                    <strong>Online Payment (Razorpay)</strong>
                    <p>Pay securely via UPI, Google Pay, Credit/Debit Card or Netbanking.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="checkout-summary">
            <h2>Order Details</h2>

            <div className="checkout-items">
              {cart.map((medicine) => (
                <div className="checkout-item" key={medicine._id}>
                  <div className="chk-item-icon">
                    <Pill className="chk-pill-svg" />
                  </div>

                  <div className="chk-item-details">
                    <strong>{medicine.name}</strong>
                    <span>Qty: {medicine.quantity}</span>
                  </div>

                  <strong className="chk-item-price">
                    ₹
                    {(
                      Number(medicine.sellingPrice || 0) * medicine.quantity
                    ).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery Charge</span>
              <strong className={deliveryCharge === 0 ? "free-text" : ""}>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total Payable</span>
              <strong>₹{finalTotal.toFixed(2)}</strong>
            </div>

            <button
              className="place-order-button"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading
                ? "Processing Order..."
                : paymentMethod === "ONLINE"
                  ? `Pay ₹${finalTotal.toFixed(2)} Online`
                  : "Confirm & Place Order"}
            </button>

            <div className="checkout-security">
              <ShieldCheck className="sec-icon" />
              <span>Money-back guarantee & genuine products</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
