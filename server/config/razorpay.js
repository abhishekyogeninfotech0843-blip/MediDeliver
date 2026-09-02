const Razorpay = require("razorpay");

let razorpay = null;

try {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";
  razorpay = new Razorpay({ key_id, key_secret });
} catch (err) {
  console.warn("⚠️ Razorpay Config Warning:", err.message);
}

module.exports = razorpay;
