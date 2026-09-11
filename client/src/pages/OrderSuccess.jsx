import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  PackageCheck,
  CreditCard,
  Hash,
  ArrowRight,
  Pill,
  ShoppingBag
} from "lucide-react";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const location = useLocation();

  const payment = location.state?.payment;
  const order = payment?.order;

  return (
    <div className="order-success-page">
      <div className="success-card">
        <div className="success-icon-box">
          <CheckCircle2 className="check-main-svg" />
        </div>

        <span className="success-badge">ORDER CONFIRMED</span>

        <h1>Payment Successful! 🎉</h1>
        <p className="success-subtitle">
          Thank you for choosing MediDeliver. Your medicine order has been placed and is being prepared by our pharmacy team.
        </p>

        {order && (
          <div className="receipt-details">
            <div className="receipt-header">
              <PackageCheck className="receipt-icon" />
              <span>Order Summary & Receipt</span>
            </div>

            <div className="receipt-grid">
              <div className="receipt-item">
                <small>Order ID</small>
                <strong>{order._id}</strong>
              </div>

              <div className="receipt-item">
                <small>Amount Paid</small>
                <strong className="amount-text">₹{payment.amount}</strong>
              </div>

              <div className="receipt-item">
                <small>Payment Method</small>
                <strong>{payment.paymentMethod}</strong>
              </div>

              <div className="receipt-item">
                <small>Payment Status</small>
                <span className="status-badge-paid">
                  {payment.paymentStatus}
                </span>
              </div>

              {payment.transactionId && (
                <div className="receipt-item full-width">
                  <small>Transaction ID</small>
                  <code>{payment.transactionId}</code>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="success-actions" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/my-orders" className="continue-btn" style={{ background: "#059669" }}>
            <PackageCheck className="btn-icon" />
            <span>Track Order & Live Status</span>
            <ArrowRight className="btn-icon" />
          </Link>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Link to="/medicines" className="continue-btn" style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", color: "#334155", boxShadow: "none" }}>
              <Pill className="btn-icon" />
              <span>Browse Medicines</span>
            </Link>

            <Link to="/" className="continue-btn" style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", color: "#334155", boxShadow: "none" }}>
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
