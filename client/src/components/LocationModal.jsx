import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Check,
  Building,
  Home as HomeIcon,
  Compass,
  Loader2,
  AlertCircle,
  ExternalLink,
  Clock,
  ShieldAlert,
  Sparkles,
  Truck
} from "lucide-react";
import {
  STORE_LOCATION,
  ALIGARH_AREAS,
  getDeliveryEstimate,
  calculateDistanceKm,
  detectAligarhCustomLocation
} from "../utils/deliveryZone";
import "./LocationModal.css";

const DEFAULT_ALIGARH_LOCATION = {
  area: "Centre Point",
  city: "Aligarh",
  district: "Aligarh",
  state: "Uttar Pradesh",
  pincode: "202001",
  fullAddress: "Centre Point, Aligarh, Uttar Pradesh 202001",
  lat: 27.8974,
  lng: 78.088,
  addressType: "Home"
};

const LocationModal = ({ isOpen, onClose, onSaveLocation, currentLocation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");

  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_ALIGARH_LOCATION);
  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");

  // Sync with current location or saved storage (ensure it's an Aligarh location)
  useEffect(() => {
    let loc = null;
    if (currentLocation && currentLocation.city) {
      loc = currentLocation;
    } else {
      const saved = localStorage.getItem("deliveryLocation");
      if (saved) {
        try {
          loc = JSON.parse(saved);
        } catch (e) {}
      }
    }

    if (loc) {
      // Validate whether saved location is inside Aligarh service zone
      const estimate = getDeliveryEstimate(loc);
      if (estimate.isDeliverable) {
        setSelectedLocation(loc);
        if (loc.houseNo) setHouseNo(loc.houseNo);
        if (loc.landmark) setLandmark(loc.landmark);
      } else {
        // Fallback to default Aligarh
        setSelectedLocation(DEFAULT_ALIGARH_LOCATION);
      }
    }
  }, [currentLocation, isOpen]);

  // Compute live estimate based on current selected coordinates
  const currentEstimate = getDeliveryEstimate({
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    pincode: selectedLocation.pincode,
    city: selectedLocation.city,
    address: selectedLocation.fullAddress
  });

  // Debounced search via OpenStreetMap Nominatim API with preference for Aligarh
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      setError("");
      try {
        // Query OpenStreetMap
        const queryWithContext = searchQuery.toLowerCase().includes("aligarh")
          ? searchQuery
          : `${searchQuery}, Aligarh, Uttar Pradesh`;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            queryWithContext
          )}&limit=5`
        );
        let data = await response.json();

        // If no results with Aligarh appended, try raw query
        if (!data || data.length === 0) {
          const rawRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
              searchQuery
            )}&limit=5`
          );
          data = await rawRes.json();
        }

        setSuggestions(data || []);
      } catch (err) {
        console.error("Location search error:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Instant Custom Aligarh Detection for current search input
  const customDetect = detectAligarhCustomLocation(searchQuery);

  const handleSelectCustomLocation = (customObj) => {
    if (!customObj) return;
    if (!customObj.isDeliverable) {
      setError(customObj.message);
      return;
    }

    setError("");
    setSelectedLocation({
      area: customObj.area,
      subArea: customObj.subArea,
      city: "Aligarh",
      district: "Aligarh",
      state: "Uttar Pradesh",
      pincode: customObj.pincode || "202001",
      fullAddress: customObj.fullAddress,
      lat: customObj.lat || 27.8974,
      lng: customObj.lng || 78.088,
      addressType: selectedLocation.addressType || "Home",
    });
    setSearchQuery("");
    setSuggestions([]);
  };

  // Submit search query directly (Enter key or search click)
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // 1. If suggestions from Nominatim exist, pick first
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }

    // 2. Try custom Aligarh detection first for immediate local match
    const custom = detectAligarhCustomLocation(query);

    setLoadingSearch(true);
    setError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          query + ", Aligarh, Uttar Pradesh"
        )}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        handleSelectSuggestion(data[0]);
      } else if (custom && custom.isDeliverable) {
        // Automatically accept custom Aligarh location!
        handleSelectCustomLocation(custom);
      } else if (custom && !custom.isDeliverable) {
        setError(custom.message);
      } else {
        setError(`No location found matching "${query}". Please choose from Aligarh localities below.`);
      }
    } catch (err) {
      console.error("Search submit error:", err);
      if (custom && custom.isDeliverable) {
        handleSelectCustomLocation(custom);
      } else {
        setError("Failed to search location. Please check your internet connection.");
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // Browser GPS Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Check distance from Aligarh store immediately
        const dist = calculateDistanceKm(
          STORE_LOCATION.lat,
          STORE_LOCATION.lng,
          latitude,
          longitude
        );

        if (dist > STORE_LOCATION.maxDeliveryRadiusKm) {
          setDetecting(false);
          setError(
            `⚠️ You are approx ${dist} km away. MediDeliver currently operates exclusively within Aligarh District (up to 45 km from our central pharmacy). Please choose an address in Aligarh.`
          );
          return;
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};

          const detectedArea =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.road ||
            addr.quarter ||
            "Aligarh Local Area";
          const detectedCity =
            addr.city || addr.town || addr.village || addr.county || "Aligarh";
          const detectedState = addr.state || "Uttar Pradesh";
          const detectedPincode = addr.postcode || "202001";

          const newLoc = {
            area: detectedArea,
            city: detectedCity,
            district: "Aligarh",
            state: detectedState,
            pincode: detectedPincode,
            fullAddress: data.display_name || `${detectedArea}, ${detectedCity}, ${detectedState}`,
            lat: latitude,
            lng: longitude,
            addressType: selectedLocation.addressType || "Home"
          };

          setSelectedLocation(newLoc);
          setSearchQuery("");
          setSuggestions([]);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setError("Failed to fetch address details for current GPS coordinates.");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        console.error("GPS Error:", err);
        setDetecting(false);
        setError("GPS Permission denied or unavailable. Please select your Aligarh locality below.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSuggestion = (item) => {
    const displayName = item.display_name || "";
    const addr = item.address || {};
    const parts = displayName.split(", ");

    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    // Check distance
    const dist = calculateDistanceKm(STORE_LOCATION.lat, STORE_LOCATION.lng, lat, lng);
    if (dist > STORE_LOCATION.maxDeliveryRadiusKm) {
      setError(
        `⚠️ "${parts[0]}" is ${dist} km away (outside Aligarh district). We only deliver within 45 km of Aligarh Central Pharmacy.`
      );
    } else {
      setError("");
    }

    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.road ||
      addr.quarter ||
      parts[0] ||
      "Selected Area";

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      (parts.length > 1 ? parts[1] : "Aligarh");

    const state = addr.state || "Uttar Pradesh";
    const pincode = addr.postcode || "202001";

    const newLoc = {
      area: area,
      city: city,
      district: "Aligarh",
      state: state,
      pincode: pincode,
      fullAddress: displayName,
      lat: lat,
      lng: lng,
      addressType: selectedLocation.addressType || "Home"
    };

    setSelectedLocation(newLoc);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSelectAligarhArea = (areaObj) => {
    setError("");
    setSelectedLocation({
      area: areaObj.name,
      city: "Aligarh",
      district: "Aligarh",
      state: "Uttar Pradesh",
      pincode: areaObj.pincode,
      fullAddress: `${areaObj.name}, Aligarh, Uttar Pradesh - ${areaObj.pincode}`,
      lat: areaObj.lat,
      lng: areaObj.lng,
      addressType: "Home"
    });
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleConfirmLocation = () => {
    if (!currentEstimate.isDeliverable) {
      setError(
        "Cannot deliver to this location. Please choose an address within Aligarh District (45 km radius)."
      );
      return;
    }

    const finalLocation = {
      ...selectedLocation,
      houseNo: houseNo,
      landmark: landmark,
      deliveryDistanceKm: currentEstimate.distanceKm,
      estimatedDeliveryTime: currentEstimate.deliveryTime,
      deliveryBadge: currentEstimate.deliveryBadge,
      displayTitle: `${selectedLocation.area || selectedLocation.city}, Aligarh`
    };

    localStorage.setItem("deliveryLocation", JSON.stringify(finalLocation));

    // Dispatch global event for Navbar, Checkout, and other components
    window.dispatchEvent(
      new CustomEvent("deliveryLocationUpdated", { detail: finalLocation })
    );

    if (onSaveLocation) {
      onSaveLocation(finalLocation);
    }
    onClose();
  };

  if (!isOpen) return null;

  // OpenStreetMap embed URL with pin marker
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.02}%2C${selectedLocation.lat - 0.02}%2C${selectedLocation.lng + 0.02}%2C${selectedLocation.lat + 0.02}&layer=mapnik&marker=${selectedLocation.lat}%2C${selectedLocation.lng}`;
  const gmapsUrl = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="location-modal-header">
          <div className="loc-header-title">
            <div className="loc-icon-badge">
              <MapPin className="loc-icon-svg" />
            </div>
            <div>
              <h3>Choose Delivery Location</h3>
              <p>Aligarh District Exclusive Service (Up to 45 km radius)</p>
            </div>
          </div>
          <button className="loc-close-btn" onClick={onClose} title="Close">
            <X className="x-icon" />
          </button>
        </div>

        {/* Exclusive Zone Notice Banner */}
        <div className="service-zone-banner">
          <Truck className="zone-icon" />
          <span>
            <strong>Aligarh District Service:</strong> Genuine medicines delivered from our Centre Point Hub within 45 km.
          </span>
        </div>

        <div className="location-modal-body">
          {/* Geolocation Button */}
          <button
            type="button"
            className="gps-detect-btn"
            onClick={handleDetectLocation}
            disabled={detecting}
          >
            {detecting ? (
              <Loader2 className="spin-icon" />
            ) : (
              <Navigation className="gps-icon" />
            )}
            <div>
              <strong>
                {detecting ? "Detecting GPS Location in Aligarh..." : "Use Current Location (GPS)"}
              </strong>
              <small>Auto-detect your location within Aligarh District</small>
            </div>
          </button>

          {error && (
            <div className="loc-error-banner">
              <AlertCircle className="err-svg" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Box */}
          <form className="loc-search-box" onSubmit={handleSearchSubmit}>
            <Search
              className="loc-search-icon"
              onClick={handleSearchSubmit}
              style={{ cursor: "pointer" }}
            />
            <input
              type="text"
              placeholder="Search Aligarh locality, tehsil, or colony (e.g. Khair, Civil Lines)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                title="Clear search"
              >
                <X className="clear-icon" />
              </button>
            )}
            {loadingSearch && <Loader2 className="spin-icon-right" />}
          </form>

          {/* Instant Custom Location Detection Card */}
          {searchQuery.trim().length >= 2 && customDetect && (
            <div
              className={`custom-location-action-card ${
                customDetect.isDeliverable ? "deliverable" : "blocked"
              }`}
              onClick={() => {
                if (customDetect.isDeliverable) {
                  handleSelectCustomLocation(customDetect);
                }
              }}
            >
              <div className="cla-icon-circle">
                <Sparkles className="cla-icon" />
              </div>
              <div className="cla-text-box">
                <div className="cla-header-line">
                  <strong>Use Custom Location: "{searchQuery.trim()}"</strong>
                  {customDetect.isDeliverable ? (
                    <span className="cla-badge-time">
                      {customDetect.deliveryBadge}
                    </span>
                  ) : (
                    <span className="cla-badge-blocked">Outside Aligarh</span>
                  )}
                </div>
                <p className="cla-desc">{customDetect.message}</p>
              </div>
              {customDetect.isDeliverable && (
                <button
                  type="button"
                  className="cla-use-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCustomLocation(customDetect);
                  }}
                >
                  Set Location
                </button>
              )}
            </div>
          )}

          {/* Search Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <MapPin className="sugg-icon" />
                  <div>
                    <strong>{item.display_name.split(",")[0]}</strong>
                    <small>{item.display_name}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Popular Aligarh Localities & Tehsils */}
          <div className="popular-cities-section">
            <div className="section-label-row">
              <span className="section-label">Aligarh Localities & Tehsils</span>
              <span className="section-sublabel">Select for instant delivery</span>
            </div>
            <div className="city-chips">
              {ALIGARH_AREAS.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  className={`city-chip ${
                    selectedLocation.area === a.name ? "active" : ""
                  }`}
                  onClick={() => handleSelectAligarhArea(a)}
                >
                  <Building className="chip-icon" />
                  <span>{a.name}</span>
                  <span className="chip-time-badge">{a.deliveryTime}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Preview */}
          <div className="map-preview-container">
            <div className="map-hdr">
              <div className="map-hdr-left">
                <span className="live-pulse"></span>
                <Compass className="map-hdr-icon" />
                <span className="map-title-text">Selected Location Map View</span>
              </div>
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noreferrer"
                className="gmaps-link"
                title="Open in Google Maps"
              >
                <ExternalLink className="ext-icon" />
                <span>Google Maps</span>
              </a>
            </div>

            <div className="map-detected-bar">
              <MapPin className="pin-bar-icon" />
              <span>
                <strong>Map Marker:</strong> {selectedLocation.area || selectedLocation.city},{" "}
                {selectedLocation.state || "Uttar Pradesh"} (
                {selectedLocation.lat?.toFixed(4)}, {selectedLocation.lng?.toFixed(4)})
              </span>
            </div>

            <iframe
              title="Delivery Map Preview"
              src={mapSrc}
              className="google-map-iframe"
              loading="lazy"
            ></iframe>
          </div>

          {/* Dynamic Distance & Delivery Time Card */}
          <div className={`delivery-estimate-card ${currentEstimate.isDeliverable ? "serviceable" : "unserviceable"}`}>
            <div className="estimate-header">
              <div className="estimate-title-group">
                <Clock className="estimate-icon" />
                <div>
                  <span className="estimate-label">Estimated Delivery Time</span>
                  <h4 className="estimate-value">{currentEstimate.deliveryTime}</h4>
                </div>
              </div>
              <div className="distance-pill">
                <span>{currentEstimate.distanceKm ? `~${currentEstimate.distanceKm} km` : "Aligarh"} from Pharmacy</span>
              </div>
            </div>

            <div className="estimate-footer-note">
              {currentEstimate.isDeliverable ? (
                <span className="deliverable-text">
                  <Check className="mini-check" /> {currentEstimate.message}
                </span>
              ) : (
                <span className="undeliverable-text">
                  <ShieldAlert className="mini-alert" /> {currentEstimate.message}
                </span>
              )}
            </div>
          </div>

          {/* Location Summary & Address Input */}
          <div className="loc-summary-card">
            <div className="selected-address-box">
              <MapPin className="pin-highlight" />
              <div>
                <h4>{selectedLocation.area || selectedLocation.city}</h4>
                <p>{selectedLocation.fullAddress}</p>
                <small className="pincode-tag">District: Aligarh • PIN: {selectedLocation.pincode}</small>
              </div>
            </div>

            <div className="address-inputs-row">
              <input
                type="text"
                placeholder="House / Flat / Shop / Block No."
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Landmark (e.g. Near Ghanta Ghar, Clock Tower)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            {/* Address Type Selector */}
            <div className="address-type-selector">
              <span className="type-label">Save address as:</span>
              <div className="type-btns">
                {["Home", "Work", "Other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`type-btn ${
                      selectedLocation.addressType === t ? "active" : ""
                    }`}
                    onClick={() =>
                      setSelectedLocation((prev) => ({ ...prev, addressType: t }))
                    }
                  >
                    {t === "Home" ? <HomeIcon className="t-icon" /> : <Building className="t-icon" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="location-modal-footer">
          <button type="button" className="cancel-loc-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`confirm-loc-btn ${!currentEstimate.isDeliverable ? "disabled-btn" : ""}`}
            onClick={handleConfirmLocation}
            disabled={!currentEstimate.isDeliverable}
            title={!currentEstimate.isDeliverable ? "Delivery not available outside Aligarh district" : "Confirm Delivery Location"}
          >
            <Check className="check-icon" />
            <span>
              {currentEstimate.isDeliverable ? "Confirm & Deliver Here" : "Outside Service Area"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
