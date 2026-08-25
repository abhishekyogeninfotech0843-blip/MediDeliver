import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  Pill,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Truck,
  AlertCircle
} from "lucide-react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Required fields
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    // Email validation
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      } else {
        setError(response.data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials or server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* NAVBAR */}
      <header className="login-navbar">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Pill className="nav-pill-icon" />
          </div>
          Medi<span>Deliver</span>
        </div>

        <Link to="/register" className="back-home">
          <ArrowRight className="back-icon" />
          <span>Create Account</span>
        </Link>
      </header>

      {/* MAIN */}
      <main className="login-main">
        <div className="login-container">
          {/* LEFT SIDE */}
          <div className="login-info">
            <div className="medical-symbol-box">
              <Pill className="symbol-pill" />
            </div>

            <span className="login-label">MEDIDELIVER AUTH</span>

            <h1>
              Your healthcare,
              <br />
              <span className="gradient-text">just a login away.</span>
            </h1>

            <p>
              Log in to your MediDeliver account to track orders, upload prescriptions, and manage your health essentials seamlessly.
            </p>

            <div className="login-benefits">
              <div className="login-benefit">
                <div className="benefit-icon-box">
                  <Pill className="b-icon-svg" />
                </div>
                <div>
                  <strong>Easy Medicine Ordering</strong>
                  <small>Order authentic medicines anytime with 1-click checkout.</small>
                </div>
              </div>

              <div className="login-benefit">
                <div className="benefit-icon-box">
                  <Truck className="b-icon-svg" />
                </div>
                <div>
                  <strong>Real-Time Delivery Tracking</strong>
                  <small>Stay updated as your order travels to your doorstep.</small>
                </div>
              </div>

              <div className="login-benefit">
                <div className="benefit-icon-box">
                  <ShieldCheck className="b-icon-svg" />
                </div>
                <div>
                  <strong>Secure & Private</strong>
                  <small>Your prescription data is protected with 256-bit SSL encryption.</small>
                </div>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="login-card">
            <div className="login-card-header">
              <h2>Welcome Back 👋</h2>
              <p>Sign in to your MediDeliver account</p>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle className="err-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon-svg" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="login-form-group">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <Lock className="input-icon-svg" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="eye-svg" />
                    ) : (
                      <Eye className="eye-svg" />
                    )}
                  </button>
                </div>
              </div>

              <div className="remember-row">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                <span>{loading ? "Signing in..." : "Login to Account"}</span>
                <ArrowRight className="btn-icon" />
              </button>
            </form>

            <div className="login-divider">
              <span>OR</span>
            </div>

            <div className="create-account">
              <p>Don't have an account?</p>
              <Link to="/register">Create New Account</Link>
            </div>

            <div className="login-security">
              <ShieldCheck className="sec-icon-sm" />
              <span>Encrypted connection for your protection</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="login-footer">
        © 2026 MediDeliver. All rights reserved. Safe & Secure Healthcare.
      </footer>
    </div>
  );
};

export default Login;
