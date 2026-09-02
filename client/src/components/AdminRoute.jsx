import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  let isAdmin = false;

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && (parsed.role === "admin" || parsed.email?.toLowerCase().includes("admin"))) {
        isAdmin = true;
      }
    } catch (e) {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    alert("🔒 Access Denied: Only administrators can access the Admin Dashboard.");
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
