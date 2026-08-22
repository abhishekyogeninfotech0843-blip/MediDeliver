import React, { useState } from "react";
import axios from "axios";

const RazorpayPayment = ({ orderId }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // ==========================================
      // Step 1: Create Razorpay Order
      // ==========================================

      const response = await axios.post(
        "http://localhost:5000/api/payments/razorpay/order",
        {
          order: orderId,
        },
      );

      const { razorpayOrder, keyId } = response.data;

      // ==========================================
      // Step 2: Razorpay Checkout Options
      // ==========================================

      const options = {
        key: keyId,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "MediDeliver",

        description: "Medicine Order Payment",

        order_id: razorpayOrder.id,

        handler: async function (paymentResponse) {
          try {
            // ==========================================
            // Step 3: Verify Payment
            // ==========================================

            const verifyResponse = await axios.post(
              "http://localhost:5000/api/payments/razorpay/verify",
              {
                order: orderId,
                razorpay_order_id: paymentResponse.razorpay_order_id,

                razorpay_payment_id: paymentResponse.razorpay_payment_id,

                razorpay_signature: paymentResponse.razorpay_signature,
              },
            );

            if (verifyResponse.data.success) {
              alert("Payment successful! 🎉");

              console.log("Payment Verified:", verifyResponse.data);
            }
          } catch (error) {
            console.error("Payment Verification Error:", error);

            alert(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },

        prefill: {
          name: "Rahul Sharma",
          email: "rahul.order@gmail.com",
          contact: "9876543211",
        },

        notes: {
          orderId: orderId,
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay Checkout closed");
          },
        },
      };

      // ==========================================
      // Step 4: Open Razorpay Checkout
      // ==========================================

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);

        alert(response.error?.description || "Payment failed");
      });

      razorpay.open();
    } catch (error) {
      console.error("Create Razorpay Order Error:", error);

      alert(error.response?.data?.message || "Unable to create Razorpay order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        background: "#2563eb",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "600",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Processing..." : "Pay with Razorpay"}
    </button>
  );
};

export default RazorpayPayment;
