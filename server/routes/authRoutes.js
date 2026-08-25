const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

// Auth Test Route
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth route is working 🚀",
  });
});

module.exports = router;
