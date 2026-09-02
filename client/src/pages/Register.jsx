import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import {
  Pill,
  Lock,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Building2,
  Clock
} from "lucide-react";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get("role") === "admin" ? "admin" : "user";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Ensure all fields are completely blank on initial page load (prevents browser autofill)
  useEffect(() => {
    const clearTimer = setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      }));
    }, 120);
    return () => clearTimeout(clearTimer);
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "admin") {
      setFormData((prev) => ({ ...prev, role: "admin" }));
    } else if (roleParam === "user") {
      setFormData((prev) => ({ ...prev, role: "user" }));
    }
  }, [searchParams]);

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
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    // Email validation
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      if (response.data.success) {
        const isRegisteredAdmin = formData.role === "admin";
        if (isRegisteredAdmin) {
          alert("✅ Pharmacy Admin Account created successfully! Please log in as Admin.");
          navigate("/login?role=admin");
        } else {
          alert("✅ Customer Account created successfully! Please log in.");
          navigate("/login?role=user");
        }
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register Error:", err);
      if (!err.response) {
        setError("Unable to connect to backend server. Please make sure the backend server (port 5001) is running.");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* NAVBAR */}
      <header className="register-navbar">
        <div className="register-nav-container">
          <div className="register-brand-col">
            <Link to={`/login?role=${formData.role}`} className="register-logo">
              <div className="register-logo-icon">
                <Pill className="nav-pill-icon" />
              </div>
              Medi<span>Deliver</span>
            </Link>

            {/* LIVE DIGITAL WATCH UNDER MEDIDELIVER */}
            <div className="register-live-clock">
              <span className="live-pulse-dot" />
              <Clock className="clock-icon-svg" />
              <span className="clock-date">{formatDate(currentDateTime)}</span>
              <span className="clock-sep">,</span>
              <span className="clock-day">{formatDay(currentDateTime)}</span>
              <span className="clock-sep">,</span>
              <span className="clock-time">{formatTime(currentDateTime)}</span>
            </div>
          </div>

          <div className="register-secure-badge">
            <Lock className="lock-sm" /> <span>Secure Registration</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="register-main">
        <div className="register-wrapper">
          {/* LEFT SIDE */}
          <div className="register-info">
            <div className="register-medical-icon">
              <Pill className="reg-pill-svg" />
            </div>

            <span className="register-label">MEDIDELIVER ACCOUNT</span>

            <h1>
              Your healthcare,
              <br />
              <span className="gradient-text">delivered with care.</span>
            </h1>

            <p>
              Create your MediDeliver account today to enjoy fast delivery, order tracking, and exclusive discounts on medicines.
            </p>

            <div className="register-benefits">
              <div className="benefit-item">
                <div className="benefit-icon-box">
                  <CheckCircle2 className="b-icon-svg" />
                </div>
                <div>
                  <strong>Genuine Medicines</strong>
                  <small>100% authentic products sourced directly</small>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon-box">
                  <Truck className="b-icon-svg" />
                </div>
                <div>
                  <strong>Express Doorstep Delivery</strong>
                  <small>Quick & reliable delivery to your address</small>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon-box">
                  <ShieldCheck className="b-icon-svg" />
                </div>
                <div>
                  <strong>Role-Based Account Security</strong>
                  <small>Create Customer or Pharmacy Admin accounts safely</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="register-card">
            <div className="register-card-heading">
              <h2>
                {formData.role === "admin"
                  ? "Create Pharmacy Admin Account 🛡️"
                  : "Create Customer Account 🛒"}
              </h2>
              <p>Fill in your details to create your account</p>
            </div>

            {error && (
              <div className="register-error">
                <AlertCircle className="err-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Dummy hidden inputs to defeat aggressive browser autofill */}
              <input type="text" style={{ display: "none" }} tabIndex="-1" autoComplete="off" />
              <input type="password" style={{ display: "none" }} tabIndex="-1" autoComplete="off" />

              {/* ROLE SELECTION RADIO CARDS */}
              <div className="role-selection-group">
                <label className="role-group-label">Select Account Type *</label>
                <div className="role-cards-grid">
                  <label
                    className={`role-option-card ${formData.role === "user" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={formData.role === "user"}
                      onChange={handleChange}
                    />
                    <div className="role-card-inner">
                      <User className="role-ic" />
                      <div>
                        <strong>Customer / Patient</strong>
                        <small>Order & track medicines</small>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`role-option-card ${formData.role === "admin" ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={handleChange}
                    />
                    <div className="role-card-inner">
                      <ShieldCheck className="role-ic" />
                      <div>
                        <strong>Pharmacy Admin</strong>
                        <small>Manage inventory & sales</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* NAME */}
              <div className="register-form-group">
                <label>Full Name *</label>
                <div className="register-input">
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="off"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="register-form-group">
                <label>Email Address *</label>
                <div className="register-input">
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="new-password"
                    placeholder={
                      formData.role === "admin"
                        ? "admin@medideliver.com"
                        : "name@example.com"
                    }
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="register-form-group">
                <label>Mobile Number *</label>
                <div className="register-input">
                  <input
                    type="tel"
                    name="phone"
                    required
                    autoComplete="off"
                    placeholder="10 digit mobile number"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="register-form-group">
                <label>Password *</label>
                <div className="register-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder="Create password (min 6 chars)"
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

              {/* CONFIRM PASSWORD */}
              <div className="register-form-group">
                <label>Confirm Password *</label>
                <div className="register-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="eye-svg" />
                    ) : (
                      <Eye className="eye-svg" />
                    )}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className={`register-submit ${formData.role === "admin" ? "admin-submit" : ""}`}
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Creating Account..."
                    : formData.role === "admin"
                    ? "Register as Pharmacy Admin ➔"
                    : "Create Customer Account ➔"}
                </span>
                <ArrowRight className="btn-icon" />
              </button>
            </form>

            <div className="register-login">
              <span>Already have an account?</span>
              <Link to={`/login?role=${formData.role}`}> Sign In</Link>
            </div>

            {/* SECURITY */}
            <div className="register-security">
              <ShieldCheck className="sec-icon-sm" />
              <span>Your personal information is safe & encrypted</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="register-footer">
        © 2026 MediDeliver. All rights reserved.
      </footer>
    </div>
  );
};

export default Register;
