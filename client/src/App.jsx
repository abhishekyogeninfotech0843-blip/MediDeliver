import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Pill } from "lucide-react";

import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";

// =========================
// Pages
// =========================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Medicines from "./pages/medicines";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Dashboard from "./pages/dashboard/Dashboard";
import Suppliers from "./pages/Suppliers";
import Returns from "./pages/Returns";
import MyOrders from "./pages/MyOrders";
import MyInvoices from "./pages/MyInvoices";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// =========================
// Razorpay Test
// =========================

import RazorpayTest from "./pages/RazorpayTest";

// =========================
// APP
// =========================

const RouteLoadingScreen = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!isLoading) return null;

  return (
    <div className="global-route-loader" role="status" aria-live="polite">
      <div className="global-route-loader-card">
        <div className="global-route-loader-icon">
          <Pill />
        </div>
        <strong>Loading MediDeliver</strong>
        <span>Preparing your healthcare experience...</span>
        <div className="global-route-loader-track">
          <div className="global-route-loader-progress" />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <RouteLoadingScreen />
        <Routes>
          {/* AUTH / PUBLIC ROUTES */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* INFORMATIONAL / SUPPORT ROUTES */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicines"
            element={
              <ProtectedRoute>
                <Medicines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-invoices"
            element={
              <ProtectedRoute>
                <MyInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <MyInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <AdminRoute>
                <Suppliers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              <AdminRoute>
                <Suppliers />
              </AdminRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <ProtectedRoute>
                <Returns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/razorpay-test"
            element={
              <ProtectedRoute>
                <RazorpayTest />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
