import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
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

    console.log("Registration Data:", formData);

    // Backend API next step mein connect karenge
    navigate("/login");
  };

  return (
    <div className="register-page">
      {/* ================= NAVBAR ================= */}

      <header className="register-navbar">
        <div className="register-nav-container">
          <Link to="/" className="register-logo">
            Medi<span>Deliver</span>
          </Link>

          <div className="register-secure">🔒 Secure Registration</div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="register-main">
        <div className="register-wrapper">
          {/* LEFT SIDE */}

          <div className="register-info">
            <div className="register-medical-icon">✚</div>

            <span className="register-label">MEDIDELIVER</span>

            <h1>
              Your healthcare,
              <br />
              <span>delivered with care.</span>
            </h1>

            <p>
              Create your MediDeliver account and get genuine medicines
              delivered safely to your doorstep.
            </p>

            <div className="register-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">✓</div>
                <div>
                  <strong>Genuine Medicines</strong>
                  <small>Quality healthcare products</small>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">🚚</div>
                <div>
                  <strong>Fast Delivery</strong>
                  <small>Delivered to your doorstep</small>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">🔒</div>
                <div>
                  <strong>Secure Account</strong>
                  <small>Your information stays protected</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="register-card">
            <div className="register-card-heading">
              <h2>Create your account</h2>

              <p>Join MediDeliver to start ordering medicines.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* NAME */}

              <div className="register-form-group">
                <label>Full Name</label>

                <div className="register-input">
                  <span>👤</span>

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
                  <span>📧</span>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PHONE */}

              <div className="register-form-group">
                <label>Mobile Number</label>

                <div className="register-input">
                  <span>📱</span>

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
                  <span>🔒</span>

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
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="register-form-group">
                <label>Confirm Password</label>

                <div className="register-input">
                  <span>🔐</span>

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
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* ERROR */}

              {error && <div className="register-error">⚠️ {error}</div>}

              {/* BUTTON */}

              <button type="submit" className="register-submit">
                Create Account
                <span>→</span>
              </button>
            </form>

            {/* LOGIN */}

            <div className="register-login">
              Already have an account?
              <Link to="/login"> Login</Link>
            </div>

            <div className="register-security">
              🔒 Your personal information is secure
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="register-footer">
        © 2026 MediDeliver. All rights reserved.
      </footer>
    </div>
  );
};

export default Register;
