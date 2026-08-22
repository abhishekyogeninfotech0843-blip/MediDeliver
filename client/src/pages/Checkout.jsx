import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/api";
import "./Checkout.css";

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();

  const navigate = useNavigate();

  // =========================
  // Payment Method
  // =========================

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // =========================
  // Loading
  // =========================

  const [loading, setLoading] = useState(false);

  // =========================
  // Error
  // =========================

  const [error, setError] = useState("");

  // =========================
  // Delivery Address
  // =========================

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
  });

  // =========================
  // Order Total
  // =========================

  const deliveryCharge = cartTotal >= 500 ? 0 : 40;

  const finalTotal = cartTotal + deliveryCharge;

  // =========================
  // Address Change
  // =========================

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================
  // Validate Address
  // =========================

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
      setError("Please enter a valid 10 digit mobile number");
      return false;
    }

    if (!address.pincode.trim()) {
      setError("Please enter PIN code");
      return false;
    }

    if (!/^[0-9]{6}$/.test(address.pincode)) {
      setError("Please enter a valid 6 digit PIN code");
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

  // =========================
  // Create Order
  // =========================

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

  // =========================
  // COD Order
  // =========================

  const handleCODPayment = async () => {
    try {
      const order = await createOrder();

      // Create Payment Record
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

  // =========================
  // Razorpay Payment
  // =========================

  const handleOnlinePayment = async () => {
    try {
      // ==========================================
      // Create Order
      // ==========================================

      const order = await createOrder();

      // ==========================================
      // Create Razorpay Order
      // ==========================================

      const response = await api.post("/payments/razorpay/order", {
        order: order._id,
      });

      const { razorpayOrder, keyId } = response.data;

      // ==========================================
      // Razorpay Options
      // ==========================================

      const options = {
        key: keyId,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "MediDeliver",

        description: "Medicine Order",

        order_id: razorpayOrder.id,

        handler: async function (paymentResponse) {
          try {
            // ==========================================
            // Verify Payment
            // ==========================================

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
          color: "#2563eb",
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // ==========================================
      // Open Razorpay
      // ==========================================

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

  // =========================
  // Place Order
  // =========================

  const handlePlaceOrder = async () => {
    setError("");

    // Validate Address
    const isValid = validateAddress();

    if (!isValid) {
      return;
    }

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

  // =========================
  // Empty Cart
  // =========================

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p>Please add medicines before continuing to checkout.</p>

          <Link to="/medicines">Browse Medicines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* =========================
          Navbar
      ========================= */}

      <header className="checkout-navbar">
        <div className="checkout-nav-container">
          <Link to="/" className="checkout-logo">
            Medi<span>Deliver</span>
          </Link>

          <div className="checkout-secure">🔒 Secure Checkout</div>
        </div>
      </header>

      {/* =========================
          Main
      ========================= */}

      <main className="checkout-content">
        <div className="checkout-heading">
          <small>MEDIDELIVER</small>

          <h1>Checkout</h1>

          <p>Complete your delivery details to place your order.</p>
        </div>

        {/* Error */}

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        <div className="checkout-layout">
          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="checkout-left">
            {/* =========================
                Delivery Address
            ========================= */}

            <div className="checkout-card">
              <div className="checkout-card-title">
                <span className="step-number">1</span>

                <div>
                  <h2>Delivery Address</h2>

                  <p>Where should we deliver your medicines?</p>
                </div>
              </div>

              <div className="address-form">
                {/* Full Name */}

                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={address.name}
                    onChange={(e) =>
                      handleAddressChange("name", e.target.value)
                    }
                  />
                </div>

                {/* Mobile + PIN */}

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number</label>

                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={address.phone}
                      onChange={(e) =>
                        handleAddressChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>PIN Code</label>

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

                {/* Address */}

                <div className="form-group">
                  <label>Address</label>

                  <textarea
                    rows="3"
                    placeholder="House No., Street, Area"
                    value={address.address}
                    onChange={(e) =>
                      handleAddressChange("address", e.target.value)
                    }
                  />
                </div>

                {/* City + State */}

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>

                    <input
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>

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

            {/* =========================
                Payment Method
            ========================= */}

            <div className="checkout-card">
              <div className="checkout-card-title">
                <span className="step-number">2</span>

                <div>
                  <h2>Payment Method</h2>

                  <p>Choose how you want to pay.</p>
                </div>
              </div>

              <div className="payment-options">
                {/* COD */}

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />

                  <div>
                    <strong>Cash on Delivery</strong>

                    <p>Pay when your order arrives.</p>
                  </div>
                </label>

                {/* Online */}

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />

                  <div>
                    <strong>Online Payment</strong>

                    <p>Pay securely using UPI, Card or Net Banking.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-items">
              {cart.map((medicine) => (
                <div className="checkout-item" key={medicine._id}>
                  <div className="checkout-item-icon">💊</div>

                  <div className="checkout-item-details">
                    <strong>{medicine.name}</strong>

                    <span>Qty: {medicine.quantity}</span>
                  </div>

                  <strong>
                    ₹
                    {(
                      Number(medicine.sellingPrice || 0) * medicine.quantity
                    ).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-divider" />

            {/* Subtotal */}

            <div className="checkout-summary-row">
              <span>Subtotal</span>

              <strong>₹{cartTotal.toFixed(2)}</strong>
            </div>

            {/* Delivery */}

            <div className="checkout-summary-row">
              <span>Delivery</span>

              <strong>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </strong>
            </div>

            <div className="checkout-divider" />

            {/* Total */}

            <div className="checkout-total">
              <span>Total</span>

              <strong>₹{finalTotal.toFixed(2)}</strong>
            </div>

            {/* Place Order */}

            <button
              className="place-order-button"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "ONLINE"
                  ? `Pay ₹${finalTotal.toFixed(2)} Online`
                  : "Place Order"}
            </button>

            <div className="checkout-security">
              🔒 Your information is secure
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
