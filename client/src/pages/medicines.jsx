import React, { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import LocationModal from "../components/LocationModal";
import UserProfileDropdown from "../components/UserProfileDropdown";
import EditMedicineModal from "../components/EditMedicineModal";
import { getMedicineImage } from "../utils/medicineImages";
import "./Medicines.css";

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
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Pagination State (16 items per page - 4 rows x 4 cards)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const handleMedicineUpdated = (updatedMed, deletedId) => {
    if (deletedId) {
      setMedicines((prev) => prev.filter((m) => m._id !== deletedId));
    } else if (updatedMed) {
      setMedicines((prev) =>
        prev.map((m) => (m._id === updatedMed._id ? { ...m, ...updatedMed } : m))
      );
    }
  };

  // =========================
  // CART
  // =========================
  const { addToCart, cartCount } = useCart();

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

    const loadSavedLocation = () => {
      const savedLoc = localStorage.getItem("deliveryLocation");
      if (savedLoc) {
        try {
          setDeliveryLocation(JSON.parse(savedLoc));
        } catch (e) {}
      }
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

    return matchesSearch && matchesCategory && matchesCompany;
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
  }, [search, category, company, sort]);

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

  return (
    <div className="medicines-page">
      {/* ================= NAVBAR ================= */}
      <header className="medicines-navbar">
        <div className="medicines-nav-container">
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

          <div className="medicines-search">
            <Search className="search-icon-svg" />
            <input
              type="text"
              placeholder="Search medicines, brands or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="med-nav-right">
            {(user?.role === "admin" || user?.email?.toLowerCase().includes("admin")) && (
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

            <Link to="/cart" className="medicines-cart">
              <ShoppingCart className="cart-icon-svg" />
              <span className="medicines-cart-count">{cartCount}</span>
            </Link>
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
            onClick={handlePrescriptionUpload}
          >
            <Upload className="upload-icon-svg" />
            <span>{prescriptionFile ? "Upload Prescription" : "Choose Prescription"}</span>
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
              <div className="toolbar-search">
                <Search className="tb-search-icon" />
                <input
                  type="text"
                  placeholder="Search medicine name, company or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
            {(category !== "All" || company !== "All" || search) && (
              <div className="active-filters-bar">
                <span className="active-filters-title">Selected Filters:</span>
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
                    setSearchParams({});
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="medicines-loading">
            <div className="loading-spinner">
              <Pill className="spinner-pill" />
            </div>
            <h3>Loading medicines...</h3>
            <p>Fetching available items from pharmacy catalog.</p>
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
            <h2>No medicines available</h2>
            <p>Medicines will appear here once added to the catalog.</p>
          </div>
        )}

        {/* ================= RESULTS ================= */}
        {!loading && !error && medicines.length > 0 && (
          <>
            <div className="result-header">
              <div className="result-count">
                Showing <strong>{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMedicines.length)}</strong> of <strong>{filteredMedicines.length}</strong> medicines
                {totalPages > 1 && <span style={{ color: "#64748b", marginLeft: "8px" }}>(Page {currentPage} of {totalPages})</span>}
              </div>
            </div>

            {/* No Search Result */}
            {filteredMedicines.length === 0 && (
              <div className="medicines-empty">
                <Search className="empty-search-icon" />
                <h2>No medicines found</h2>
                <p>Try searching for a different medicine name, brand or category.</p>

                <button
                  className="retry-button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setCompany("All");
                    setSort("default");
                    setSearchParams({});
                  }}
                >
                  Clear Filters
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

                          <button
                            type="button"
                            className="add-cart-button"
                            disabled={outOfStock}
                            onClick={() => handleAddToCart(medicine)}
                          >
                            <ShoppingCart className="btn-cart-svg" />
                            <span>{outOfStock ? "Out of Stock" : "Add to Cart"}</span>
                          </button>

                          {(user?.role === "admin" || user?.email?.toLowerCase().includes("admin")) && (
                            <button
                              type="button"
                              className="admin-edit-card-btn"
                              onClick={() => setEditingMedicine(medicine)}
                            >
                              <Edit className="edit-btn-svg" />
                              <span>Edit Medicine & Stock</span>
                            </button>
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

      {/* EDIT MEDICINE MODAL (ADMIN ONLY) */}
      <EditMedicineModal
        isOpen={!!editingMedicine}
        medicine={editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSuccess={handleMedicineUpdated}
      />
    </div>
  );
};

export default Medicines;
