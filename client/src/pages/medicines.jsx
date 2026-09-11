import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";
import {
  Pill,
  Search,
  ShoppingCart,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Filter,
  Check,
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  User,
  MapPin,
  Building2,
  X,
  Edit,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  Boxes
} from "lucide-react";
import LocationModal from "../components/LocationModal";
import UserProfileDropdown from "../components/UserProfileDropdown";
import EditMedicineModal from "../components/EditMedicineModal";
import AddMedicineModal from "../components/AddMedicineModal";
import DeleteAllMedicinesModal from "../components/DeleteAllMedicinesModal";
import UploadPrescriptionModal from "../components/UploadPrescriptionModal";
import { getMedicineImage } from "../utils/medicineImages";
import { getDeliveryEstimate } from "../utils/deliveryZone";
import "./medicines.css";

const Medicines = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [company, setCompany] = useState("All");
  const [sort, setSort] = useState("default");
  const [user, setUser] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "instock" | "lowstock" | "outstock"

  // Live search dropdown states
  const [isNavSearchOpen, setIsNavSearchOpen] = useState(false);
  const [isTbSearchOpen, setIsTbSearchOpen] = useState(false);
  const navSearchRef = useRef(null);
  const tbSearchRef = useRef(null);

  // Pagination State (16 items per page - 4 rows x 4 cards)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const isAdmin = user?.role === "admin" || user?.email?.toLowerCase().includes("admin");

  const handleStockFilterClick = (filterType) => {
    const newFilter = stockFilter === filterType && filterType !== "all" ? "all" : filterType;
    setStockFilter(newFilter);
    setCurrentPage(1);

    setTimeout(() => {
      const section = document.getElementById("medicines-catalog-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const handleMedicineAdded = (newMed) => {
    if (newMed) {
      setMedicines((prev) => [newMed, ...prev]);
      setCurrentPage(1);
    }
  };

  const handleMedicineUpdated = (updatedMed, deletedId) => {
    if (deletedId) {
      setMedicines((prev) => prev.filter((m) => m._id !== deletedId));
    } else if (updatedMed) {
      setMedicines((prev) =>
        prev.map((m) => (m._id === updatedMed._id ? { ...m, ...updatedMed } : m))
      );
    }
  };

  const handleAllMedicinesDeleted = () => {
    setMedicines([]);
    setCurrentPage(1);
  };

  const handleResetDefaultMedicines = async () => {
    if (!window.confirm("Are you sure you want to restore default demo medicines catalog?")) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/medicines/reset-default");
      if (res.data.success) {
        setMedicines(res.data.medicines || []);
        alert("✅ Default medicine catalog restored successfully!");
      }
    } catch (e) {
      console.error("Reset error:", e);
      alert("Failed to reset medicine catalog.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDelete = async (medicine) => {
    if (!window.confirm(`Are you sure you want to delete "${medicine.name}" from the catalog?`)) {
      return;
    }
    try {
      const res = await api.delete(`/medicines/${medicine._id}`);
      if (res.data.success) {
        setMedicines((prev) => prev.filter((m) => m._id !== medicine._id));
        alert(`🗑️ "${medicine.name}" deleted successfully.`);
      }
    } catch (err) {
      console.error("Quick delete error:", err);
      alert("Failed to delete medicine.");
    }
  };

  // =========================
  // CART
  // =========================
  const {
    cart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    cartCount,
  } = useCart();

  // =========================
  // PRESCRIPTION
  // =========================
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionMessage, setPrescriptionMessage] = useState("");

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

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      setCategory(catParam);
    }
    const compParam = searchParams.get("company");
    if (compParam) {
      setCompany(compParam);
    }
    const searchParam = searchParams.get("search") || searchParams.get("q");
    if (searchParam !== null && searchParam !== undefined) {
      setSearch(searchParam);
    }
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // =========================
  // FETCH MEDICINES
  // =========================
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/medicines");

      if (response.data.success) {
        setMedicines(response.data.medicines || []);
      } else {
        setError("Unable to load medicines.");
      }
    } catch (err) {
      console.error("Medicine API Error:", err);
      setError(
        "Unable to fetch medicines from server.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Close search dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navSearchRef.current && !navSearchRef.current.contains(e.target)) {
        setIsNavSearchOpen(false);
      }
      if (tbSearchRef.current && !tbSearchRef.current.contains(e.target)) {
        setIsTbSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const qClean = (search || "").trim().toLowerCase();
  const searchSuggestions = qClean
    ? medicines
        .filter((med) => {
          const name = (med.name || "").toLowerCase();
          const comp = (med.company || "").toLowerCase();
          const cat = (med.category || "").toLowerCase();
          return name.includes(qClean) || comp.includes(qClean) || cat.includes(qClean);
        })
        .slice(0, 7)
    : [];

  const handleSelectSuggestion = (medicineName) => {
    setSearch(medicineName);
    setIsNavSearchOpen(false);
    setIsTbSearchOpen(false);
    setCurrentPage(1);

    setTimeout(() => {
      const section = document.getElementById("medicines-catalog-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // =========================
  // CATEGORIES & COMPANIES LIST
  // =========================
  const categories = [
    "All",
    ...new Set(medicines.map((medicine) => medicine.category).filter(Boolean)),
  ];

  const defaultPopularCompanies = [
    "Cipla",
    "Zydus Cadila",
    "Sun Pharma",
    "Dr. Reddy's",
    "Lupin",
    "Abbott",
    "Micro Labs",
    "Himalaya Wellness",
    "Dabur India",
    "HealthKart"
  ];

  const dynamicCompanies = Array.from(
    new Set(medicines.map((m) => m.company).filter(Boolean))
  );

  const companies = [
    "All",
    ...Array.from(new Set([...defaultPopularCompanies, ...dynamicCompanies]))
  ];

  const getCompanyMedicineCount = (compName) => {
    if (compName === "All" || compName === "All Companies") return medicines.length;
    const target = compName.toLowerCase().replace(" ltd", "").replace(" india", "");
    return medicines.filter((m) => {
      const c = (m.company || "").toLowerCase();
      return c.includes(target) || target.includes(c);
    }).length;
  };

  // =========================
  // FILTER
  // =========================
  let filteredMedicines = medicines.filter((medicine) => {
    const searchValue = search.toLowerCase().trim();

    const medicineName = medicine.name?.toLowerCase() || "";
    const medCompany = medicine.company?.toLowerCase() || "";
    const medicineCategory = medicine.category?.toLowerCase() || "";

    const matchesSearch =
      medicineName.includes(searchValue) ||
      medCompany.includes(searchValue) ||
      medicineCategory.includes(searchValue);

    const matchesCategory =
      category === "All" || medicine.category === category;

    const matchesCompany =
      company === "All" ||
      company === "All Companies" ||
      medCompany.includes(company.toLowerCase()) ||
      (company === "Cipla" && medCompany.includes("cipla")) ||
      (company === "Zydus Cadila" && medCompany.includes("zydus")) ||
      (company === "Micro Labs" && medCompany.includes("micro"));

    const stock = Number(medicine.stock || 0);
    const minimumStock = Number(medicine.minimumStock || 10);
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= minimumStock;
    const isInStock = stock > 0;

    let matchesStock = true;
    if (stockFilter === "instock") {
      matchesStock = isInStock;
    } else if (stockFilter === "lowstock") {
      matchesStock = isLowStock;
    } else if (stockFilter === "outstock") {
      matchesStock = isOutOfStock;
    }

    return matchesSearch && matchesCategory && matchesCompany && matchesStock;
  });

  // =========================
  // SORT (Default: Alphabetical A to Z)
  // =========================
  if (sort === "price-low") {
    filteredMedicines.sort(
      (a, b) => Number(a.sellingPrice || 0) - Number(b.sellingPrice || 0),
    );
  } else if (sort === "price-high") {
    filteredMedicines.sort(
      (a, b) => Number(b.sellingPrice || 0) - Number(a.sellingPrice || 0),
    );
  } else {
    // Default (All medicines) & "name": Sort Alphabetically A to Z
    filteredMedicines.sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, company, sort, stockFilter]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedicines = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 280, behavior: "smooth" });
    }
  };

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = (medicine) => {
    addToCart(medicine);

    setPrescriptionMessage(`${medicine.name} added to your cart!`);

    setTimeout(() => {
      setPrescriptionMessage("");
    }, 2500);
  };

  // =========================
  // PRESCRIPTION SELECT
  // =========================
  const handlePrescriptionChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setPrescriptionMessage("Please upload JPG, PNG or PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPrescriptionMessage("File size should be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setPrescriptionFile(file);
    setPrescriptionMessage(`Prescription selected: ${file.name}`);
  };

  // =========================
  // UPLOAD PRESCRIPTION
  // =========================
  const handlePrescriptionUpload = () => {
    if (!prescriptionFile) {
      document.getElementById("prescription-upload")?.click();
      return;
    }

    setPrescriptionMessage(`✓ ${prescriptionFile.name} ready for upload`);
  };

  // Stock statistics
  const lowStockCount = medicines.filter((m) => {
    const s = Number(m.stock || 0);
    const min = Number(m.minimumStock || 10);
    return s > 0 && s <= min;
  }).length;
  const outOfStockCount = medicines.filter((m) => Number(m.stock || 0) <= 0).length;
  const inStockCount = medicines.filter((m) => Number(m.stock || 0) > 0).length;

  return (
    <div className="medicines-page">
      {/* ================= NAVBAR ================= */}
      <header className="medicines-navbar">
        <div className="medicines-nav-container">
          <div className="medicines-nav-left">
            <Link to="/" className="medicines-logo">
              <div className="med-logo-icon">
                <Pill className="nav-pill-icon" />
              </div>
              Medi<span>Deliver</span>
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

          <div className="medicines-search-wrapper" ref={navSearchRef}>
            <div className="medicines-search">
              <Search className="search-icon-svg" />
              <input
                type="text"
                placeholder="Search medicines, brands or categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsNavSearchOpen(true);
                }}
                onFocus={() => {
                  if (search.trim()) setIsNavSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsNavSearchOpen(false);
                  }
                }}
              />
              {search && (
                <button
                  type="button"
                  className="med-search-clear-btn"
                  onClick={() => {
                    setSearch("");
                    setIsNavSearchOpen(false);
                  }}
                  title="Clear search"
                >
                  <X className="clear-icon-svg" />
                </button>
              )}
            </div>

            {/* LIVE AUTOCOMPLETE DROPDOWN (NAVBAR) */}
            {isNavSearchOpen && search.trim().length > 0 && (
              <div className="search-dropdown-menu">
                <div className="search-dropdown-header">
                  <span className="dropdown-title">
                    <Search className="mini-search-icon" /> Results for "<strong>{search}</strong>"
                  </span>
                  <span className="results-count-pill">
                    {searchSuggestions.length} found
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
                  </div>
                ) : (
                  <div className="no-suggestions-box">
                    <p>No medicines found for "<strong>{search}</strong>"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="med-nav-right">
            <button
              type="button"
              className="med-nav-back-btn"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              title="Go back to previous page"
            >
              <ArrowLeft className="nav-btn-icon" />
              <span>Back</span>
            </button>

            {isAdmin && (
              <Link to="/dashboard" className="medicines-login dashboard-nav-btn">
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

      {/* ================= MAIN ================= */}
      <main className="medicines-content">
        <div className="medicines-heading">
          <span className="pharmacy-badge">MEDIDELIVER PHARMACY</span>
          <h1>Medicines & Healthcare</h1>
          <p>
            Genuine medicines and healthcare essentials delivered directly to your doorstep.
          </p>
        </div>

        {/* ================= ADMIN INVENTORY CONTROLS (ADMIN ONLY) ================= */}
        {isAdmin && (
          <div
            className="admin-inventory-bar"
            style={{
              background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)",
              borderRadius: "18px",
              padding: "22px 26px",
              color: "#ffffff",
              marginBottom: "32px",
              boxShadow: "0 10px 25px rgba(6, 78, 59, 0.22)",
              border: "1px solid rgba(52, 211, 153, 0.35)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div
              className="admin-bar-top"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div className="admin-bar-left" style={{ textAlign: "left", maxWidth: "600px" }}>
                <div
                  className="admin-shield-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255, 255, 255, 0.18)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    color: "#a7f3d0",
                    marginBottom: "8px",
                    border: "1px solid rgba(167, 243, 208, 0.3)",
                  }}
                >
                  <ShieldCheck style={{ width: "14px", height: "14px" }} />
                  <span>PHARMACY ADMIN CONTROL PANEL</span>
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: "0 0 4px 0", letterSpacing: "-0.4px" }}>
                  Medicine Inventory & Stock Controls (स्टॉक व दवाई प्रबंधन)
                </h2>
                <p style={{ fontSize: "13.5px", color: "#d1fae5", margin: 0, lineHeight: 1.4 }}>
                  Add new stock, edit prices/names, or delete catalog items. <em style={{ color: "#fef08a", fontStyle: "normal", fontWeight: 600 }}>(Admin Account Only)</em>
                </p>
              </div>

              <div className="admin-bar-stats" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {/* TOTAL ITEMS CHIP */}
                <button
                  type="button"
                  className={`admin-stat-chip total ${stockFilter === "all" ? "active-chip" : ""}`}
                  onClick={() => handleStockFilterClick("all")}
                  title="Click to view all medicines in catalog (सभी दवाइयां देखें)"
                  style={{
                    background: stockFilter === "all" ? "#ffffff" : "rgba(255, 255, 255, 0.15)",
                    border: stockFilter === "all" ? "2px solid #ffffff" : "1.5px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "84px",
                    cursor: "pointer",
                    transform: stockFilter === "all" ? "scale(1.06)" : "scale(1)",
                    boxShadow: stockFilter === "all" ? "0 6px 16px rgba(0, 0, 0, 0.25)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <span
                    className="stat-label"
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: stockFilter === "all" ? "#065f46" : "#a7f3d0",
                    }}
                  >
                    Total Items
                  </span>
                  <strong
                    className="stat-num"
                    style={{
                      fontSize: "19px",
                      fontWeight: 800,
                      color: stockFilter === "all" ? "#065f46" : "#ffffff",
                    }}
                  >
                    {medicines.length}
                  </strong>
                  {stockFilter === "all" && (
                    <span style={{ fontSize: "9.5px", fontWeight: 800, color: "#059669", marginTop: "1px" }}>✓ All Items</span>
                  )}
                </button>

                {/* IN STOCK CHIP */}
                <button
                  type="button"
                  className={`admin-stat-chip instock ${stockFilter === "instock" ? "active-chip" : ""}`}
                  onClick={() => handleStockFilterClick("instock")}
                  title="Click to filter and view only in-stock medicines (स्टॉक में उपलब्ध दवाइयां)"
                  style={{
                    background: stockFilter === "instock" ? "#10b981" : "rgba(16, 185, 129, 0.22)",
                    border: stockFilter === "instock" ? "2px solid #ffffff" : "1.5px solid rgba(52, 211, 153, 0.4)",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "84px",
                    cursor: "pointer",
                    transform: stockFilter === "instock" ? "scale(1.06)" : "scale(1)",
                    boxShadow: stockFilter === "instock" ? "0 6px 16px rgba(16, 185, 129, 0.4)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <span
                    className="stat-label"
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: stockFilter === "instock" ? "#ffffff" : "#a7f3d0",
                    }}
                  >
                    In Stock
                  </span>
                  <strong
                    className="stat-num"
                    style={{
                      fontSize: "19px",
                      fontWeight: 800,
                      color: "#ffffff",
                    }}
                  >
                    {inStockCount}
                  </strong>
                  {stockFilter === "instock" && (
                    <span style={{ fontSize: "9.5px", fontWeight: 800, color: "#ecfdf5", marginTop: "1px" }}>✓ Filtered</span>
                  )}
                </button>

                {/* LOW STOCK CHIP */}
                <button
                  type="button"
                  className={`admin-stat-chip lowstock ${stockFilter === "lowstock" ? "active-chip" : ""}`}
                  onClick={() => handleStockFilterClick("lowstock")}
                  title="Click to filter and view low-stock medicines (कम स्टॉक वाली दवाइयां)"
                  style={{
                    background: stockFilter === "lowstock" ? "#eab308" : "rgba(234, 179, 8, 0.22)",
                    border: stockFilter === "lowstock" ? "2px solid #ffffff" : "1.5px solid rgba(253, 224, 71, 0.45)",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "84px",
                    cursor: "pointer",
                    transform: stockFilter === "lowstock" ? "scale(1.06)" : "scale(1)",
                    boxShadow: stockFilter === "lowstock" ? "0 6px 16px rgba(234, 179, 8, 0.4)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <span
                    className="stat-label"
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: stockFilter === "lowstock" ? "#713f12" : "#fef08a",
                    }}
                  >
                    Low Stock
                  </span>
                  <strong
                    className="stat-num"
                    style={{
                      fontSize: "19px",
                      fontWeight: 800,
                      color: stockFilter === "lowstock" ? "#713f12" : "#fef08a",
                    }}
                  >
                    {lowStockCount}
                  </strong>
                  {stockFilter === "lowstock" && (
                    <span style={{ fontSize: "9.5px", fontWeight: 800, color: "#713f12", marginTop: "1px" }}>✓ Filtered</span>
                  )}
                </button>

                {/* OUT OF STOCK CHIP */}
                <button
                  type="button"
                  className={`admin-stat-chip outstock ${stockFilter === "outstock" ? "active-chip" : ""}`}
                  onClick={() => handleStockFilterClick("outstock")}
                  title="Click to filter and view out-of-stock medicines (खत्म स्टॉक वाली दवाइयां)"
                  style={{
                    background: stockFilter === "outstock" ? "#ef4444" : "rgba(239, 68, 68, 0.22)",
                    border: stockFilter === "outstock" ? "2px solid #ffffff" : "1.5px solid rgba(248, 113, 113, 0.45)",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "84px",
                    cursor: "pointer",
                    transform: stockFilter === "outstock" ? "scale(1.06)" : "scale(1)",
                    boxShadow: stockFilter === "outstock" ? "0 6px 16px rgba(239, 68, 68, 0.4)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <span
                    className="stat-label"
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: stockFilter === "outstock" ? "#ffffff" : "#fca5a5",
                    }}
                  >
                    Out of Stock
                  </span>
                  <strong
                    className="stat-num"
                    style={{
                      fontSize: "19px",
                      fontWeight: 800,
                      color: stockFilter === "outstock" ? "#ffffff" : "#fca5a5",
                    }}
                  >
                    {outOfStockCount}
                  </strong>
                  {stockFilter === "outstock" && (
                    <span style={{ fontSize: "9.5px", fontWeight: 800, color: "#ffffff", marginTop: "1px" }}>✓ Filtered</span>
                  )}
                </button>
              </div>
            </div>

            <div
              className="admin-bar-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.18)",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="admin-btn admin-add-med-btn"
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  borderRadius: "10px",
                  border: "none",
                  background: "#ffffff",
                  color: "#065f46",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                <Plus style={{ width: "16px", height: "16px" }} />
                <span>+ Add Medicine (दवाई जोड़ें)</span>
              </button>

              <button
                type="button"
                className="admin-btn admin-delete-all-btn"
                onClick={() => setIsDeleteAllModalOpen(true)}
                disabled={medicines.length === 0}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  borderRadius: "10px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  cursor: medicines.length === 0 ? "not-allowed" : "pointer",
                  opacity: medicines.length === 0 ? 0.6 : 1,
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.35)",
                }}
              >
                <Trash2 style={{ width: "16px", height: "16px" }} />
                <span>Delete All Medicines (सभी दवाइयां हटाएं)</span>
              </button>

              {medicines.length === 0 && (
                <button
                  type="button"
                  className="admin-btn admin-restore-btn"
                  onClick={handleResetDefaultMedicines}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw style={{ width: "16px", height: "16px" }} />
                  <span>Restore Sample Catalog</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= PRESCRIPTION BANNER ================= */}
        <div className="prescription-banner">
          <div className="prescription-content">
            <div className="prescription-icon-box">
              <FileText className="rx-icon-svg" />
            </div>

            <div className="rx-text">
              <h3>Have a prescription?</h3>
              <p>
                Upload your doctor's prescription and our certified pharmacists will prepare your order.
              </p>

              {prescriptionFile && (
                <div className="selected-file-tag">
                  <Check className="check-sm" /> Selected: {prescriptionFile.name}
                </div>
              )}
            </div>
          </div>

          <input
            id="prescription-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            style={{ display: "none" }}
            onChange={handlePrescriptionChange}
          />

          <button
            type="button"
            className="prescription-button"
            onClick={() => setIsPrescriptionModalOpen(true)}
          >
            <Upload className="upload-icon-svg" />
            <span>Upload Prescription</span>
          </button>
        </div>

        {/* Toast / Message */}
        {prescriptionMessage && (
          <div className="prescription-message">
            <CheckCircle2 className="toast-icon" />
            <span>{prescriptionMessage}</span>
          </div>
        )}

        {/* ================= BRAND / COMPANY SELECTOR LIST ================= */}
        {!loading && !error && medicines.length > 0 && (
          <div className="brand-selector-section">
            <div className="brand-selector-header">
              <div className="brand-header-left">
                <Building2 className="brand-header-icon" />
                <div>
                  <h2>Select Medicine Brand / Company (कंपनी चुनें)</h2>
                  <p>Choose any brand below to view all its medicines instantly:</p>
                </div>
              </div>

              {company !== "All" && (
                <button
                  type="button"
                  className="reset-brand-selection-btn"
                  onClick={() => {
                    setCompany("All");
                    setSearchParams({});
                  }}
                >
                  <RotateCcw className="reset-brand-icon" /> All Brands
                </button>
              )}
            </div>

            {/* COMPANY LIST GRID / LIST */}
            <div className="company-buttons-list">
              {companies.map((compName) => {
                const isSelected =
                  (compName === "All" && (company === "All" || company === "All Companies")) ||
                  (compName !== "All" &&
                    (company.toLowerCase() === compName.toLowerCase() ||
                      company.toLowerCase().includes(compName.toLowerCase().replace(" ltd", "").replace(" india", ""))));

                const count = getCompanyMedicineCount(compName);

                return (
                  <button
                    key={compName}
                    type="button"
                    className={`company-list-btn ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      if (compName === "All") {
                        setCompany("All");
                        setSearchParams({});
                      } else {
                        setCompany(compName);
                        setSearchParams({ company: compName });
                      }
                    }}
                  >
                    <div className="btn-brand-info">
                      <span className="btn-brand-name">
                        {compName === "All" ? "All Pharma Brands" : compName}
                      </span>
                      <span className="btn-brand-count">{count} {count === 1 ? "medicine" : "medicines"}</span>
                    </div>
                    {isSelected && <Check className="btn-check-icon" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TOOLBAR ================= */}
        {!loading && !error && medicines.length > 0 && (
          <>
            <div className="medicine-toolbar">
              <div
                className={`toolbar-search-wrapper ${search ? "is-searching" : ""}`}
                ref={tbSearchRef}
              >
                <div className="toolbar-search">
                  <Search className="tb-search-icon" />
                  <input
                    type="text"
                    placeholder="Search medicine name, company or category..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setIsTbSearchOpen(true);
                    }}
                    onFocus={() => {
                      if (search.trim()) setIsTbSearchOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsTbSearchOpen(false);
                      }
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      className="tb-search-clear-btn"
                      onClick={() => {
                        setSearch("");
                        setIsTbSearchOpen(false);
                      }}
                      title="Clear search"
                    >
                      <X className="clear-icon-svg" />
                    </button>
                  )}
                </div>

                {/* LIVE AUTOCOMPLETE DROPDOWN (TOOLBAR) */}
                {isTbSearchOpen && search.trim().length > 0 && (
                  <div className="search-dropdown-menu">
                    <div className="search-dropdown-header">
                      <span className="dropdown-title">
                        <Search className="mini-search-icon" /> Results for "<strong>{search}</strong>"
                      </span>
                      <span className="results-count-pill">
                        {searchSuggestions.length} found
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
                      </div>
                    ) : (
                      <div className="no-suggestions-box">
                        <p>No medicines found for "<strong>{search}</strong>"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="toolbar-selects">
                <div className="select-wrapper">
                  <Filter className="select-icon" />
                  <select
                    className="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item === "All" ? "All Categories" : item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="select-wrapper">
                  <Building2 className="select-icon" />
                  <select
                    className="category-select company-select"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  >
                    {companies.map((item) => (
                      <option key={item} value={item}>
                        {item === "All" ? "Select Company (All)" : item}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  className="sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="default">Sort By: Name (A to Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Active Filters Bar */}
            {(category !== "All" || company !== "All" || search || stockFilter !== "all") && (
              <div className="active-filters-bar">
                <span className="active-filters-title">Selected Filters:</span>
                {stockFilter !== "all" && (
                  <span className="filter-tag" style={{ background: "#ecfdf5", borderColor: "#6ee7b7", color: "#065f46" }}>
                    Stock: <strong>
                      {stockFilter === "instock" && "In Stock Medicines"}
                      {stockFilter === "lowstock" && "Low Stock Alert"}
                      {stockFilter === "outstock" && "Out of Stock"}
                    </strong>
                    <button type="button" onClick={() => setStockFilter("all")}>
                      <X className="tag-x" />
                    </button>
                  </span>
                )}
                {company !== "All" && (
                  <span className="filter-tag">
                    Company: <strong>{company}</strong>
                    <button type="button" onClick={() => { setCompany("All"); setSearchParams({}); }}>
                      <X className="tag-x" />
                    </button>
                  </span>
                )}
                {category !== "All" && (
                  <span className="filter-tag">
                    Category: <strong>{category}</strong>
                    <button type="button" onClick={() => setCategory("All")}>
                      <X className="tag-x" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="filter-tag">
                    Search: <strong>"{search}"</strong>
                    <button type="button" onClick={() => setSearch("")}>
                      <X className="tag-x" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="clear-all-tags-btn"
                  onClick={() => {
                    setCategory("All");
                    setCompany("All");
                    setSearch("");
                    setSort("default");
                    setStockFilter("all");
                    setSearchParams({});
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="medicines-loading-container">
            <div className="premium-medical-loader">
              <div className="loader-glow-orb"></div>
              <div className="loader-orbit-ring outer"></div>
              <div className="loader-orbit-ring inner"></div>
              <div className="loader-center-beacon">
                <Pill className="loader-pill-icon" />
              </div>
            </div>
            <div className="loader-content-wrap">
              <div className="loader-status-pill">
                <span className="live-pulse-dot"></span>
                <span>MEDIDELIVER CATALOG</span>
              </div>
              <h2>Loading medicines catalog...</h2>
              <p>Fetching 100% genuine verified medicines & stock levels.</p>
              <div className="loader-progress-track">
                <div className="loader-progress-bar"></div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div className="medicines-error">
            <AlertCircle className="error-icon" />
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchMedicines}>
              <RotateCcw className="btn-icon" /> Try Again
            </button>
          </div>
        )}

        {/* ================= EMPTY DATABASE ================= */}
        {!loading && !error && medicines.length === 0 && (
          <div className="medicines-empty">
            <Pill className="empty-pill-icon" />
            <h2>No medicines available in catalog</h2>
            <p>
              {isAdmin
                ? "Your pharmacy catalog is currently empty. Click below to add new medicines or restore default items."
                : "Medicines will appear here once added to the catalog by administrator."}
            </p>

            {isAdmin && (
              <div className="empty-admin-actions">
                <button
                  type="button"
                  className="empty-add-btn"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="btn-icon" /> + Add Medicine Now
                </button>
                <button
                  type="button"
                  className="empty-restore-btn"
                  onClick={handleResetDefaultMedicines}
                >
                  <RotateCcw className="btn-icon" /> Restore Demo Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= RESULTS ================= */}
        {!loading && !error && medicines.length > 0 && (
          <>
            <div className="result-header" id="medicines-catalog-section">
              <div className="result-count">
                Showing <strong>{filteredMedicines.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMedicines.length)}</strong> of <strong>{filteredMedicines.length}</strong> medicines
                {totalPages > 1 && <span style={{ color: "#64748b", marginLeft: "8px" }}>(Page {currentPage} of {totalPages})</span>}
              </div>
            </div>

            {/* Active Stock Filter Banner */}
            {stockFilter !== "all" && (
              <div
                className="stock-filter-active-banner"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background:
                    stockFilter === "instock"
                      ? "#ecfdf5"
                      : stockFilter === "lowstock"
                      ? "#fefce8"
                      : "#fef2f2",
                  border:
                    stockFilter === "instock"
                      ? "1.5px solid #6ee7b7"
                      : stockFilter === "lowstock"
                      ? "1.5px solid #fde047"
                      : "1.5px solid #fca5a5",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  color:
                    stockFilter === "instock"
                      ? "#065f46"
                      : stockFilter === "lowstock"
                      ? "#854d0e"
                      : "#991b1b",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>
                    {stockFilter === "instock" && "🟢 Stock Filter: In-Stock Medicines"}
                    {stockFilter === "lowstock" && "🟡 Stock Filter: Low-Stock Alert Medicines"}
                    {stockFilter === "outstock" && "🔴 Stock Filter: Out-of-Stock Medicines"}
                  </span>
                  <span style={{ fontSize: "12px", opacity: 0.85 }}>({filteredMedicines.length} medicines)</span>
                </div>

                <button
                  type="button"
                  onClick={() => setStockFilter("all")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    fontWeight: 800,
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Show All Medicines ✕
                </button>
              </div>
            )}

            {/* No Search Result */}
            {filteredMedicines.length === 0 && (
              <div className="medicines-empty">
                <Search className="empty-search-icon" />
                <h2>
                  {stockFilter === "outstock" && "No Out of Stock Medicines"}
                  {stockFilter === "lowstock" && "No Low Stock Medicines"}
                  {stockFilter === "instock" && "No In-Stock Medicines"}
                  {stockFilter === "all" && "No medicines found"}
                </h2>
                <p>
                  {stockFilter === "outstock" && "Great! All medicines currently in your catalog have stock available. (Kisi bhi medicine ko out-of-stock test karne ke liye 'Edit Stock' par click karke stock 0 set karein)."}
                  {stockFilter === "lowstock" && "All medicines currently have stock above the minimum alert threshold."}
                  {stockFilter !== "outstock" && stockFilter !== "lowstock" && "Try searching for a different medicine name, brand or category."}
                </p>

                <button
                  className="retry-button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setCompany("All");
                    setSort("default");
                    setStockFilter("all");
                    setSearchParams({});
                  }}
                >
                  Show All Medicines ({medicines.length})
                </button>
              </div>
            )}

            {/* ================= MEDICINE CARDS ================= */}
            {filteredMedicines.length > 0 && (
              <>
                <div className="medicines-grid">
                  {currentMedicines.map((medicine) => {
                    const stock = Number(medicine.stock || 0);
                    const minimumStock = Number(medicine.minimumStock || 10);
                    const outOfStock = stock <= 0;
                    const lowStock = stock > 0 && stock <= minimumStock;

                    return (
                      <div className="medicine-card" key={medicine._id}>
                        <div className="medicine-image">
                          <div className="medicine-icon-box">
                            <Pill className="card-pill-svg" />
                          </div>

                          {!outOfStock && (
                            <span className="medicine-badge">
                              <ShieldCheck className="badge-shield" /> Genuine
                            </span>
                          )}
                        </div>

                        <div className="medicine-body">
                          <div className="medicine-category">
                            {medicine.category || "Healthcare"}
                          </div>

                          <h3 className="medicine-name">{medicine.name}</h3>

                          <div className="medicine-company">
                            {medicine.company || "Trusted Manufacturer"}
                          </div>

                          <div className="medicine-info">
                            <div className="medicine-price">
                              ₹{Number(medicine.sellingPrice || 0).toFixed(2)}
                            </div>

                            {outOfStock && (
                              <div className="medicine-stock stock-out">
                                <AlertCircle className="stock-icon" /> Out of stock
                              </div>
                            )}

                            {!outOfStock && lowStock && (
                              <div className="medicine-stock stock-low">
                                <AlertTriangle className="stock-icon" /> Only {stock} left
                              </div>
                            )}

                            {!outOfStock && !lowStock && (
                              <div className="medicine-stock stock-good">
                                <PackageCheck className="stock-icon" /> In stock
                              </div>
                            )}
                          </div>

                          {outOfStock ? (
                            <button
                              type="button"
                              className="add-cart-button disabled"
                              disabled
                            >
                              <span>Out of Stock</span>
                            </button>
                          ) : (() => {
                            const cartItem = cart?.find((item) => item._id === medicine._id);
                            const cartQty = cartItem ? cartItem.quantity : 0;

                            if (cartQty > 0) {
                              return (
                                <div className="card-qty-control-wrapper">
                                  <button
                                    type="button"
                                    className="card-qty-btn decrease-btn"
                                    onClick={() => decreaseQuantity(medicine._id)}
                                    title="Decrease quantity"
                                  >
                                    <Minus className="qty-btn-icon" />
                                  </button>

                                  <input
                                    type="number"
                                    min="1"
                                    max={medicine.stock ? Number(medicine.stock) : 999}
                                    className="card-qty-input"
                                    value={cartQty}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "") return;
                                      const parsed = parseInt(val, 10);
                                      if (!isNaN(parsed)) {
                                        const maxStock = medicine.stock ? Number(medicine.stock) : 999;
                                        updateQuantity(medicine._id, Math.min(Math.max(0, parsed), maxStock));
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (!e.target.value || parseInt(e.target.value, 10) <= 0) {
                                        removeFromCart(medicine._id);
                                      }
                                    }}
                                    title="Click to type quantity manually"
                                  />

                                  <button
                                    type="button"
                                    className="card-qty-btn increase-btn"
                                    onClick={() => {
                                      const maxStock = medicine.stock ? Number(medicine.stock) : 999;
                                      if (cartQty < maxStock) {
                                        increaseQuantity(medicine._id);
                                      }
                                    }}
                                    disabled={Boolean(medicine.stock && cartQty >= Number(medicine.stock))}
                                    title="Increase quantity"
                                  >
                                    <Plus className="qty-btn-icon" />
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <button
                                type="button"
                                className="add-cart-button"
                                onClick={() => handleAddToCart(medicine)}
                              >
                                <ShoppingCart className="btn-cart-svg" />
                                <span>Add to Cart</span>
                              </button>
                            );
                          })()}

                          {/* ADMIN EDIT & DELETE ACTIONS (ADMIN ONLY) */}
                          {isAdmin && (
                            <div
                              className="admin-card-actions-row"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "8px",
                                width: "100%",
                              }}
                            >
                              <button
                                type="button"
                                className="admin-card-edit-btn"
                                onClick={() => setEditingMedicine(medicine)}
                                title="Edit medicine stock, pricing, and details"
                                style={{
                                  flex: 1,
                                  padding: "8px 10px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#0f766e",
                                  backgroundColor: "#f0fdf4",
                                  border: "1.5px solid #99f6e4",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "5px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <Edit style={{ width: "14px", height: "14px" }} />
                                <span>Edit Stock</span>
                              </button>

                              <button
                                type="button"
                                className="admin-card-del-btn"
                                onClick={() => handleQuickDelete(medicine)}
                                title="Delete this medicine from catalog"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  padding: 0,
                                  border: "1.5px solid #fecaca",
                                  backgroundColor: "#fef2f2",
                                  color: "#dc2626",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <Trash2 style={{ width: "15px", height: "15px" }} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ================= PAGINATION CONTROLS ================= */}
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <div className="pagination-info">
                      Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredMedicines.length} total medicines)
                    </div>

                    <div className="pagination-controls">
                      <button
                        type="button"
                        className="page-btn prev-btn"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <ChevronLeft className="page-icon" />
                        <span>Previous</span>
                      </button>

                      <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            className={`page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="page-btn next-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <span>Next</span>
                        <ChevronRight className="page-icon" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* LOCATION MODAL */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSaveLocation={(loc) => setDeliveryLocation(loc)}
        currentLocation={deliveryLocation}
      />

      {/* ADD MEDICINE MODAL (ADMIN ONLY) */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleMedicineAdded}
      />

      {/* EDIT MEDICINE MODAL (ADMIN ONLY) */}
      <EditMedicineModal
        isOpen={!!editingMedicine}
        medicine={editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSuccess={handleMedicineUpdated}
      />

      {/* DELETE ALL MEDICINES MODAL (ADMIN ONLY) */}
      <DeleteAllMedicinesModal
        isOpen={isDeleteAllModalOpen}
        count={medicines.length}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onSuccess={handleAllMedicinesDeleted}
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

export default Medicines;

