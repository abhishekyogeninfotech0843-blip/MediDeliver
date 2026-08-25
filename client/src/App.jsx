import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// =========================
// Pages
// =========================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Medicines from "./pages/medicines";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Dashboard from "./pages/dashboard/Dashboard";
import Returns from "./pages/Returns";

// =========================
// Razorpay Test
// =========================

import RazorpayTest from "./pages/RazorpayTest";

// =========================
// AUTH CHECK
// =========================

const isLoggedIn = () => {
  return !!localStorage.getItem("user");
};

// =========================
// PROTECTED ROUTE
// =========================

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =========================
// PUBLIC ROUTE
// =========================

const PublicRoute = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// =========================
// APP
// =========================

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
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
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
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
