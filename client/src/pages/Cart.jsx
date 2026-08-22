import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal,
  } = useCart();

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
      {/* =========================
          NAVBAR
      ========================= */}

      <header className="cart-navbar">
        <div className="cart-nav-container">
          <Link to="/" className="cart-logo">
            Medi<span>Deliver</span>
          </Link>

          <Link to="/medicines" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="cart-content">
        <div className="cart-heading">
          <small>MEDIDELIVER</small>

          <h1>Your Cart</h1>

          <p>Review your medicines before checkout.</p>
        </div>

        {/* =========================
            EMPTY CART
        ========================= */}

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>

            <h2>Your cart is empty</h2>

            <p>Add medicines to your cart to continue.</p>

            <Link to="/medicines" className="shop-medicines-button">
              Browse Medicines
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* =========================
                CART ITEMS
            ========================= */}

            <div className="cart-items">
              <div className="cart-items-header">
                <strong>Your Medicines</strong>

                <span>
                  {cart.length} item
                  {cart.length > 1 ? "s" : ""}
                </span>
              </div>

              {cart.map((medicine) => {
                const itemTotal =
                  Number(medicine.sellingPrice || 0) * medicine.quantity;

                return (
                  <div className="cart-item" key={medicine._id}>
                    {/* Medicine Icon */}

                    <div className="cart-item-image">💊</div>

                    {/* Details */}

                    <div className="cart-item-details">
                      <div className="cart-item-category">
                        {medicine.category || "Healthcare"}
                      </div>

                      <h3>{medicine.name}</h3>

                      <p>{medicine.company || "Trusted Manufacturer"}</p>

                      <strong className="cart-item-price">
                        ₹{Number(medicine.sellingPrice || 0).toFixed(2)}
                      </strong>
                    </div>

                    {/* Quantity */}

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(medicine._id)}
                      >
                        −
                      </button>

                      <span>{medicine.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(medicine._id)}
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}

                    <div className="cart-item-total">
                      ₹{itemTotal.toFixed(2)}
                    </div>

                    {/* Remove */}

                    <button
                      type="button"
                      className="remove-cart-item"
                      onClick={() => removeFromCart(medicine._id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            {/* =========================
                ORDER SUMMARY
            ========================= */}

            <div className="cart-summary">
              <h2>Order Summary</h2>

              {/* Subtotal */}

              <div className="summary-row">
                <span>Subtotal</span>

                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>

              {/* Delivery */}

              <div className="summary-row">
                <span>Delivery</span>

                <strong>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </strong>
              </div>

              {/* Free Delivery Message */}

              {deliveryCharge > 0 && (
                <div className="free-delivery-note">
                  Add ₹{(500 - cartTotal).toFixed(2)} more for FREE delivery
                </div>
              )}

              <div className="summary-divider" />

              {/* Final Total */}

              <div className="summary-total">
                <span>Total</span>

                <strong>₹{finalTotal.toFixed(2)}</strong>
              </div>

              {/* Checkout */}

              <Link to="/checkout" className="checkout-button">
                Proceed to Checkout
              </Link>

              <div className="secure-checkout">🔒 Secure & Safe Checkout</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
