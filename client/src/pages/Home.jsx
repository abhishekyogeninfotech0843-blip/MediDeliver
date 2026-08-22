import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const categories = [
    { icon: "💊", name: "Medicines" },
    { icon: "🩺", name: "Diabetes Care" },
    { icon: "💪", name: "Vitamins & Supplements" },
    { icon: "🧴", name: "Personal Care" },
    { icon: "👶", name: "Baby Care" },
    { icon: "❤️", name: "Heart Care" },
  ];

  return (
    <div className="home-page">
      {/* ================= NAVBAR ================= */}

      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <span className="logo-cross">✚</span>
            Medi<span>Deliver</span>
          </Link>

          <div className="location">
            <span className="location-icon">📍</span>

            <div>
              <small>Deliver to</small>
              <strong>Your Location ▾</strong>
            </div>
          </div>

          <div className="nav-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search medicines, brands or health products..."
            />
          </div>

          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/cart" className="cart">
            🛒
            <span>0</span>
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">🏥 Trusted Healthcare Delivery</div>

            <h1>
              Healthcare delivered
              <br />
              <span>to your doorstep.</span>
            </h1>

            <p>
              Order genuine medicines and healthcare products from the comfort
              of your home.
            </p>

            <div className="hero-actions">
              <Link to="/medicines" className="primary-btn">
                Shop Medicines
                <span>→</span>
              </Link>

              <button className="secondary-btn">📄 Upload Prescription</button>
            </div>

            <div className="trust-row">
              <div>
                <span>✓</span>
                Genuine Medicines
              </div>

              <div>
                <span>✓</span>
                Fast Delivery
              </div>

              <div>
                <span>✓</span>
                Secure Payments
              </div>
            </div>
          </div>

          {/* ================= HERO VISUAL ================= */}

          <div className="hero-image">
            <div className="hero-circle"></div>

            <div className="medicine-box">
              <div className="cross">✚</div>

              <div className="box-text">
                <strong>Medi</strong>
                <span>Deliver</span>
              </div>

              <small>HEALTHCARE</small>
            </div>

            <div className="floating-card delivery-card">
              <div className="floating-icon">🚚</div>

              <div>
                <strong>Fast Delivery</strong>
                <small>At your doorstep</small>
              </div>
            </div>

            <div className="floating-card secure-card">
              <div className="floating-icon">🛡️</div>

              <div>
                <strong>100% Genuine</strong>
                <small>Trusted medicines</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}

      <section className="trust-strip">
        <div className="trust-container">
          <div className="trust-item">
            <span>✓</span>
            <div>
              <strong>100% Genuine</strong>
              <small>Authentic medicines</small>
            </div>
          </div>

          <div className="trust-item">
            <span>🚚</span>
            <div>
              <strong>Fast Delivery</strong>
              <small>At your doorstep</small>
            </div>
          </div>

          <div className="trust-item">
            <span>🔒</span>
            <div>
              <strong>Secure Payment</strong>
              <small>Safe transactions</small>
            </div>
          </div>

          <div className="trust-item">
            <span>💚</span>
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
              <span>EXPLORE</span>
              <h2>Shop by Category</h2>
              <p>Find everything you need for your everyday healthcare.</p>
            </div>

            <Link to="/medicines">View All →</Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link
                to="/medicines"
                className="category-card"
                key={category.name}
              >
                <div className="category-icon">{category.icon}</div>

                <h3>{category.name}</h3>

                <p>Explore products →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OFFER ================= */}

      <section className="offer-section">
        <div className="offer-container">
          <div className="offer-content">
            <span className="offer-label">SPECIAL OFFER</span>

            <h2>
              Save more on your
              <br />
              healthcare.
            </h2>

            <p>Discover great prices on medicines and healthcare essentials.</p>

            <Link to="/medicines" className="offer-btn">
              Explore Deals →
            </Link>
          </div>

          <div className="offer-circle">
            <div>
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
            <span>WHY MEDIDELIVER</span>

            <h2>Healthcare you can trust.</h2>

            <p>
              Everything you need for a simpler and safer healthcare experience.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>

              <h3>Genuine Medicines</h3>

              <p>
                Quality medicines sourced from trusted pharmacies and suppliers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚚</div>

              <h3>Fast Delivery</h3>

              <p>
                Get your healthcare essentials delivered conveniently to your
                doorstep.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>

              <h3>Secure Payments</h3>

              <p>Safe and secure payment options for every order.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📦</div>

              <h3>Easy Ordering</h3>

              <p>
                Simple ordering experience from search to doorstep delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HEALTHCARE CTA ================= */}

      <section className="healthcare-cta">
        <div className="healthcare-cta-content">
          <div>
            <span>YOUR HEALTH, OUR PRIORITY</span>

            <h2>
              Everything you need,
              <br />
              delivered with care.
            </h2>

            <p>Shop medicines and healthcare products from MediDeliver.</p>
          </div>

          <Link to="/medicines">Start Shopping →</Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-about">
            <Link to="/" className="footer-logo">
              <span>✚</span>
              Medi<span>Deliver</span>
            </Link>

            <p>Your trusted healthcare delivery partner.</p>
          </div>

          <div>
            <h4>Quick Links</h4>

            <Link to="/medicines">Medicines</Link>

            <Link to="/cart">Cart</Link>

            <Link to="/login">Login</Link>

            <Link to="/register">Register</Link>
          </div>

          <div>
            <h4>Support</h4>

            <p>Help Center</p>
            <p>Contact Us</p>
            <p>Privacy Policy</p>
          </div>

          <div>
            <h4>Healthcare</h4>

            <p>Genuine Medicines</p>
            <p>Fast Delivery</p>
            <p>Secure Payments</p>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 MediDeliver. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
