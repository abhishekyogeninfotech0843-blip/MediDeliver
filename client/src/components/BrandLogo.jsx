import React from "react";
import logoSvg from "../assets/logo.svg";

export const BrandLogoIcon = ({ size = 36, className = "" }) => {
  return (
    <img
      src={logoSvg}
      alt="MediDeliver Logo"
      className={`medideliver-logo-icon ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-block",
        objectFit: "contain",
        borderRadius: "10px",
        boxShadow: "0 3px 10px rgba(5, 150, 105, 0.22)",
        flexShrink: 0,
      }}
    />
  );
};

export default BrandLogoIcon;
