import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";

// =========================
// Pages
// =========================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Medicines from "./pages/Medicines";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

// =========================
// Razorpay Test
// =========================

import RazorpayTest from "./pages/RazorpayTest";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* =========================
              HOME
          ========================= */}

          <Route path="/" element={<Home />} />

          {/* =========================
              AUTH
          ========================= */}

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* =========================
              MEDICINES
          ========================= */}

          <Route path="/medicines" element={<Medicines />} />

          {/* =========================
              CART
          ========================= */}

          <Route path="/cart" element={<Cart />} />

          {/* =========================
              CHECKOUT
          ========================= */}

          <Route path="/checkout" element={<Checkout />} />

          {/* =========================
              ORDER SUCCESS
          ========================= */}

          <Route path="/order-success" element={<OrderSuccess />} />

          {/* =========================
              RAZORPAY TEST
          ========================= */}

          <Route path="/razorpay-test" element={<RazorpayTest />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
