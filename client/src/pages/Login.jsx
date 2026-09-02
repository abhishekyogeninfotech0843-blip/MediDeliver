import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import {
  Pill,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Truck,
  AlertCircle,
  User,
  UserCheck,
  Clock
} from "lucide-react";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role state: 'user' | 'admin'
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "user";
  const [loginRole, setLoginRole] = useState(initialRole);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Live Digital Watch (Date, Day & Time)
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDay = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "admin") {
      setLoginRole("admin");
    } else if (roleParam === "user") {
      setLoginRole("user");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleRoleChange = (selectedRole) => {
    setLoginRole(selectedRole);
    setError("");
    setFormData({
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role: loginRole,
      });

      if (response.data.success) {
        const user = response.data.user;
        const isUserAdmin =
          user?.role === "admin" ||
          user?.email?.toLowerCase().includes("admin");

        // Strict role validation
        if (loginRole === "user" && isUserAdmin) {
          setError("Admin accounts cannot log in through Customer Login. Please switch to the Admin Portal tab.");
          return;
        }

        if (loginRole === "admin" && !isUserAdmin) {
          setError("Access Denied: Only administrators can log in through the Admin Portal. Please switch to Customer Login.");
          return;
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (isUserAdmin) {
          alert("✅ Welcome Admin! Opening Admin Dashboard...");
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(response.data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (!err.response) {
        setError("Unable to connect to backend server. Please make sure the backend server (port 5001) is running.");
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* NAVBAR */}
      <header className="login-navbar">
        <div className="login-brand-col">
          <div className="login-logo">
            <div className="login-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </div>

          {/* LIVE DIGITAL WATCH UNDER MEDIDELIVER */}
          <div className="login-live-clock">
            <span className="live-pulse-dot" />
            <Clock className="clock-icon-svg" />
            <span className="clock-date">{formatDate(currentDateTime)}</span>
            <span className="clock-sep">,</span>
            <span className="clock-day">{formatDay(currentDateTime)}</span>
            <span className="clock-sep">,</span>
            <span className="clock-time">{formatTime(currentDateTime)}</span>
          </div>
        </div>

        <Link to={`/register?role=${loginRole}`} className="back-home">
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
              Your healthcare, <br />
              <span className="gradient-text">just a login away.</span>
            </h1>

            <p>
              Log in to your MediDeliver account to track orders, upload prescriptions, and manage health essentials seamlessly.
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
                  <strong>Secure & Private Portal</strong>
                  <small>Protected with 256-bit SSL encryption & role-based access control.</small>
                </div>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="login-card">
            {/* ROLE TAB SWITCHER */}
            <div className="login-role-tabs">
              <button
                type="button"
                className={`role-tab-btn ${loginRole === "user" ? "active" : ""}`}
                onClick={() => handleRoleChange("user")}
              >
                <User className="tab-ic" /> Customer Login
              </button>
              <button
                type="button"
                className={`role-tab-btn ${loginRole === "admin" ? "active" : ""}`}
                onClick={() => handleRoleChange("admin")}
              >
                <ShieldCheck className="tab-ic" /> Admin Portal
              </button>
            </div>

            <div className="login-card-header">
              <h2>
                {loginRole === "admin" ? "Admin Portal Access 🛡️" : "Customer Sign In 🛒"}
              </h2>
              <p>
                {loginRole === "admin"
                  ? "Sign in with Admin credentials to manage pharmacy"
                  : "Sign in to your MediDeliver customer account"}
              </p>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle className="err-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* EMAIL */}
              <div className="login-form-group">
                <label htmlFor="email">
                  {loginRole === "admin" ? "Admin Email Address" : "Customer Email Address"}
                </label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder={
                      loginRole === "admin"
                        ? "admin@medideliver.com"
                        : "customer@gmail.com"
                    }
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="login-form-group">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="eye-svg" /> : <Eye className="eye-svg" />}
                  </button>
                </div>
              </div>

              <div className="remember-row">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button
                type="submit"
                className={`login-submit ${loginRole === "admin" ? "admin-submit" : ""}`}
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Authenticating..."
                    : loginRole === "admin"
                    ? "Verify & Open Admin Dashboard ➔"
                    : "Login to Account ➔"}
                </span>
                <ArrowRight className="btn-icon" />
              </button>
            </form>

            <div className="login-divider">
              <span>OR</span>
            </div>

            <div className="create-account">
              <p>
                {loginRole === "admin"
                  ? "Need a new Admin Account?"
                  : "Don't have a Customer Account?"}
              </p>
              <Link to={`/register?role=${loginRole}`}>
                {loginRole === "admin" ? "Register as Pharmacy Admin" : "Create New Customer Account"}
              </Link>
            </div>

            <div className="login-security">
              <ShieldCheck className="sec-icon-sm" />
              <span>Encrypted 256-bit SSL connection for your protection</span>
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
