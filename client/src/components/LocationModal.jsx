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
  ExternalLink
} from "lucide-react";
import "./LocationModal.css";

const POPULAR_CITIES = [
  { name: "Aligarh", state: "Uttar Pradesh", lat: 27.8974, lng: 78.0880, pincode: "202001" },
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, pincode: "110001" },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, pincode: "201301" },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, pincode: "122001" },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, pincode: "400001" },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, pincode: "560001" },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, pincode: "226001" },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pincode: "302001" },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, pincode: "500001" },
  { name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794, pincode: "160017" },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pincode: "411001" },
  { name: "Dubai", state: "Dubai Emirate", lat: 25.2048, lng: 55.2708, pincode: "00000" },
];

const LocationModal = ({ isOpen, onClose, onSaveLocation, currentLocation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");

  const [selectedLocation, setSelectedLocation] = useState({
    area: "Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    fullAddress: "Connaught Place, New Delhi, Delhi 110001",
    lat: 28.6139,
    lng: 77.2090,
    addressType: "Home"
  });

  const [houseNo, setHouseNo] = useState("");
  const [landmark, setLandmark] = useState("");

  useEffect(() => {
    if (currentLocation && currentLocation.city) {
      setSelectedLocation(currentLocation);
      if (currentLocation.houseNo) setHouseNo(currentLocation.houseNo);
      if (currentLocation.landmark) setLandmark(currentLocation.landmark);
    } else {
      const saved = localStorage.getItem("deliveryLocation");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSelectedLocation(parsed);
          if (parsed.houseNo) setHouseNo(parsed.houseNo);
          if (parsed.landmark) setLandmark(parsed.landmark);
        } catch (e) {}
      }
    }
  }, [currentLocation, isOpen]);

  // Debounced search via OpenStreetMap Nominatim API with address details
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      setError("");
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            searchQuery
          )}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error("Location search error:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Submit search query directly (on Enter press or Submit button)
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }

    setLoadingSearch(true);
    setError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        handleSelectSuggestion(data[0]);
      } else {
        setError(`No location found matching "${query}". Please check spelling or select from popular cities.`);
      }
    } catch (err) {
      console.error("Search submit error:", err);
      setError("Failed to search location. Please check internet connection.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // Use Browser GPS Geolocation
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
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};

          const detectedArea =
            addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.quarter || "Current Location";
          const detectedCity =
            addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district || "Detected City";
          const detectedState = addr.state || "";
          const detectedPincode = addr.postcode || "";

          const newLoc = {
            area: detectedArea,
            city: detectedCity,
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
        setError("GPS Permission denied or unavailable. Please search your city/address below.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSuggestion = (item) => {
    const displayName = item.display_name || "";
    const addr = item.address || {};
    const parts = displayName.split(", ");

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
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      (parts.length > 1 ? parts[1] : parts[0]);

    const state = addr.state || (parts.length > 2 ? parts[parts.length - 2] : "");
    const pincode = addr.postcode || "";

    const newLoc = {
      area: area,
      city: city,
      state: state,
      pincode: pincode,
      fullAddress: displayName,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      addressType: selectedLocation.addressType || "Home"
    };

    setSelectedLocation(newLoc);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSelectPopularCity = (cityObj) => {
    setSelectedLocation({
      area: cityObj.name + " Center",
      city: cityObj.name,
      state: cityObj.state,
      pincode: cityObj.pincode,
      fullAddress: `${cityObj.name}, ${cityObj.state} - ${cityObj.pincode}`,
      lat: cityObj.lat,
      lng: cityObj.lng,
      addressType: "Home"
    });
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleConfirmLocation = () => {
    const finalLocation = {
      ...selectedLocation,
      houseNo: houseNo,
      landmark: landmark,
      displayTitle: `${selectedLocation.area || selectedLocation.city}, ${selectedLocation.city}`
    };

    localStorage.setItem("deliveryLocation", JSON.stringify(finalLocation));

    // Dispatch global event so all open pages/components (Navbar, Home, Medicines, Checkout) update state
    window.dispatchEvent(new CustomEvent("deliveryLocationUpdated", { detail: finalLocation }));

    if (onSaveLocation) {
      onSaveLocation(finalLocation);
    }
    onClose();
  };

  if (!isOpen) return null;

  // OpenStreetMap embed URL with pin marker at coordinates
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.015}%2C${selectedLocation.lat - 0.015}%2C${selectedLocation.lng + 0.015}%2C${selectedLocation.lat + 0.015}&layer=mapnik&marker=${selectedLocation.lat}%2C${selectedLocation.lng}`;
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
              <p>Select destination for medicine delivery</p>
            </div>
          </div>
          <button className="loc-close-btn" onClick={onClose} title="Close">
            <X className="x-icon" />
          </button>
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
              <strong>{detecting ? "Detecting Current GPS Location..." : "Use Current Location (GPS)"}</strong>
              <small>Use your device GPS for current location</small>
            </div>
          </button>

          {error && (
            <div className="loc-error-banner">
              <AlertCircle className="err-svg" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Box Form */}
          <form className="loc-search-box" onSubmit={handleSearchSubmit}>
            <Search className="loc-search-icon" onClick={handleSearchSubmit} style={{ cursor: "pointer" }} />
            <input
              type="text"
              placeholder="Search city, area, landmark (e.g. Aligarh, Koramangala)..."
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

          {/* Popular Cities */}
          <div className="popular-cities-section">
            <span className="section-label">Popular Cities</span>
            <div className="city-chips">
              {POPULAR_CITIES.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`city-chip ${
                    selectedLocation.city === c.name ? "active" : ""
                  }`}
                  onClick={() => handleSelectPopularCity(c)}
                >
                  <Building className="chip-icon" />
                  {c.name}
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
                <span className="map-title-text">
                  Selected Location Map View
                </span>
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
                <strong>Detected on Map:</strong> {selectedLocation.area || selectedLocation.city}, {selectedLocation.state || selectedLocation.city} ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})
              </span>
            </div>

            <iframe
              title="Delivery Map Preview"
              src={mapSrc}
              className="google-map-iframe"
              loading="lazy"
            ></iframe>
          </div>

          {/* Location Summary & Address Input */}
          <div className="loc-summary-card">
            <div className="selected-address-box">
              <MapPin className="pin-highlight" />
              <div>
                <h4>{selectedLocation.area || selectedLocation.city}</h4>
                <p>{selectedLocation.fullAddress}</p>
              </div>
            </div>

            <div className="address-inputs-row">
              <input
                type="text"
                placeholder="House / Flat / Block No."
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Landmark (Optional)"
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
            className="confirm-loc-btn"
            onClick={handleConfirmLocation}
          >
            <Check className="check-icon" />
            <span>Confirm & Deliver Here</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;

