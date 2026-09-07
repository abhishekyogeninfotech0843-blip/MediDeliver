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
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  KeyRound,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role: 'user' | 'admin'
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "user";
  const [role, setRole] = useState(initialRole);

  // Steps: 1 (Email), 2 (OTP & New Password), 3 (Success)
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");

  // OTP info received from server
  const [serverOtp, setServerOtp] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [accountName, setAccountName] = useState("");
  const [copiedOtp, setCopiedOtp] = useState(false);

  // UI helpers
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [redirectCountdown, setRedirectCountdown] = useState(4);

  // Live Digital Watch
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

  // Resend OTP countdown
  useEffect(() => {
    let interval;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Success screen auto redirect countdown
  useEffect(() => {
    let interval;
    if (step === 3 && redirectCountdown > 0) {
      interval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 3 && redirectCountdown === 0) {
      navigate(`/login?role=${role}`);
    }
    return () => clearInterval(interval);
  }, [step, redirectCountdown, navigate, role]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError("");
    setSuccessMsg("");
  };

  // STEP 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password/request-otp", {
        email: email.trim(),
        role,
      });

      if (res.data.success) {
        setServerOtp(res.data.otp || "");
        setMaskedPhone(res.data.maskedPhone || "");
        setAccountName(res.data.name || "");
        setSuccessMsg(res.data.message || "Verification code generated!");
        setStep(2);
        setResendTimer(30);
      } else {
        setError(res.data.message || "Unable to send verification code.");
      }
    } catch (err) {
      console.error("Request OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to request verification code. Please check your email or server status."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp && !(role === "admin" && adminSecretKey.trim())) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        adminSecretKey: role === "admin" ? adminSecretKey.trim() : undefined,
        role,
      });

      if (res.data.success) {
        setStep(3);
      } else {
        setError(res.data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset Password error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please check the verification code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDemoOtp = () => {
    if (serverOtp) {
      setOtp(serverOtp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: "", color: "#cbd5e1" };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 2) return { score: 33, label: "Weak", color: "#ef4444" };
    if (score <= 3) return { score: 66, label: "Medium", color: "#f59e0b" };
    return { score: 100, label: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="forgot-page">
      {/* NAVBAR */}
      <header className="forgot-navbar">
        <div className="forgot-brand-col">
          <Link to="/" className="forgot-logo">
            <div className="forgot-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

          {/* LIVE DIGITAL CLOCK */}
          <div className="forgot-live-clock">
            <span className="live-pulse-dot" />
            <Clock className="clock-icon-svg" />
            <span className="clock-date">{formatDate(currentDateTime)}</span>
            <span className="clock-sep">,</span>
            <span className="clock-day">{formatDay(currentDateTime)}</span>
            <span className="clock-sep">,</span>
            <span className="clock-time">{formatTime(currentDateTime)}</span>
          </div>
        </div>

        <Link to={`/login?role=${role}`} className="back-login-link">
          <ArrowLeft className="back-icon" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* MAIN */}
      <main className="forgot-main">
        <div className="forgot-container">
          {/* LEFT SIDE INFO */}
          <div className="forgot-info">
            <div className="medical-symbol-box">
              <KeyRound className="symbol-pill" />
            </div>

            <span className="forgot-label">ACCOUNT SECURITY & RECOVERY</span>

            <h1>
              Forgot your password? <br />
              <span className="gradient-text">We've got you covered.</span>
            </h1>

            <p>
              Verify your registered identity quickly to reset your password and safely regain access to your healthcare dashboard.
            </p>

            <div className="forgot-benefits">
              <div className="forgot-benefit">
                <div className="benefit-icon-box">
                  <ShieldCheck className="b-icon-svg" />
                </div>
                <div>
                  <strong>Instant 6-Digit Verification</strong>
                  <small>Secure OTP generated immediately for authorized account recovery.</small>
                </div>
              </div>

              <div className="forgot-benefit">
                <div className="benefit-icon-box">
                  <Lock className="b-icon-svg" />
                </div>
                <div>
                  <strong>256-Bit Encrypted Reset</strong>
                  <small>Protected credential update ensuring full privacy and account safety.</small>
                </div>
              </div>

              <div className="forgot-benefit">
                <div className="benefit-icon-box">
                  <Truck className="b-icon-svg" />
                </div>
                <div>
                  <strong>Instant Access Restored</strong>
                  <small>Return to tracking your orders, prescriptions, and refills seamlessly.</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM CARD */}
          <div className="forgot-card">
            {/* ROLE TAB SWITCHER */}
            {step !== 3 && (
              <div className="forgot-role-tabs">
                <button
                  type="button"
                  className={`role-tab-btn ${role === "user" ? "active" : ""}`}
                  onClick={() => handleRoleChange("user")}
                >
                  <User className="tab-ic" /> Customer Account
                </button>
                <button
                  type="button"
                  className={`role-tab-btn ${role === "admin" ? "active" : ""}`}
                  onClick={() => handleRoleChange("admin")}
                >
                  <ShieldCheck className="tab-ic" /> Pharmacy Admin
                </button>
              </div>
            )}

            {/* STEP PROGRESS INDICATOR */}
            {step !== 3 && (
              <div className="step-indicator-bar">
                <div className={`step-item ${step >= 1 ? "active" : ""}`}>
                  <span className="step-num">1</span>
                  <span className="step-txt">Identify</span>
                </div>
                <div className="step-line" />
                <div className={`step-item ${step >= 2 ? "active" : ""}`}>
                  <span className="step-num">2</span>
                  <span className="step-txt">New Password</span>
                </div>
                <div className="step-line" />
                <div className={`step-item ${step >= 3 ? "active" : ""}`}>
                  <span className="step-num">3</span>
                  <span className="step-txt">Complete</span>
                </div>
              </div>
            )}

            {/* ERROR ALERT */}
            {error && (
              <div className="forgot-error">
                <AlertCircle className="err-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 1: ENTER EMAIL */}
            {/* ============================================================ */}
            {step === 1 && (
              <div className="forgot-step-content">
                <div className="forgot-card-header">
                  <h2>
                    {role === "admin"
                      ? "Admin Password Recovery 🛡️"
                      : "Reset Customer Password 🔐"}
                  </h2>
                  <p>
                    {role === "admin"
                      ? "Enter your registered administrator email to receive a recovery code"
                      : "Enter your registered email address to receive your 6-digit verification code"}
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="forgot-form">
                  <div className="forgot-form-group">
                    <label htmlFor="email">
                      {role === "admin"
                        ? "Administrator Email Address"
                        : "Registered Email Address"}
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder={
                          role === "admin"
                            ? "admin@medideliver.com"
                            : "customer@gmail.com"
                        }
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        autoFocus
                      />
                      <Mail className="input-field-icon" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`forgot-submit-btn ${
                      role === "admin" ? "admin-submit" : ""
                    }`}
                    disabled={loading}
                  >
                    <span>
                      {loading
                        ? "Checking Account & Sending Code..."
                        : "Send Verification Code ➔"}
                    </span>
                    <ArrowRight className="btn-icon" />
                  </button>
                </form>

                <div className="forgot-back-row">
                  <span>Remember your password?</span>
                  <Link to={`/login?role=${role}`} className="signin-link">
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
            {/* ============================================================ */}
            {step === 2 && (
              <div className="forgot-step-content">
                <div className="forgot-card-header">
                  <h2>Create New Password 🔒</h2>
                  <p>
                    Account: <strong>{email}</strong>
                    {accountName ? ` (${accountName})` : ""}
                  </p>
                </div>

                {/* DEMO OTP BANNER */}
                {serverOtp && (
                  <div className="demo-otp-banner">
                    <div className="demo-otp-header">
                      <CheckCircle2 className="demo-check-ic" />
                      <div>
                        <strong>Verification Code Generated</strong>
                        <p>Use the 6-digit code below to set your new password:</p>
                      </div>
                    </div>

                    <div className="demo-otp-box">
                      <span className="demo-otp-value">{serverOtp}</span>
                      <button
                        type="button"
                        className="demo-autofill-btn"
                        onClick={handleCopyDemoOtp}
                        title="Auto-fill this OTP into the input field"
                      >
                        {copiedOtp ? (
                          <>
                            <Check className="copy-ic" /> Applied!
                          </>
                        ) : (
                          <>
                            <Copy className="copy-ic" /> Auto-Fill Code
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="forgot-form">
                  {/* OTP INPUT */}
                  <div className="forgot-form-group">
                    <div className="label-with-action">
                      <label htmlFor="otp">6-Digit Verification Code *</label>
                      <button
                        type="button"
                        className="resend-link-btn"
                        onClick={() => handleRequestOtp()}
                        disabled={loading || resendTimer > 0}
                      >
                        <RotateCcw className="resend-ic" />
                        {resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : "Resend Code"}
                      </button>
                    </div>
                    <div className="input-wrapper otp-wrapper">
                      <input
                        id="otp"
                        type="text"
                        maxLength="6"
                        required
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          setError("");
                        }}
                        className="otp-styled-input"
                        autoFocus
                      />
                    </div>
                    {maskedPhone && (
                      <small className="otp-hint-text">
                        📱 Associated mobile number: {maskedPhone}
                      </small>
                    )}
                  </div>

                  {/* NEW PASSWORD */}
                  <div className="forgot-form-group">
                    <label htmlFor="newPassword">New Password *</label>
                    <div className="input-wrapper">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Enter at least 6 characters"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError("");
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="eye-svg" />
                        ) : (
                          <Eye className="eye-svg" />
                        )}
                      </button>
                    </div>

                    {/* PASSWORD STRENGTH BAR */}
                    {newPassword && (
                      <div className="pwd-strength-container">
                        <div className="pwd-strength-bar">
                          <div
                            className="pwd-strength-fill"
                            style={{
                              width: `${strength.score}%`,
                              backgroundColor: strength.color,
                            }}
                          />
                        </div>
                        <span
                          className="pwd-strength-label"
                          style={{ color: strength.color }}
                        >
                          Strength: {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM NEW PASSWORD */}
                  <div className="forgot-form-group">
                    <label htmlFor="confirmPassword">Confirm New Password *</label>
                    <div className="input-wrapper">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="eye-svg" />
                        ) : (
                          <Eye className="eye-svg" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ADMIN SECRET PASSKEY (ADMIN ONLY OPTIONAL BYPASS) */}
                  {role === "admin" && (
                    <div className="forgot-form-group admin-secret-box">
                      <div className="label-with-action">
                        <label htmlFor="adminSecretKey">
                          Admin Master Secret Passkey (Optional)
                        </label>
                        <span className="secret-tag">🔒 Master Override</span>
                      </div>
                      <div className="input-wrapper">
                        <input
                          id="adminSecretKey"
                          type={showAdminSecret ? "text" : "password"}
                          placeholder="MediDeliver@Admin2026"
                          value={adminSecretKey}
                          onChange={(e) => setAdminSecretKey(e.target.value)}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowAdminSecret(!showAdminSecret)}
                        >
                          {showAdminSecret ? (
                            <EyeOff className="eye-svg" />
                          ) : (
                            <Eye className="eye-svg" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`forgot-submit-btn ${
                      role === "admin" ? "admin-submit" : ""
                    }`}
                    disabled={loading}
                  >
                    <span>
                      {loading
                        ? "Updating Password..."
                        : "Reset Password & Login ➔"}
                    </span>
                    <ArrowRight className="btn-icon" />
                  </button>
                </form>

                <div className="forgot-actions-row">
                  <button
                    type="button"
                    className="step-back-btn"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                  >
                    ← Change Email Address
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: SUCCESS STATE */}
            {/* ============================================================ */}
            {step === 3 && (
              <div className="forgot-step-content success-content">
                <div className="success-icon-ring">
                  <CheckCircle2 className="success-check-lg" />
                </div>

                <h2>Password Reset Successful! 🎉</h2>
                <p>
                  Your account password for <strong>{email}</strong> has been safely updated. You can now use your new password to sign in.
                </p>

                <div className="success-countdown-box">
                  <span>Redirecting to Sign In in {redirectCountdown}s...</span>
                </div>

                <Link
                  to={`/login?role=${role}`}
                  className={`forgot-submit-btn success-proceed-btn ${
                    role === "admin" ? "admin-submit" : ""
                  }`}
                >
                  <span>Proceed to Sign In Now ➔</span>
                  <ArrowRight className="btn-icon" />
                </Link>
              </div>
            )}

            <div className="forgot-card-footer">
              <ShieldCheck className="sec-icon-sm" />
              <span>Encrypted 256-bit SSL connection for your security</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="forgot-footer">
        © 2026 MediDeliver. All rights reserved. Safe & Secure Healthcare.
      </footer>
    </div>
  );
};

export default ForgotPassword;
