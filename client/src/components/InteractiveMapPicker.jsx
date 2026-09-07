import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Search,
  Crosshair,
  Sparkles,
  Navigation,
  Check,
  X,
  Clock,
  Building,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import {
  STORE_LOCATION,
  ALIGARH_AREAS,
  getDeliveryEstimate,
  calculateDistanceKm,
  detectAligarhCustomLocation,
} from "../utils/deliveryZone";
import "./InteractiveMapPicker.css";

// Fix standard Leaflet default icon paths if needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Create custom luxury map pin icon
const createPinIcon = (label = "Delivery Spot") => {
  return L.divIcon({
    className: "medideliver-custom-pin",
    html: `
      <div class="pin-marker-wrapper">
        <div class="pin-pulse-ring"></div>
        <div class="pin-marker-head">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="pin-svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="pin-marker-pointer"></div>
        <div class="pin-marker-label">${label}</div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -44],
  });
};

const POPULAR_QUICK_LANDMARKS = [
  { name: "Banna Devi Thana", lat: 27.8926, lng: 78.0645, pincode: "202001", area: "Banna Devi" },
  { name: "Gular Road", lat: 27.8965, lng: 78.0712, pincode: "202001", area: "Gular Road / Achal Taal" },
  { name: "Centre Point", lat: 27.8974, lng: 78.088, pincode: "202001", area: "Centre Point" },
  { name: "Medical Road / JNMC", lat: 27.918, lng: 78.075, pincode: "202002", area: "Civil Lines / AMU" },
  { name: "Ramghat Road", lat: 27.904, lng: 78.0995, pincode: "202001", area: "Ramghat Road" },
  { name: "Sarsol / Sai Vihar", lat: 27.928, lng: 78.051, pincode: "202001", area: "Sarsol / GT Road" },
  { name: "Sasni Gate", lat: 27.873, lng: 78.071, pincode: "202001", area: "Sasni Gate" },
  { name: "Quarsi Bypass", lat: 27.925, lng: 78.115, pincode: "202001", area: "Quarsi Bypass" },
  { name: "Khair (Tehsil)", lat: 27.945, lng: 77.839, pincode: "202138", area: "Khair Tehsil" },
  { name: "Iglas (Tehsil)", lat: 27.712, lng: 77.935, pincode: "202124", area: "Iglas Tehsil" },
  { name: "Atrauli (Tehsil)", lat: 28.032, lng: 78.291, pincode: "202280", area: "Atrauli Tehsil" },
  { name: "Gabhana (Tehsil)", lat: 28.031, lng: 77.928, pincode: "202136", area: "Gabhana Tehsil" },
];

const InteractiveMapPicker = ({
  initialLat = 27.8974,
  initialLng = 78.088,
  initialAddress = "",
  initialCity = "Centre Point",
  initialPincode = "202001",
  onLocationSelect,
  onClose,
  isModal = false,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const pharmacyMarkerRef = useRef(null);

  const [coords, setCoords] = useState({
    lat: Number(initialLat) || 27.8974,
    lng: Number(initialLng) || 78.088,
  });

  const [addressDetails, setAddressDetails] = useState({
    city: initialCity || "Centre Point",
    pincode: initialPincode || "202001",
    streetAddress: initialAddress || "",
    fullAddress: initialAddress || `${initialCity}, Aligarh, Uttar Pradesh - ${initialPincode}`,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Calculate live estimate for current coords
  const estimate = getDeliveryEstimate({
    lat: coords.lat,
    lng: coords.lng,
    pincode: addressDetails.pincode,
    city: addressDetails.city,
    address: addressDetails.streetAddress,
  });

  // Reverse geocode or nearest Aligarh locality
  const resolveLocationInfo = useCallback(
    async (lat, lng, explicitName = "") => {
      setGeocoding(true);
      setStatusMessage("Pinning exact spot in Aligarh...");

      try {
        let detectedArea = explicitName;
        let detectedPincode = "202001";
        let detectedCity = "Aligarh";
        let fullStr = "";

        // 1. Check if matches custom Aligarh keyword list
        const customCheck = detectAligarhCustomLocation(explicitName || "");
        if (customCheck && customCheck.isDeliverable) {
          detectedArea = customCheck.area || explicitName;
          detectedPincode = customCheck.pincode || "202001";
        }

        // 2. Fetch OpenStreetMap reverse address
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            if (!detectedArea) {
              detectedArea =
                addr.suburb ||
                addr.neighbourhood ||
                addr.residential ||
                addr.road ||
                addr.village ||
                addr.quarter ||
                "Aligarh Area";
            }
            if (addr.postcode && addr.postcode.startsWith("202")) {
              detectedPincode = addr.postcode;
            }
            detectedCity = addr.city || addr.town || addr.county || "Aligarh";
            fullStr = data.display_name || "";
          }
        } catch (osmErr) {
          console.warn("OSM reverse error:", osmErr);
        }

        // Fallback to nearest area if not detected
        if (!detectedArea) {
          let minD = 9999;
          let nearest = ALIGARH_AREAS[0];
          ALIGARH_AREAS.forEach((a) => {
            const d = calculateDistanceKm(lat, lng, a.lat, a.lng);
            if (d < minD) {
              minD = d;
              nearest = a;
            }
          });
          detectedArea = nearest.name;
          detectedPincode = nearest.pincode;
        }

        setAddressDetails((prev) => ({
          ...prev,
          city: detectedArea,
          pincode: detectedPincode,
          fullAddress: fullStr || `${detectedArea}, Aligarh, UP - ${detectedPincode}`,
        }));

        setStatusMessage("");
      } catch (err) {
        console.error("Resolve location error:", err);
        setStatusMessage("");
      } finally {
        setGeocoding(false);
      }
    },
    []
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 14,
      zoomControl: false,
    });

    // Add clean tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    }).addTo(map);

    // Add zoom control in top-right
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    // Add Central Pharmacy Hub marker
    const hubIcon = L.divIcon({
      className: "pharmacy-hub-marker",
      html: `
        <div class="hub-pin-icon" title="MediDeliver Central Pharmacy Hub (Centre Point)">
          <div class="hub-core">🏥</div>
          <span class="hub-label">Hub</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    pharmacyMarkerRef.current = L.marker(
      [STORE_LOCATION.lat, STORE_LOCATION.lng],
      { icon: hubIcon }
    )
      .addTo(map)
      .bindPopup("<strong>🏥 MediDeliver Pharmacy Hub</strong><br/>Centre Point, Aligarh");

    // Add Delivery Location Draggable Marker
    const marker = L.marker([coords.lat, coords.lng], {
      icon: createPinIcon(addressDetails.city || "Delivery Spot"),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    markerRef.current = marker;

    // Marker drag end event
    marker.on("dragend", (e) => {
      const newPos = e.target.getLatLng();
      setCoords({ lat: newPos.lat, lng: newPos.lng });
      resolveLocationInfo(newPos.lat, newPos.lng);
    });

    // Map click event to relocate pin
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setCoords({ lat, lng });
      resolveLocationInfo(lat, lng);
    });

    mapInstanceRef.current = map;

    // Trigger map resize check
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position and label when coords/city changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      markerRef.current.setIcon(createPinIcon(addressDetails.city || "Delivery Spot"));
    }
  }, [coords.lat, coords.lng, addressDetails.city]);

  // Pan to position helper
  const flyToCoordinates = (lat, lng, zoom = 15, name = "") => {
    setCoords({ lat, lng });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.2,
      });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    resolveLocationInfo(lat, lng, name);
  };

  // Debounced search for custom locations
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const queryWithAligarh = searchQuery.toLowerCase().includes("aligarh")
          ? searchQuery
          : `${searchQuery}, Aligarh, Uttar Pradesh`;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            queryWithAligarh
          )}&limit=5`
        );
        let data = await response.json();

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
        console.error("Search error:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Instant Custom Match (e.g. user typed "Gular Road" or "Banna Devi Thana")
  const customDetect = detectAligarhCustomLocation(searchQuery);

  const handleSelectCustomMatch = (matchObj) => {
    if (!matchObj || !matchObj.isDeliverable) return;
    flyToCoordinates(matchObj.lat, matchObj.lng, 16, matchObj.area || searchQuery);
    setSearchQuery("");
    setSuggestions([]);
  };

  // Handle suggestion click
  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const areaName =
      item.address?.suburb ||
      item.address?.neighbourhood ||
      item.address?.road ||
      item.display_name.split(",")[0];

    flyToCoordinates(lat, lng, 16, areaName);
    setSearchQuery("");
    setSuggestions([]);
  };

  // GPS Locate Current Position
  const handleCurrentGPS = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation not supported by browser.");
      return;
    }
    setGeocoding(true);
    setStatusMessage("Getting current GPS position...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        flyToCoordinates(latitude, longitude, 16, "My Location");
        setGeocoding(false);
        setStatusMessage("");
      },
      (err) => {
        console.warn("GPS error:", err);
        setGeocoding(false);
        setStatusMessage("GPS permission denied. Please click on the map to pin.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Confirm selection
  const handleConfirmLocation = () => {
    const finalLocationData = {
      city: addressDetails.city,
      area: addressDetails.city,
      pincode: addressDetails.pincode,
      lat: coords.lat,
      lng: coords.lng,
      fullAddress: addressDetails.fullAddress,
      streetAddress: addressDetails.streetAddress || addressDetails.city,
      distanceKm: estimate.distanceKm,
      deliveryTime: estimate.deliveryTime,
      isDeliverable: estimate.isDeliverable,
    };

    if (onLocationSelect) {
      onLocationSelect(finalLocationData);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`interactive-map-picker ${isModal ? "map-picker-modal-mode" : "map-picker-inline-mode"}`}>
      {/* HEADER / CONTROLS */}
      <div className="map-picker-top-panel">
        <div className="map-picker-title-row">
          <div className="map-title-left">
            <div className="map-live-pulse-dot"></div>
            <MapPin className="map-pin-header-icon" />
            <div>
              <h3 className="map-main-heading">Pin Delivery Location on Map</h3>
              <p className="map-subheading">
                Search or drag the pin anywhere in Aligarh (Gular Road, Banna Devi, Civil Lines, etc.)
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              className="map-close-btn"
              onClick={onClose}
              title="Close Map"
            >
              <X className="map-close-ic" />
            </button>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="map-search-bar-wrap">
          <div className="map-search-input-box">
            <Search className="map-search-ic" />
            <input
              type="text"
              placeholder="Search Aligarh location (e.g. Gular Road, Banna Devi Thana, Centre Point)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="map-clear-search-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
              >
                <X className="map-clear-ic" />
              </button>
            )}
            {loadingSearch && <Loader2 className="map-spin-ic" />}
          </div>

          <button
            type="button"
            className="map-gps-btn"
            onClick={handleCurrentGPS}
            title="Locate Me via GPS"
          >
            <Crosshair className="gps-ic" />
            <span>Locate Me</span>
          </button>
        </div>

        {/* INSTANT CUSTOM DETECTION ALERT */}
        {searchQuery.trim().length >= 2 && customDetect && (
          <div
            className={`map-custom-match-banner ${
              customDetect.isDeliverable ? "match-deliverable" : "match-blocked"
            }`}
            onClick={() => handleSelectCustomMatch(customDetect)}
          >
            <Sparkles className="match-sparkle-ic" />
            <div className="match-text-col">
              <strong>Found Aligarh Locality: "{customDetect.area || searchQuery.trim()}"</strong>
              <span>
                {customDetect.isDeliverable
                  ? `⚡ ${customDetect.deliveryTime} delivery (~${customDetect.distanceKm} km from Pharmacy Hub)`
                  : "Outside Aligarh delivery radius"}
              </span>
            </div>
            {customDetect.isDeliverable && (
              <button type="button" className="match-fly-btn">
                Pin This Spot →
              </button>
            )}
          </div>
        )}

        {/* AUTOCOMPLETE SUGGESTIONS */}
        {suggestions.length > 0 && (
          <div className="map-suggestions-dropdown">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="map-sugg-item"
                onClick={() => handleSelectSuggestion(item)}
              >
                <MapPin className="sugg-pin-ic" />
                <div className="sugg-text">
                  <strong>{item.display_name.split(",")[0]}</strong>
                  <small>{item.display_name}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUICK LANDMARK PILLS */}
        <div className="map-quick-landmarks-row">
          <span className="landmarks-title">Popular Aligarh Spots:</span>
          <div className="landmarks-scroll-track">
            {POPULAR_QUICK_LANDMARKS.map((spot, idx) => (
              <button
                key={idx}
                type="button"
                className={`landmark-pill ${
                  addressDetails.city.toLowerCase().includes(spot.name.toLowerCase()) ||
                  spot.name.toLowerCase().includes(addressDetails.city.toLowerCase())
                    ? "active"
                    : ""
                }`}
                onClick={() => flyToCoordinates(spot.lat, spot.lng, 16, spot.name)}
              >
                <Building className="pill-ic" />
                <span>{spot.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LEAFLET MAP CONTAINER */}
      <div className="map-viewport-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-canvas" />

        {/* HINT OVERLAY */}
        <div className="map-instruction-overlay">
          <Info className="inst-ic" />
          <span>Tap anywhere or drag the green pin to adjust your exact doorstep</span>
        </div>

        {/* STATUS LOADER */}
        {geocoding && (
          <div className="map-floating-geocoder-badge">
            <Loader2 className="geo-spin" />
            <span>{statusMessage || "Updating location..."}</span>
          </div>
        )}
      </div>

      {/* FOOTER SUMMARY & CONFIRMATION */}
      <div className="map-picker-footer">
        <div className="pinned-spot-summary-card">
          <div className="pinned-spot-details">
            <div className="spot-title-row">
              <span className="spot-badge-pill">📍 Pinned Spot</span>
              <h4 className="spot-area-name">{addressDetails.city || "Aligarh Location"}</h4>
              <span className="spot-pincode">PIN: {addressDetails.pincode}</span>
            </div>
            <p className="spot-coords-text">
              Coords: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} • Central Pharmacy Hub: ~
              {estimate.distanceKm || "2.5"} km
            </p>
          </div>

          <div className="pinned-delivery-time-badge">
            <Clock className="pdt-ic" />
            <div>
              <span className="pdt-label">Est. Delivery</span>
              <strong className="pdt-time">{estimate.deliveryTime || "30-45 mins"}</strong>
            </div>
          </div>
        </div>

        <div className="map-picker-action-buttons">
          {onClose && (
            <button
              type="button"
              className="map-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className={`map-confirm-btn ${!estimate.isDeliverable ? "btn-disabled" : ""}`}
            onClick={handleConfirmLocation}
            disabled={!estimate.isDeliverable}
          >
            <Check className="check-ic" />
            <span>Confirm & Set Delivery Spot</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapPicker;
