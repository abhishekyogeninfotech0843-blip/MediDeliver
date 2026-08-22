import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";
import "./Medicines.css";

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  // =========================
  // CART
  // =========================

  const { addToCart, cartCount } = useCart();

  // =========================
  // PRESCRIPTION
  // =========================

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionMessage, setPrescriptionMessage] = useState("");

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
        "Server se medicines load nahi ho pa rahi hain. Please check your server.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    "All",
    ...new Set(medicines.map((medicine) => medicine.category).filter(Boolean)),
  ];

  // =========================
  // FILTER
  // =========================

  let filteredMedicines = medicines.filter((medicine) => {
    const searchValue = search.toLowerCase().trim();

    const medicineName = medicine.name?.toLowerCase() || "";
    const company = medicine.company?.toLowerCase() || "";
    const medicineCategory = medicine.category?.toLowerCase() || "";

    const matchesSearch =
      medicineName.includes(searchValue) ||
      company.includes(searchValue) ||
      medicineCategory.includes(searchValue);

    const matchesCategory =
      category === "All" || medicine.category === category;

    return matchesSearch && matchesCategory;
  });

  // =========================
  // SORT
  // =========================

  if (sort === "price-low") {
    filteredMedicines.sort(
      (a, b) => Number(a.sellingPrice || 0) - Number(b.sellingPrice || 0),
    );
  }

  if (sort === "price-high") {
    filteredMedicines.sort(
      (a, b) => Number(b.sellingPrice || 0) - Number(a.sellingPrice || 0),
    );
  }

  if (sort === "name") {
    filteredMedicines.sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (medicine) => {
    addToCart(medicine);

    // Small success message
    setPrescriptionMessage(`${medicine.name} added to your cart`);

    setTimeout(() => {
      setPrescriptionMessage("");
    }, 2000);
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

    /*
      Backend prescription upload API
      hum next step mein connect karenge.
    */
  };

  return (
    <div className="medicines-page">
      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="medicines-navbar">
        <div className="medicines-nav-container">
          {/* Logo */}

          <Link to="/" className="medicines-logo">
            Medi<span>Deliver</span>
          </Link>

          {/* Search */}

          <div className="medicines-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search medicines, brands or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Login */}

          <Link to="/login" className="medicines-login">
            Login
          </Link>

          {/* Cart */}

          <Link to="/cart" className="medicines-cart">
            <span className="cart-icon">🛒</span>

            <span className="medicines-cart-count">{cartCount}</span>
          </Link>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="medicines-content">
        {/* Heading */}

        <div className="medicines-heading">
          <small>MEDIDELIVER PHARMACY</small>

          <h1>Medicines & Healthcare</h1>

          <p>
            Genuine medicines and healthcare products delivered to your
            doorstep.
          </p>
        </div>

        {/* ==================================================
            PRESCRIPTION BANNER
        ================================================== */}

        <div className="prescription-banner">
          <div className="prescription-content">
            <div className="prescription-icon">📄</div>

            <div>
              <h3>Have a prescription?</h3>

              <p>
                Upload your prescription and we'll help you find the medicines.
              </p>

              {prescriptionFile && (
                <small>Selected: {prescriptionFile.name}</small>
              )}
            </div>
          </div>

          {/* Hidden File Input */}

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
            {prescriptionFile ? "Upload Prescription" : "Choose Prescription"}
          </button>
        </div>

        {/* Prescription message */}

        {prescriptionMessage && (
          <div className="prescription-message">{prescriptionMessage}</div>
        )}

        {/* ==================================================
            TOOLBAR
        ================================================== */}

        {!loading && !error && medicines.length > 0 && (
          <div className="medicine-toolbar">
            {/* Search */}

            <div className="toolbar-search">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search medicine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category */}

            <select
              className="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Sort */}

            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Sort By</option>

              <option value="price-low">Price: Low to High</option>

              <option value="price-high">Price: High to Low</option>

              <option value="name">Name: A-Z</option>
            </select>
          </div>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="medicines-loading">
            <div className="loading-icon">💊</div>

            <h3>Loading medicines...</h3>

            <p>Please wait while we fetch available medicines.</p>
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (
          <div className="medicines-error">
            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button className="retry-button" onClick={fetchMedicines}>
              Try Again
            </button>
          </div>
        )}

        {/* ==================================================
            EMPTY DATABASE
        ================================================== */}

        {!loading && !error && medicines.length === 0 && (
          <div className="medicines-empty">
            <div className="medicines-empty-icon">💊</div>

            <h2>No medicines available</h2>

            <p>Medicines will appear here once they are added.</p>
          </div>
        )}

        {/* ==================================================
            RESULTS
        ================================================== */}

        {!loading && !error && medicines.length > 0 && (
          <>
            {/* Result count */}

            <div className="result-header">
              <div className="result-count">
                Showing <strong>{filteredMedicines.length}</strong> medicines
              </div>
            </div>

            {/* No Search Result */}

            {filteredMedicines.length === 0 && (
              <div className="medicines-empty">
                <div className="medicines-empty-icon">🔍</div>

                <h2>No medicines found</h2>

                <p>Try another medicine name, company or category.</p>

                <button
                  className="retry-button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setSort("default");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* ==================================================
                  MEDICINE CARDS
              ================================================== */}

            {filteredMedicines.length > 0 && (
              <div className="medicines-grid">
                {filteredMedicines.map((medicine) => {
                  const stock = Number(medicine.stock || 0);

                  const minimumStock = Number(medicine.minimumStock || 10);

                  const outOfStock = stock <= 0;

                  const lowStock = stock > 0 && stock <= minimumStock;

                  return (
                    <div className="medicine-card" key={medicine._id}>
                      {/* Medicine Image */}

                      <div className="medicine-image">
                        <div className="medicine-icon">💊</div>

                        {!outOfStock && (
                          <span className="medicine-badge">Genuine</span>
                        )}
                      </div>

                      {/* Medicine Body */}

                      <div className="medicine-body">
                        {/* Category */}

                        <div className="medicine-category">
                          {medicine.category || "Healthcare"}
                        </div>

                        {/* Name */}

                        <h3 className="medicine-name">{medicine.name}</h3>

                        {/* Company */}

                        <div className="medicine-company">
                          {medicine.company || "Trusted Manufacturer"}
                        </div>

                        {/* Price + Stock */}

                        <div className="medicine-info">
                          <div className="medicine-price">
                            ₹{Number(medicine.sellingPrice || 0).toFixed(2)}
                          </div>

                          {outOfStock && (
                            <div className="medicine-stock stock-out">
                              Out of stock
                            </div>
                          )}

                          {!outOfStock && lowStock && (
                            <div className="medicine-stock stock-low">
                              Only {stock} left
                            </div>
                          )}

                          {!outOfStock && !lowStock && (
                            <div className="medicine-stock stock-good">
                              In stock
                            </div>
                          )}
                        </div>

                        {/* Add Cart */}

                        <button
                          type="button"
                          className="add-cart-button"
                          disabled={outOfStock}
                          onClick={() => handleAddToCart(medicine)}
                        >
                          {outOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Medicines;
