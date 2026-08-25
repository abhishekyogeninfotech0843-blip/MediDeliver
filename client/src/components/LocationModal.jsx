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
  AlertCircle
} from "lucide-react";
import "./LocationModal.css";

const POPULAR_CITIES = [
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, pincode: "110001" },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, pincode: "201301" },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, pincode: "122001" },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, pincode: "400001" },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, pincode: "560001" },
  { name: "Dubai", state: "Dubai Emirate", lat: 25.2048, lng: 55.2708, pincode: "00000" },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pincode: "302001" },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, pincode: "500001" },
  { name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794, pincode: "160017" },
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
    } else {
      const saved = localStorage.getItem("deliveryLocation");
      if (saved) {
        try {
          setSelectedLocation(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [currentLocation, isOpen]);

  // Debounced search via OpenStreetMap Nominatim API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      setError("");
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
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
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};

          const detectedArea =
            addr.suburb || addr.neighbourhood || addr.residential || addr.road || "Detected Area";
          const detectedCity =
            addr.city || addr.town || addr.village || addr.county || "Detected City";
          const detectedState = addr.state || "";
          const detectedPincode = addr.postcode || "";

          const newLoc = {
            area: detectedArea,
            city: detectedCity,
            state: detectedState,
            pincode: detectedPincode,
            fullAddress: data.display_name || `${detectedArea}, ${detectedCity}`,
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
        setError("GPS Permission denied or unavailable. Please search or pick a city below.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSuggestion = (item) => {
    const displayName = item.display_name || "";
    const parts = displayName.split(", ");
    
    const area = parts[0] || "Selected Location";
    const city = parts[Math.min(1, parts.length - 1)] || "City";
    const state = parts[parts.length - 2] || "";

    const newLoc = {
      area: area,
      city: city,
      state: state,
      pincode: "",
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
    if (onSaveLocation) {
      onSaveLocation(finalLocation);
    }
    onClose();
  };

  if (!isOpen) return null;

  const mapSrc = `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=14&output=embed`;

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
              <p>Select your location for fast 30-min medicine delivery</p>
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
              <small>Using device location for precise medicine delivery</small>
            </div>
          </button>

          {error && (
            <div className="loc-error-banner">
              <AlertCircle className="err-svg" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Box */}
          <div className="loc-search-box">
            <Search className="loc-search-icon" />
            <input
              type="text"
              placeholder="Search area, landmark, street or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {loadingSearch && <Loader2 className="spin-icon-right" />}
          </div>

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
              <Compass className="map-hdr-icon" />
              <span>Selected Location Map View</span>
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
