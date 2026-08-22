const express = require("express");

const router = express.Router();

// Register Test
router.post("/register", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Register route is working 🚀",
    body: req.body,
  });
});

// Auth Test
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth route is working 🚀",
  });
});

module.exports = router;
