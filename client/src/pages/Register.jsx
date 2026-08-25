import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  AlertCircle
} from "lucide-react";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.phone.length !== 10) {
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
      });

      if (response.data.success) {
        alert("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.message || "Registration failed. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* NAVBAR */}
      <header className="register-navbar">
        <div className="register-nav-container">
          <Link to="/login" className="register-logo">
            <div className="register-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

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
                  <strong>Secure Account</strong>
                  <small>Your personal and prescription data remains safe</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="register-card">
            <div className="register-card-heading">
              <h2>Create your account</h2>
              <p>Join MediDeliver to start ordering medicines</p>
            </div>

            {error && (
              <div className="register-error">
                <AlertCircle className="err-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* NAME */}
              <div className="register-form-group">
                <label>Full Name</label>
                <div className="register-input">
                  <User className="input-icon-svg" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="register-form-group">
                <label>Email Address</label>
                <div className="register-input">
                  <Mail className="input-icon-svg" />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="register-form-group">
                <label>Mobile Number</label>
                <div className="register-input">
                  <Phone className="input-icon-svg" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10 digit mobile number"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="register-form-group">
                <label>Password</label>
                <div className="register-input">
                  <Lock className="input-icon-svg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create password"
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
                <label>Confirm Password</label>
                <div className="register-input">
                  <Lock className="input-icon-svg" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
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
              <button type="submit" className="register-submit" disabled={loading}>
                <span>{loading ? "Creating Account..." : "Create Account"}</span>
                <ArrowRight className="btn-icon" />
              </button>
            </form>

            <div className="register-login">
              <span>Already have an account?</span>
              <Link to="/login"> Login</Link>
            </div>

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
