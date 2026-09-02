import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import UserProfileDropdown from "../components/UserProfileDropdown";
import {
  Pill,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  CheckCircle2,
  Package,
  Calendar,
  Building2,
  Lock,
  ArrowRight,
  LogOut
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [userOrderCount, setUserOrderCount] = useState(0);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const fetchUserOrderCount = async (currentUser) => {
    if (!currentUser) return;
    try {
      const response = await api.get("/orders").catch(() => null);
      if (response?.data?.success && Array.isArray(response.data.orders)) {
        const userEmailLower = (currentUser.email || "").toLowerCase().trim();
        const userNameLower = (currentUser.name || "").toLowerCase().trim();

        const myOrders = response.data.orders.filter((ord) => {
          const custName = (ord.customerName || ord.customer?.name || "").toLowerCase();
          const custEmail = (ord.customer?.email || "").toLowerCase();
          const delivAddr = (ord.deliveryAddress || "").toLowerCase();

          return (
            (userEmailLower && custEmail === userEmailLower) ||
            (custName && (custName.includes(userNameLower) || userNameLower.includes(custName))) ||
            (delivAddr && delivAddr.includes(userNameLower))
          );
        });

        setUserOrderCount(myOrders.length);
      }
    } catch (e) {
      setUserOrderCount(0);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let currentUser = {};
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      } catch (e) {}
    }

    const savedLoc = localStorage.getItem("deliveryLocation");
    let initialLoc = {};
    if (savedLoc) {
      try {
        initialLoc = JSON.parse(savedLoc);
      } catch (e) {}
    }

    setProfileData({
      name: currentUser.name || "Customer Account",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      address: currentUser.address || initialLoc.fullAddress || "",
      city: initialLoc.city || "Aligarh",
      state: initialLoc.state || "Uttar Pradesh",
      pincode: initialLoc.pincode || "202001",
    });

    fetchUserOrderCount(currentUser);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccessMsg("");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const updatedUser = {
        ...user,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      localStorage.setItem(
        "deliveryLocation",
        JSON.stringify({
          city: profileData.city,
          state: profileData.state,
          pincode: profileData.pincode,
          fullAddress: profileData.address,
        })
      );

      setLoading(false);
      setSuccessMsg("Profile details updated successfully! 🎉");
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 400);
  };

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
    <div className="profile-page">
      {/* NAVBAR */}
      <header className="profile-navbar">
        <div className="profile-nav-container">
          <Link to="/" className="profile-logo">
            <div className="profile-logo-icon">
              <Pill className="nav-pill-icon" />
            </div>
            Medi<span>Deliver</span>
          </Link>

          <div className="profile-nav-actions">
            <Link to="/my-orders" className="my-orders-link">
              <Package className="link-ic" /> My Orders
            </Link>
            <UserProfileDropdown user={user} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="profile-main">
        <div className="profile-container">
          {/* LEFT SIDEBAR: CARD */}
          <div className="profile-sidebar-card">
            <div className="avatar-header">
              <div className="profile-lg-avatar">
                <span>{getInitials(profileData.name)}</span>
              </div>

              <h3>{profileData.name || "MediDeliver User"}</h3>
              <p className="profile-email-badge">
                <Mail className="mini-ic" /> {profileData.email}
              </p>

              <span className={`role-pill ${isAdmin ? "admin" : "customer"}`}>
                <ShieldCheck className="mini-ic" />
                {isAdmin ? "Pharmacy Admin" : "Verified Customer"}
              </span>
            </div>

            <div className="sidebar-divider" />

            <div className="profile-stats-grid">
              <div className="stat-box">
                <strong>{userOrderCount}</strong>
                <small>Total Orders</small>
              </div>
              <div className="stat-box">
                <strong>100%</strong>
                <small>Authentic</small>
              </div>
            </div>

            <div className="sidebar-divider" />

            <div className="profile-quick-links">
              <Link to="/my-orders" className="quick-link-item">
                <Package className="q-ic" /> My Orders History
              </Link>
              <Link to="/returns" className="quick-link-item">
                <ShieldCheck className="q-ic" /> Return Claims
              </Link>
              <Link to="/cart" className="quick-link-item">
                <Pill className="q-ic" /> My Shopping Cart
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: EDIT FORM */}
          <div className="profile-content-card">
            <div className="content-card-hdr">
              <h2>My Profile & Address 👤</h2>
              <p>Manage your account info and saved delivery location</p>
            </div>

            {successMsg && (
              <div className="profile-success-alert">
                <CheckCircle2 className="alert-ic" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="profile-form">
              {/* SECTION: PERSONAL DETAILS */}
              <div className="form-section-title">
                <User className="sec-ic" /> Personal Information
              </div>

              <div className="profile-form-grid">
                <div className="p-form-group">
                  <label>Full Name *</label>
                  <div className="p-input-wrapper">
                    <User className="p-ic" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={profileData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="p-form-group">
                  <label>Email Address (Verified)</label>
                  <div className="p-input-wrapper disabled">
                    <Mail className="p-ic" />
                    <input
                      type="email"
                      name="email"
                      disabled
                      value={profileData.email}
                    />
                  </div>
                </div>

                <div className="p-form-group">
                  <label>Mobile Number *</label>
                  <div className="p-input-wrapper">
                    <Phone className="p-ic" />
                    <input
                      type="tel"
                      name="phone"
                      maxLength="10"
                      required
                      value={profileData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="p-form-group">
                  <label>Account Role</label>
                  <div className="p-input-wrapper disabled">
                    <ShieldCheck className="p-ic" />
                    <input
                      type="text"
                      disabled
                      value={isAdmin ? "Pharmacy Admin" : "Customer / Patient Account"}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: ADDRESS */}
              <div className="form-section-title">
                <MapPin className="sec-ic" /> Default Delivery Address
              </div>

              <div className="p-form-group full-width">
                <label>Complete House & Street Address *</label>
                <div className="p-input-wrapper">
                  <Building2 className="p-ic" />
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="House No, Building, Street, Area"
                    value={profileData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="profile-form-grid">
                <div className="p-form-group">
                  <label>City *</label>
                  <div className="p-input-wrapper">
                    <input
                      type="text"
                      name="city"
                      required
                      value={profileData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="p-form-group">
                  <label>State *</label>
                  <div className="p-input-wrapper">
                    <input
                      type="text"
                      name="state"
                      required
                      value={profileData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="p-form-group">
                  <label>PIN Code *</label>
                  <div className="p-input-wrapper">
                    <input
                      type="text"
                      name="pincode"
                      maxLength="6"
                      required
                      value={profileData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="save-profile-btn"
                disabled={loading}
              >
                <Save className="btn-ic" />
                <span>{loading ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="profile-footer">
        © 2026 MediDeliver. All rights reserved. Express Healthcare & Prescription Delivery.
      </footer>
    </div>
  );
};

export default Profile;
