import React from "react";
import { Link, useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();

  const payment = location.state?.payment;
  const order = payment?.order;

  return (
    <div>
      <h1>🎉 Payment Successful!</h1>

      <p>Your medicine order has been placed successfully.</p>

      {order && (
        <div>
          <h2>Order Details</h2>

          <p>
            <strong>Order ID:</strong> {order._id}
          </p>

          <p>
            <strong>Amount:</strong> ₹{payment.amount}
          </p>

          <p>
            <strong>Payment Method:</strong> {payment.paymentMethod}
          </p>

          <p>
            <strong>Payment Status:</strong> {payment.paymentStatus}
          </p>

          <p>
            <strong>Transaction ID:</strong> {payment.transactionId}
          </p>
        </div>
      )}

      <br />

      <Link to="/medicines">Continue Shopping</Link>
    </div>
  );
};

export default OrderSuccess;
