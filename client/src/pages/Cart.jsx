import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import UserProfileDropdown from "../components/UserProfileDropdown";
import {
  Pill,
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import "./Cart.css";

const Cart = () => {
  const [user, setUser] = useState(null);
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    cartTotal,
  } = useCart();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  // =========================
  // DELIVERY CHARGE
  // =========================
  const deliveryCharge = cartTotal >= 500 ? 0 : 40;

  // =========================
  // FINAL TOTAL
  // =========================
  const finalTotal = cartTotal + deliveryCharge;

  return (
    <div className="cart-page">
      {/* ================= NAVBAR ================= */}
      <header className="cart-navbar">
        <div className="cart-nav-container">
          <Link to="/" className="cart-logo">
            <div className="cart-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link to="/medicines" className="continue-shopping">
              <ArrowLeft className="nav-back-icon" />
              <span>Continue Shopping</span>
            </Link>

            <UserProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="cart-content">
        <div className="cart-heading">
          <span className="cart-sub-label">MEDIDELIVER</span>
          <h1>Your Cart</h1>
          <p>Review your medicines and healthcare products before checkout.</p>
        </div>

        {/* ================= EMPTY CART ================= */}
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon-box">
              <ShoppingBag className="empty-bag-svg" />
            </div>

            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any medicines to your cart yet.</p>

            <Link to="/medicines" className="shop-medicines-button">
              <Pill className="btn-icon" />
              <span>Browse Medicines</span>
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* ================= CART ITEMS ================= */}
            <div className="cart-items">
              <div className="cart-items-header">
                <strong>Your Medicines</strong>
                <span className="items-count-badge">
                  {cart.length} item{cart.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="cart-item-list">
                {cart.map((medicine) => {
                  const itemTotal =
                    Number(medicine.sellingPrice || 0) * medicine.quantity;

                  return (
                    <div className="cart-item" key={medicine._id}>
                      <div className="cart-item-image">
                        <Pill className="cart-pill-icon" />
                      </div>

                      <div className="cart-item-details">
                        <span className="cart-item-category">
                          {medicine.category || "Healthcare"}
                        </span>
                        <h3>{medicine.name}</h3>
                        <p>{medicine.company || "Trusted Manufacturer"}</p>
                        <strong className="cart-item-price">
                          ₹{Number(medicine.sellingPrice || 0).toFixed(2)}
                        </strong>
                      </div>

                      <div className="quantity-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => decreaseQuantity(medicine._id)}
                          title="Decrease quantity"
                        >
                          <Minus className="qty-svg" />
                        </button>

                        <input
                          type="number"
                          className="qty-input"
                          min="1"
                          max="999"
                          value={medicine.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) {
                              updateQuantity(medicine._id, val);
                            }
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val <= 0) {
                              updateQuantity(medicine._id, 1);
                            }
                          }}
                          aria-label="Medicine quantity"
                        />

                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => increaseQuantity(medicine._id)}
                          title="Increase quantity"
                        >
                          <Plus className="qty-svg" />
                        </button>
                      </div>

                      <div className="cart-item-total">
                        ₹{itemTotal.toFixed(2)}
                      </div>

                      <button
                        type="button"
                        className="remove-cart-item"
                        title="Remove item"
                        onClick={() => removeFromCart(medicine._id)}
                      >
                        <Trash2 className="trash-svg" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= ORDER SUMMARY ================= */}
            <div className="cart-summary">
              <h2>Order Summary</h2>

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

              {deliveryCharge > 0 ? (
                <div className="free-delivery-note">
                  <Truck className="truck-sm" /> Add ₹{(500 - cartTotal).toFixed(2)} more for <strong>FREE delivery</strong>
                </div>
              ) : (
                <div className="free-delivery-eligible">
                  <ShieldCheck className="shield-sm" /> Eligible for FREE Express Delivery
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total Amount</span>
                <strong>₹{finalTotal.toFixed(2)}</strong>
              </div>

              <Link to="/checkout" className="checkout-button">
                <span>Proceed to Checkout</span>
                <ArrowRight className="btn-icon" />
              </Link>

              <div className="secure-checkout">
                <ShieldCheck className="secure-icon" />
                <span>100% Encrypted & Safe Checkout</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
