import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Pill,
  MapPin,
  Search,
  ArrowRight,
  FileText,
  ShieldCheck,
  Truck,
  Lock,
  Heart,
  Stethoscope,
  Dumbbell,
  Sparkles,
  Baby,
  CreditCard,
  Package,
  CheckCircle2,
  Award,
  LayoutDashboard,
  LogOut,
  User,
  Building2,
  X,
  ChevronRight,
  Sparkle
} from "lucide-react";
import api from "../api/api";
import { useCart } from "../context/CartContext";
import LocationModal from "../components/LocationModal";
import UserProfileDropdown from "../components/UserProfileDropdown";
import UploadPrescriptionModal from "../components/UploadPrescriptionModal";
import { getDeliveryEstimate } from "../utils/deliveryZone";
import "./home.css";

const Home = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [user, setUser] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [medicinesList, setMedicinesList] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    const DEFAULT_ALIGARH = {
      area: "Centre Point",
      city: "Aligarh",
      district: "Aligarh",
      state: "Uttar Pradesh",
      pincode: "202001",
      lat: 27.8974,
      lng: 78.088,
    };

    const loadSavedLocation = () => {
      const savedLoc = localStorage.getItem("deliveryLocation");
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          const est = getDeliveryEstimate(parsed);
          if (est.isDeliverable) {
            setDeliveryLocation(parsed);
            return;
          }
        } catch (e) {}
      }
      setDeliveryLocation(DEFAULT_ALIGARH);
      localStorage.setItem("deliveryLocation", JSON.stringify(DEFAULT_ALIGARH));
    };

    loadSavedLocation();

    const handleLocationEvent = (e) => {
      if (e.detail) {
        setDeliveryLocation(e.detail);
      } else {
        loadSavedLocation();
      }
    };

    window.addEventListener("deliveryLocationUpdated", handleLocationEvent);
    return () => {
      window.removeEventListener("deliveryLocationUpdated", handleLocationEvent);
    };
  }, []);

  // Fetch medicines list for live search autocomplete
  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await api.get("/medicines");
        if (res.data?.success && Array.isArray(res.data.medicines)) {
          setMedicinesList(res.data.medicines);
        }
      } catch (err) {
        console.log("Could not load medicines catalog for search suggestions:", err);
      }
    };
    fetchMeds();
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setIsSearchOpen(false);
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/medicines");
    }
  };

  const handleSelectSuggestion = (medicineName) => {
    setSearchQuery(medicineName);
    setIsSearchOpen(false);
    navigate(`/medicines?search=${encodeURIComponent(medicineName)}`);
  };

  const fallbackCatalog = [
    { name: "Amoxicillin 500mg", company: "Cipla Ltd", category: "Medicines", sellingPrice: 85, stock: 60 },
    { name: "Azithromycin 500mg (Azee)", company: "Cipla Ltd", category: "Medicines", sellingPrice: 120, stock: 45 },
    { name: "Brufen 400mg Tablet", company: "Abbott India", category: "Medicines", sellingPrice: 38, stock: 90 },
    { name: "Betadine 10% Ointment", company: "Win-Medicare", category: "Personal Care", sellingPrice: 110, stock: 35 },
    { name: "Benadryl Cough Syrup (100ml)", company: "Johnson & Johnson", category: "Medicines", sellingPrice: 135, stock: 50 },
    { name: "Becosules Z Capsules", company: "Pfizer", category: "Vitamins & Supplements", sellingPrice: 52, stock: 120 },
    { name: "Baby Dove Rich Moisture Lotion", company: "Hindustan Unilever", category: "Baby Care", sellingPrice: 220, stock: 30 },
    { name: "Cetirizine 10mg (Cetzine)", company: "Dr. Reddy's", category: "Medicines", sellingPrice: 22, stock: 150 },
    { name: "Crocin 650 Advance", company: "GSK Consumer", category: "Medicines", sellingPrice: 32, stock: 140 },
    { name: "Digene Gel Acidity Relief (200ml)", company: "Abbott", category: "Medicines", sellingPrice: 165, stock: 60 },
    { name: "Dolo 650mg Paracetamol", company: "Micro Labs Ltd", category: "Medicines", sellingPrice: 30, stock: 200 },
    { name: "Dettol Antiseptic Liquid (500ml)", company: "Reckitt", category: "Personal Care", sellingPrice: 185, stock: 80 },
    { name: "Evion 400mg Vitamin E", company: "Merck", category: "Vitamins & Supplements", sellingPrice: 78, stock: 95 },
    { name: "Gelusil MPS Antacid Syrup", company: "Pfizer", category: "Medicines", sellingPrice: 140, stock: 40 },
    { name: "Himalaya Liv.52 DS Tablets", company: "Himalaya Wellness", category: "Medicines", sellingPrice: 195, stock: 75 },
    { name: "Ibuprofen & Paracetamol (Combiflam)", company: "Sanofi", category: "Medicines", sellingPrice: 48, stock: 110 },
    { name: "Limcee Vitamin C 500mg", company: "Abbott", category: "Vitamins & Supplements", sellingPrice: 25, stock: 180 },
    { name: "Metformin 500mg Glycomet", company: "USV Ltd", category: "Diabetes Care", sellingPrice: 45, stock: 85 },
    { name: "Montair-LC Tablet", company: "Cipla Ltd", category: "Medicines", sellingPrice: 198, stock: 65 },
    { name: "Neurobion Forte Tablet", company: "Procter & Gamble", category: "Vitamins & Supplements", sellingPrice: 38, stock: 130 },
    { name: "Omeprazole 20mg (Omez)", company: "Dr. Reddy's", category: "Medicines", sellingPrice: 62, stock: 90 },
    { name: "Pantoprazole 40mg (Pan 40)", company: "Alkem Laboratories", category: "Medicines", sellingPrice: 115, stock: 80 },
    { name: "Shelcal 500 Calcium Tablets", company: "Torrent Pharma", category: "Vitamins & Supplements", sellingPrice: 125, stock: 70 },
    { name: "Telmisartan 40mg (Telma)", company: "Glenmark", category: "Heart Care", sellingPrice: 145, stock: 55 },
    { name: "Volini Pain Relief Gel (50g)", company: "Sun Pharma", category: "Personal Care", sellingPrice: 155, stock: 60 },
    { name: "Zifi 200 Cefixime Tablet", company: "FDC Ltd", category: "Medicines", sellingPrice: 112, stock: 40 },
  ];

  const allAvailableMeds = medicinesList.length > 0 ? medicinesList : fallbackCatalog;
  const qClean = searchQuery.trim().toLowerCase();
  const searchSuggestions = qClean
    ? allAvailableMeds
        .filter((med) => {
          const name = (med.name || "").toLowerCase();
          const comp = (med.company || "").toLowerCase();
          const cat = (med.category || "").toLowerCase();
          return name.includes(qClean) || comp.includes(qClean) || cat.includes(qClean);
        })
        .slice(0, 7)
    : [];

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const categories = [
    { icon: <Pill className="cat-icon-svg" />, name: "Medicines" },
    { icon: <Stethoscope className="cat-icon-svg" />, name: "Diabetes Care" },
    { icon: <Dumbbell className="cat-icon-svg" />, name: "Vitamins & Supplements" },
    { icon: <Sparkles className="cat-icon-svg" />, name: "Personal Care" },
    { icon: <Baby className="cat-icon-svg" />, name: "Baby Care" },
    { icon: <Heart className="cat-icon-svg" />, name: "Heart Care" },
  ];

  const topCompanies = [
    {
      name: "Cipla Ltd",
      shortName: "Cipla",
      tagline: "Caring for Life",
      category: "Respiratory & General",
      badgeColor: "#1e40af",
      bgColor: "#eff6ff",
      count: "100+ Products",
    },
    {
      name: "Zydus Cadila",
      shortName: "Zydus",
      tagline: "Dedicated to Life",
      category: "Gastro & Care",
      badgeColor: "#047857",
      bgColor: "#ecfdf5",
      count: "80+ Products",
    },
    {
      name: "Sun Pharma",
      shortName: "Sun Pharma",
      tagline: "Reaching People, Touching Lives",
      category: "Diabetes & Chronic",
      badgeColor: "#b45309",
      bgColor: "#fffbeb",
      count: "120+ Products",
    },
    {
      name: "Dr. Reddy's",
      shortName: "Dr. Reddy's",
      tagline: "Good Health Can't Wait",
      category: "Wellness & Care",
      badgeColor: "#6d28d9",
      bgColor: "#f5f3ff",
      count: "90+ Products",
    },
    {
      name: "Lupin",
      shortName: "Lupin",
      tagline: "Predictive & Preventative",
      category: "Heart & Cardio Care",
      badgeColor: "#be123c",
      bgColor: "#fff1f2",
      count: "75+ Products",
    },
    {
      name: "Abbott",
      shortName: "Abbott",
      tagline: "Life. To The Fullest.",
      category: "Nutrition & Vitamins",
      badgeColor: "#0369a1",
      bgColor: "#f0f9ff",
      count: "65+ Products",
    },
    {
      name: "Micro Labs Ltd",
      shortName: "Micro Labs",
      tagline: "Trusted Healthcare",
      category: "Dolo & General Care",
      badgeColor: "#0d9488",
      bgColor: "#f0fdfa",
      count: "50+ Products",
    },
    {
      name: "Himalaya Wellness",
      shortName: "Himalaya",
      tagline: "Herbal Healthcare",
      category: "Ayurveda & Baby Care",
      badgeColor: "#15803d",
      bgColor: "#f0fdf4",
      count: "85+ Products",
    },
  ];

  return (
    <div className="home-page">
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left-group">
            <Link to="/" className="logo">
              <div className="logo-badge">
                <Pill className="logo-icon" />
              </div>
              Medi<span className="logo-accent">Deliver</span>
            </Link>

            <div
              className="location-pill"
              onClick={() => setIsLocationModalOpen(true)}
              title="Click to change delivery location"
            >
              <MapPin className="location-icon" />
              <div className="location-text">
                <small>Deliver to</small>
                <strong>
                  {deliveryLocation
                    ? `${deliveryLocation.area || deliveryLocation.city} ▾`
                    : "Your Location ▾"}
                </strong>
              </div>
            </div>
          </div>

          <div className="nav-search-wrapper" ref={searchRef}>
            <form className="nav-search" onSubmit={handleSearch}>
              <Search
                className="search-icon"
                style={{ cursor: "pointer" }}
                onClick={handleSearch}
              />
              <input
                type="text"
                placeholder="Search medicines, brands or health products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e);
                  } else if (e.key === "Escape") {
                    setIsSearchOpen(false);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  title="Clear search"
                >
                  <X className="clear-icon-svg" />
                </button>
              )}
            </form>

            {/* LIVE AUTOCOMPLETE DROPDOWN */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="search-dropdown-menu">
                <div className="search-dropdown-header">
                  <span className="dropdown-title">
                    <Search className="mini-search-icon" /> Results for "<strong>{searchQuery}</strong>"
                  </span>
                  <span className="results-count-pill">
                    {searchSuggestions.length} {searchSuggestions.length === 1 ? "match" : "matches"}
                  </span>
                </div>

                {searchSuggestions.length > 0 ? (
                  <div className="suggestions-list">
                    {searchSuggestions.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="suggestion-item"
                        onClick={() => handleSelectSuggestion(item.name)}
                      >
                        <div className="sugg-icon-box">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="sugg-img" />
                          ) : (
                            <Pill className="sugg-pill-icon" />
                          )}
                        </div>

                        <div className="sugg-info">
                          <div className="sugg-name-row">
                            <span className="sugg-name">{item.name}</span>
                          </div>
                          <div className="sugg-meta">
                            <span className="sugg-cat">{item.category || "Healthcare"}</span>
                            <span className="sugg-dot">•</span>
                            <span className="sugg-company">{item.company || "Generic"}</span>
                          </div>
                        </div>

                        <div className="sugg-right">
                          <span className="sugg-price">
                            ₹{item.sellingPrice || item.price || 40}
                          </span>
                          <span
                            className={`sugg-stock-badge ${
                              Number(item.stock) === 0 ? "out-stock" : "in-stock"
                            }`}
                          >
                            {Number(item.stock) === 0 ? "Out of Stock" : "In Stock"}
                          </span>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="search-dropdown-footer-btn"
                      onClick={handleSearch}
                    >
                      <span>See all matching products</span>
                      <ChevronRight className="footer-arrow-icon" />
                    </button>
                  </div>
                ) : (
                  <div className="no-suggestions-box">
                    <p>No medicines found for "<strong>{searchQuery}</strong>"</p>
                    <button
                      type="button"
                      className="no-sugg-browse-btn"
                      onClick={handleSearch}
                    >
                      Browse full catalog in Medicines ➔
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="nav-actions">
            {(user?.role === "admin" || user?.email?.toLowerCase().includes("admin")) && (
              <Link to="/dashboard" className="login-btn dashboard-nav-btn">
                <LayoutDashboard className="nav-btn-icon" />
                <span>Dashboard</span>
              </Link>
            )}

            <UserProfileDropdown
              user={user}
              onLogout={handleLogout}
              onOpenLocation={() => setIsLocationModalOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Award className="badge-icon" /> Trusted Healthcare Delivery
            </div>

            <h1 className="hero-title">
              Healthcare delivered
              <br />
              <span className="gradient-text">to your doorstep.</span>
            </h1>

            <p className="hero-desc">
              Order genuine medicines and healthcare products from the comfort
              of your home with speed & convenience.
            </p>

            <div className="hero-actions">
              <Link to="/medicines" className="primary-btn">
                <span>Shop Medicines</span>
                <ArrowRight className="btn-icon" />
              </Link>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => setIsPrescriptionModalOpen(true)}
              >
                <FileText className="btn-icon" />
                <span>Upload Prescription</span>
              </button>
            </div>

            <div className="trust-row">
              <div className="trust-badge-item">
                <CheckCircle2 className="check-icon" />
                <span>Genuine Medicines</span>
              </div>

              <div className="trust-badge-item">
                <CheckCircle2 className="check-icon" />
                <span>Fast Delivery</span>
              </div>

              <div className="trust-badge-item">
                <CheckCircle2 className="check-icon" />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>

          {/* ================= HERO VISUAL ================= */}
          <div className="hero-image">
            <div className="hero-circle-backdrop"></div>

            <div className="medicine-box">
              <div className="box-icon-wrap">
                <Pill className="box-pill-icon" />
              </div>
              <div className="box-text">
                <strong>Medi</strong>
                <span>Deliver</span>
              </div>
              <small>24/7 EXPRESS PHARMACY</small>
            </div>

            <div className="floating-card delivery-card">
              <div className="floating-icon-wrap delivery">
                <Truck className="float-svg" />
              </div>
              <div>
                <strong>Express Delivery</strong>
                <small>At your doorstep in 30 mins</small>
              </div>
            </div>

            <div className="floating-card secure-card">
              <div className="floating-icon-wrap secure">
                <ShieldCheck className="float-svg" />
              </div>
              <div>
                <strong>100% Genuine</strong>
                <small>Verified Pharmacy Partners</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="trust-strip">
        <div className="trust-container">
          <div className="trust-item">
            <div className="trust-icon-box">
              <ShieldCheck className="strip-svg" />
            </div>
            <div>
              <strong>100% Genuine</strong>
              <small>Authentic medicines</small>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <Truck className="strip-svg" />
            </div>
            <div>
              <strong>Fast Delivery</strong>
              <small>At your doorstep</small>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <Lock className="strip-svg" />
            </div>
            <div>
              <strong>Secure Payment</strong>
              <small>Safe transactions</small>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <Heart className="strip-svg" />
            </div>
            <div>
              <strong>Healthcare First</strong>
              <small>Your health matters</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="categories-section">
        <div className="section-container">
          <div className="section-heading">
            <div>
              <span className="sub-label">EXPLORE</span>
              <h2>Shop by Category</h2>
              <p>Find everything you need for your everyday healthcare.</p>
            </div>

            <Link to="/medicines" className="view-all-link">
              <span>View All</span>
              <ArrowRight className="link-arrow" />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link
                to={`/medicines?category=${encodeURIComponent(category.name)}`}
                className="category-card"
                key={category.name}
              >
                <div className="category-icon-wrapper">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>
                  <span>Explore products</span>
                  <ArrowRight className="card-arrow" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TOP BRANDS / COMPANIES ================= */}
      <section className="companies-section">
        <div className="section-container">
          <div className="section-heading">
            <div>
              <span className="sub-label">TOP BRANDS</span>
              <h2>Shop by Company / Brand</h2>
              <p>Explore genuine medicines directly from trusted pharmaceutical manufacturers.</p>
            </div>

            <Link to="/medicines" className="view-all-link">
              <span>View All Brands</span>
              <ArrowRight className="link-arrow" />
            </Link>
          </div>

          <div className="company-grid">
            {topCompanies.map((comp) => (
              <Link
                to={`/medicines?company=${encodeURIComponent(comp.shortName)}`}
                className="company-card"
                key={comp.name}
              >
                <div className="company-header">
                  <div className="company-logo-badge" style={{ backgroundColor: comp.badgeColor }}>
                    <Building2 className="company-logo-icon" />
                  </div>
                  <span className="company-tag" style={{ color: comp.badgeColor, backgroundColor: comp.bgColor }}>
                    {comp.count}
                  </span>
                </div>

                <div className="company-info">
                  <h3>{comp.name}</h3>
                  <small className="company-tagline">{comp.tagline}</small>
                  <span className="company-category-pill">{comp.category}</span>
                </div>

                <div className="company-footer">
                  <span>Browse Medicines</span>
                  <ArrowRight className="comp-arrow" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OFFER ================= */}
      <section className="offer-section">
        <div className="offer-container">
          <div className="offer-content">
            <span className="offer-label">
              <Sparkles className="label-icon" /> SPECIAL OFFER
            </span>

            <h2>
              Save more on your
              <br />
              healthcare.
            </h2>

            <p>Discover great prices on medicines and healthcare essentials.</p>

            <Link to="/medicines" className="offer-btn">
              <span>Explore Deals</span>
              <ArrowRight className="btn-icon" />
            </Link>
          </div>

          <div className="offer-circle">
            <div className="offer-badge-content">
              <strong>UP TO</strong>
              <b>25%</b>
              <span>OFF</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY MEDIDELIVER ================= */}
      <section className="why-section">
        <div className="section-container">
          <div className="center-heading">
            <span className="sub-label">WHY MEDIDELIVER</span>
            <h2>Healthcare you can trust.</h2>
            <p>
              Everything you need for a simpler and safer healthcare experience.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck className="feat-svg" />
              </div>
              <h3>Genuine Medicines</h3>
              <p>
                Quality medicines sourced directly from verified pharmacies and certified suppliers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Truck className="feat-svg" />
              </div>
              <h3>Fast Delivery</h3>
              <p>
                Get your healthcare essentials delivered conveniently to your doorstep with real-time tracking.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <CreditCard className="feat-svg" />
              </div>
              <h3>Secure Payments</h3>
              <p>
                Multiple safe and encrypted payment options including Razorpay, UPI, Cards, and COD.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Package className="feat-svg" />
              </div>
              <h3>Easy Ordering</h3>
              <p>
                Simple, fast ordering experience from quick search to hassle-free doorstep delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HEALTHCARE CTA ================= */}
      <section className="healthcare-cta">
        <div className="healthcare-cta-container">
          <div className="cta-left">
            <span className="cta-sub-label">YOUR HEALTH, OUR PRIORITY</span>
            <h2>
              Everything you need,
              <br />
              delivered with care.
            </h2>
            <p>Shop genuine medicines and health products from MediDeliver today.</p>
          </div>

          <Link to="/medicines" className="cta-btn">
            <span>Start Shopping</span>
            <ArrowRight className="btn-icon" />
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-about">
            <Link to="/" className="footer-logo">
              <Pill className="footer-logo-icon" />
              Medi<span>Deliver</span>
            </Link>
            <p>Your trusted 24/7 digital healthcare & medicine delivery partner.</p>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/medicines">Medicines</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/returns">Return Medicine</Link>
            {(user?.role === "admin" || user?.email?.toLowerCase().includes("admin")) && (
              <Link to="/dashboard">Dashboard</Link>
            )}
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          <div className="footer-column">
            <h4>Support & Return</h4>
            <Link to="/returns">Return Policy & Claims</Link>
            <Link to="/contact">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>

          <div className="footer-column">
            <h4>Healthcare</h4>
            <p>Genuine Medicines</p>
            <p>Fast Delivery</p>
            <p>Secure Payments</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 MediDeliver. All rights reserved. Built for fast & reliable healthcare.
        </div>
      </footer>

      {/* LOCATION MODAL */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSaveLocation={(loc) => setDeliveryLocation(loc)}
        currentLocation={deliveryLocation}
      />

      {/* UPLOAD PRESCRIPTION MODAL */}
      <UploadPrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        user={user}
        deliveryLocation={deliveryLocation}
      />
    </div>
  );
};

export default Home;
