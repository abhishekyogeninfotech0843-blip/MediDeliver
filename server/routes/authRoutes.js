const express = require("express");
const {
  registerUser,
  loginUser,
  requestPasswordResetOtp,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

// Forgot Password - Request OTP Route
router.post("/forgot-password/request-otp", requestPasswordResetOtp);

// Forgot Password - Reset Password Route
router.post("/forgot-password/reset-password", resetPassword);

// Auth Test Route
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth route is working 🚀",
  });
});

module.exports = router;
