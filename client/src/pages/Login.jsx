import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    console.log("Login Data:", formData);

    // Backend authentication next step me connect karenge
    alert("Login form is working!");

    // Successful login ke baad
    // navigate("/");
  };

  return (
    <div className="login-page">
      {/* ================= NAVBAR ================= */}

      <header className="login-navbar">
        <Link to="/" className="login-logo">
          Medi<span>Deliver</span>
        </Link>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </header>

      {/* ================= MAIN ================= */}

      <main className="login-main">
        <div className="login-container">
          {/* ================= LEFT SIDE ================= */}

          <div className="login-info">
            <div className="medical-symbol">✚</div>

            <span className="login-label">MEDIDELIVER</span>

            <h1>
              Your healthcare,
              <br />
              <span>just a login away.</span>
            </h1>

            <p>
              Login to MediDeliver and manage your medicines, orders and
              healthcare deliveries from one place.
            </p>

            <div className="login-benefits">
              <div className="login-benefit">
                <div className="benefit-icon">💊</div>

                <div>
                  <strong>Easy Medicine Ordering</strong>
                  <small>Order medicines anytime from anywhere.</small>
                </div>
              </div>

              <div className="login-benefit">
                <div className="benefit-icon">🚚</div>

                <div>
                  <strong>Track Your Orders</strong>
                  <small>Stay updated with your medicine delivery.</small>
                </div>
              </div>

              <div className="login-benefit">
                <div className="benefit-icon">🔒</div>

                <div>
                  <strong>Secure & Private</strong>
                  <small>Your account information stays protected.</small>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LOGIN CARD ================= */}

          <div className="login-card">
            <div className="login-card-header">
              <div className="mobile-login-icon">✚</div>

              <h2>Welcome Back 👋</h2>

              <p>Login to your MediDeliver account</p>
            </div>

            {/* ERROR */}

            {error && <div className="login-error">⚠️ {error}</div>}

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              {/* EMAIL */}

              <div className="login-form-group">
                <label htmlFor="email">Email Address</label>

                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="login-form-group">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>

                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>

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
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}

              <div className="remember-row">
                <label>
                  <input type="checkbox" />

                  <span>Remember me</span>
                </label>
              </div>

              {/* LOGIN BUTTON */}

              <button type="submit" className="login-submit">
                Login to Account
                <span>→</span>
              </button>
            </form>

            {/* DIVIDER */}

            <div className="login-divider">
              <span>OR</span>
            </div>

            {/* REGISTER */}

            <div className="create-account">
              <p>Don't have an account?</p>

              <Link to="/register">Create New Account</Link>
            </div>

            {/* SECURITY */}

            <div className="login-security">
              🔒 Secure & encrypted connection
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="login-footer">
        © 2026 MediDeliver. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
