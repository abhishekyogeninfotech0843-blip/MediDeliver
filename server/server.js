const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");

// ==========================================
// Routes Import
// ==========================================

const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const returnRoutes = require("./routes/returnRoutes");

const app = express();

// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log("🔥 REQUEST:", req.method, req.originalUrl);
  next();
});

// ==========================================
// Routes
// ==========================================

// Auth Routes
app.use("/api/auth", authRoutes);

// Auth Test Route
app.get("/api/auth/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API route is working 🚀",
  });
});

// Medicine Routes
app.use("/api/medicines", medicineRoutes);

// Customer Routes
app.use("/api/customers", customerRoutes);

// Order Routes
app.use("/api/orders", orderRoutes);

// Payment Routes
app.use("/api/payments", paymentRoutes);

// Delivery Routes
app.use("/api/deliveries", deliveryRoutes);

// Notification Routes
app.use("/api/notifications", notificationRoutes);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

// Return Policy Routes
app.use("/api/returns", returnRoutes);

// ==========================================
// Root Route
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediDeliver API is running 🚀",
  });
});

// ==========================================
// 404 Route
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ==========================================
// Error Handler
// ==========================================

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// ==========================================
// Database Connection
// ==========================================

connectDB();

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 MediDeliver Server running on port ${PORT}`);
});
