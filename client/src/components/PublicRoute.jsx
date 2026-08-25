import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  let isAuthenticated = false;

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed) {
        isAuthenticated = true;
      }
    } catch (e) {
      isAuthenticated = false;
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
