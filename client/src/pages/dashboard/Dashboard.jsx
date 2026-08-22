import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/dashboard");

        if (response.data.success) {
          setDashboard(response.data.dashboard);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);

        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>MediDeliver Dashboard</h1>
        <p>Pharmacy delivery system overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Medicines</h3>
          <div className="value">{dashboard?.totalMedicines || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="value">{dashboard?.totalCustomers || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="value">{dashboard?.totalOrders || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Total Payments</h3>
          <div className="value">{dashboard?.totalPayments || 0}</div>
        </div>
      </div>

      {/* Sales Cards */}
      <div className="dashboard-section">
        <h2>Sales Overview</h2>

        <div className="sales-grid">
          <div className="sales-card">
            <h4>Total Sales</h4>
            <strong>₹{dashboard?.sales?.totalSales || 0}</strong>
          </div>

          <div className="sales-card">
            <h4>Pending Amount</h4>
            <strong>₹{dashboard?.sales?.pendingAmount || 0}</strong>
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="dashboard-section">
        <h2>Order Status</h2>

        <div className="status-grid">
          <div className="status-card">
            <h4>Placed</h4>
            <strong>{dashboard?.orders?.pending || 0}</strong>
          </div>

          <div className="status-card">
            <h4>Confirmed</h4>
            <strong>{dashboard?.orders?.confirmed || 0}</strong>
          </div>

          <div className="status-card">
            <h4>Out For Delivery</h4>
            <strong>{dashboard?.orders?.outForDelivery || 0}</strong>
          </div>

          <div className="status-card">
            <h4>Delivered</h4>
            <strong>{dashboard?.orders?.delivered || 0}</strong>
          </div>

          <div className="status-card">
            <h4>Cancelled</h4>
            <strong>{dashboard?.orders?.cancelled || 0}</strong>
          </div>
        </div>
      </div>

      {/* Payment & Stock */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Paid Payments</h3>
          <div className="value">{dashboard?.payments?.paid || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Pending Payments</h3>
          <div className="value">{dashboard?.payments?.pending || 0}</div>
        </div>

        <div className="stat-card">
          <h3>Low Stock Medicines</h3>
          <div className="value">{dashboard?.lowStockMedicines || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
