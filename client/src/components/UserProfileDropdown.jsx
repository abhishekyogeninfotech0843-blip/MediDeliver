import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Mail,
  RotateCcw,
  Package,
  UserCheck,
  ShoppingCart
} from "lucide-react";
import "./UserProfileDropdown.css";

const UserProfileDropdown = ({ user, onLogout, onOpenLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (!user) {
    return (
      <Link to="/login" className="login-nav-link-btn">
        <User className="nav-icon-sm" />
        <span>Login / Register</span>
      </Link>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAdmin = user?.role === "admin" || user?.email?.toLowerCase().includes("admin");

  return (
    <div className="user-profile-dropdown-container" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        className={`profile-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="avatar-circle">
          <span>{getInitials(user.name)}</span>
        </div>
        <span className="profile-user-name">{user.name || "User"}</span>
        <ChevronDown className={`chevron-icon ${isOpen ? "rotate" : ""}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="profile-dropdown-menu">
          {/* USER INFO HEADER */}
          <div className="dropdown-user-header">
            <div className="lg-avatar-circle">
              <span>{getInitials(user.name)}</span>
            </div>
            <div className="header-user-info">
              <h4>{user.name || "MediDeliver User"}</h4>
              <p className="user-email-text">
                <Mail className="mini-icon" />
                {user.email || "user@medideliver.com"}
              </p>
              <span className="verified-badge">
                <ShieldCheck className="mini-shield" /> {isAdmin ? "Admin Account" : "Verified Account"}
              </span>
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* MENU ITEMS */}
          <div className="dropdown-menu-list">
            {isAdmin && (
              <Link
                to="/dashboard"
                className="dropdown-item"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="item-icon text-teal" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              to="/my-orders"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <Package className="item-icon text-blue" />
              <span>My Orders</span>
            </Link>

            <Link
              to="/profile"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <UserCheck className="item-icon text-purple" />
              <span>My Profile</span>
            </Link>

            <Link
              to="/cart"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="item-icon text-blue" />
              <span>My Cart</span>
            </Link>

            <Link
              to="/returns"
              className="dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <RotateCcw className="item-icon text-green" />
              <span>Return Medicine</span>
            </Link>

            {onOpenLocation && (
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setIsOpen(false);
                  onOpenLocation();
                }}
              >
                <MapPin className="item-icon text-green" />
                <span>Delivery Address</span>
              </button>
            )}
          </div>

          <div className="dropdown-divider" />

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            className="dropdown-item logout-item"
            onClick={handleLogoutClick}
          >
            <LogOut className="item-icon text-red" />
            <span>Logout of Account</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
