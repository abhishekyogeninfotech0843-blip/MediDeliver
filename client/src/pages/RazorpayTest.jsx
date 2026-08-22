import React from "react";
import RazorpayPayment from "../components/RazorpayPayment";

const RazorpayTest = () => {
  const orderId = "6a8569cda35113391007d0ce";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1>MediDeliver</h1>

        <h2>Test Payment</h2>

        <p>Order ID:</p>

        <p>{orderId}</p>

        <p>Amount: ₹15</p>

        <RazorpayPayment orderId={orderId} />
      </div>
    </div>
  );
};

export default RazorpayTest;
