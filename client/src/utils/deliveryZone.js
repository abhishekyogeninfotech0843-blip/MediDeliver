// ============================================================================
// MediDeliver Delivery Zone Configuration - Aligarh District (Uttar Pradesh)
// ============================================================================

// Central Pharmacy Hub (Centre Point / Civil Lines, Aligarh)
export const STORE_LOCATION = {
  name: "MediDeliver Aligarh Central Pharmacy",
  area: "Centre Point",
  city: "Aligarh",
  district: "Aligarh",
  state: "Uttar Pradesh",
  pincode: "202001",
  lat: 27.8974,
  lng: 78.088,
  maxDeliveryRadiusKm: 45, // Covers entire Aligarh district (all 5 tehsils)
};

// Curated Aligarh Localities, Suburbs & Tehsils with coordinates and pin codes
export const ALIGARH_AREAS = [
  // Tier 1: City Core (0 - 6 km) -> 30-45 mins
  {
    name: "Centre Point",
    type: "City Core",
    pincode: "202001",
    lat: 27.8974,
    lng: 78.088,
    approxDistanceKm: 1.0,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Civil Lines / AMU Campus",
    type: "City Core",
    pincode: "202002",
    lat: 27.9135,
    lng: 78.0782,
    approxDistanceKm: 2.5,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Ramghat Road",
    type: "City Core",
    pincode: "202001",
    lat: 27.904,
    lng: 78.0995,
    approxDistanceKm: 3.2,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Medical Road / JNMC",
    type: "City Core",
    pincode: "202002",
    lat: 27.918,
    lng: 78.075,
    approxDistanceKm: 3.8,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Marris Road",
    type: "City Core",
    pincode: "202001",
    lat: 27.9015,
    lng: 78.083,
    approxDistanceKm: 1.8,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Railway Station / GT Road",
    type: "City Core",
    pincode: "202001",
    lat: 27.891,
    lng: 78.079,
    approxDistanceKm: 2.2,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Sasni Gate",
    type: "City Core",
    pincode: "202001",
    lat: 27.873,
    lng: 78.071,
    approxDistanceKm: 4.5,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Banna Devi / Thana",
    type: "City Core",
    pincode: "202001",
    lat: 27.8926,
    lng: 78.0645,
    approxDistanceKm: 2.8,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Gular Road / Achal Taal",
    type: "City Core",
    pincode: "202001",
    lat: 27.8965,
    lng: 78.0712,
    approxDistanceKm: 2.1,
    deliveryTime: "30-45 mins",
  },
  {
    name: "Delhi Gate",
    type: "City Core",
    pincode: "202001",
    lat: 27.899,
    lng: 78.062,
    approxDistanceKm: 3.6,
    deliveryTime: "30-45 mins",
  },

  // Tier 2: Suburbs & Outer City (6 - 15 km) -> 45-90 mins
  {
    name: "Quarsi Bypass",
    type: "Suburbs",
    pincode: "202001",
    lat: 27.925,
    lng: 78.115,
    approxDistanceKm: 6.2,
    deliveryTime: "45-90 mins",
  },
  {
    name: "Tala Nagri Industrial Area",
    type: "Suburbs",
    pincode: "202001",
    lat: 27.935,
    lng: 78.132,
    approxDistanceKm: 8.5,
    deliveryTime: "45-90 mins",
  },
  {
    name: "Sarsol / GT Road",
    type: "Suburbs",
    pincode: "202001",
    lat: 27.928,
    lng: 78.051,
    approxDistanceKm: 7.2,
    deliveryTime: "45-90 mins",
  },
  {
    name: "Dhanipur / Airport Road",
    type: "Suburbs",
    pincode: "202002",
    lat: 27.872,
    lng: 78.135,
    approxDistanceKm: 9.8,
    deliveryTime: "45-90 mins",
  },
  {
    name: "Lodha",
    type: "Suburbs",
    pincode: "202140",
    lat: 27.854,
    lng: 78.005,
    approxDistanceKm: 11.5,
    deliveryTime: "45-90 mins",
  },
  {
    name: "Harduaganj",
    type: "Suburbs",
    pincode: "202125",
    lat: 27.942,
    lng: 78.181,
    approxDistanceKm: 13.8,
    deliveryTime: "45-90 mins",
  },

  // Tier 3: Tehsil Towns & Rural Hubs (15 - 30 km) -> 2-3 hours
  {
    name: "Gabhana (Tehsil)",
    type: "Tehsil Hub",
    pincode: "202136",
    lat: 28.031,
    lng: 77.928,
    approxDistanceKm: 21.0,
    deliveryTime: "2-3 hours",
  },
  {
    name: "Iglas (Tehsil)",
    type: "Tehsil Hub",
    pincode: "202124",
    lat: 27.712,
    lng: 77.935,
    approxDistanceKm: 26.5,
    deliveryTime: "2-3 hours",
  },
  {
    name: "Jawan Sikandarpur",
    type: "Town",
    pincode: "202126",
    lat: 28.025,
    lng: 78.152,
    approxDistanceKm: 18.2,
    deliveryTime: "2-3 hours",
  },
  {
    name: "Chharra Rafatpur",
    type: "Town",
    pincode: "202130",
    lat: 27.971,
    lng: 78.361,
    approxDistanceKm: 29.0,
    deliveryTime: "2-3 hours",
  },

  // Tier 4: Outer Tehsils & District Borders (30 - 45 km) -> 3-5 hours
  {
    name: "Khair (Tehsil)",
    type: "Tehsil Hub",
    pincode: "202138",
    lat: 27.945,
    lng: 77.839,
    approxDistanceKm: 33.5,
    deliveryTime: "3-5 hours",
  },
  {
    name: "Atrauli (Tehsil)",
    type: "Tehsil Hub",
    pincode: "202280",
    lat: 28.032,
    lng: 78.291,
    approxDistanceKm: 34.0,
    deliveryTime: "3-5 hours",
  },
  {
    name: "Beswan",
    type: "Border Town",
    pincode: "202145",
    lat: 27.653,
    lng: 77.886,
    approxDistanceKm: 36.2,
    deliveryTime: "3-5 hours",
  },
  {
    name: "Tappal (Near Yamuna Expressway)",
    type: "Border Town",
    pincode: "202165",
    lat: 28.064,
    lng: 77.674,
    approxDistanceKm: 43.0,
    deliveryTime: "3-5 hours",
  },
];

// Valid Postal PIN codes for Aligarh district (202xxx series)
export const ALIGARH_PINCODE_MAP = {
  "202001": { area: "Aligarh City / Centre Point", distanceKm: 1.5 },
  "202002": { area: "Civil Lines / AMU Campus", distanceKm: 3.0 },
  "202124": { area: "Iglas Tehsil", distanceKm: 26.5 },
  "202125": { area: "Harduaganj", distanceKm: 14.0 },
  "202126": { area: "Jawan Sikandarpur", distanceKm: 18.5 },
  "202130": { area: "Chharra Rafatpur", distanceKm: 29.0 },
  "202136": { area: "Gabhana Tehsil", distanceKm: 21.0 },
  "202138": { area: "Khair Tehsil", distanceKm: 33.5 },
  "202140": { area: "Lodha", distanceKm: 11.5 },
  "202145": { area: "Beswan", distanceKm: 36.0 },
  "202165": { area: "Tappal", distanceKm: 43.0 },
  "202280": { area: "Atrauli Tehsil", distanceKm: 34.0 },
  "202281": { area: "Barla Atrauli", distanceKm: 38.0 },
};

// ============================================================================
// Haversine Distance Formula (Coordinates to Kilometers)
// ============================================================================
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
};

// ============================================================================
// Determine Delivery Eligibility & Dynamic Time
// ============================================================================
export const getDeliveryEstimate = ({ lat, lng, pincode, city, address }) => {
  let distance = null;

  // 1. Calculate from coordinates if available
  if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
    distance = calculateDistanceKm(
      STORE_LOCATION.lat,
      STORE_LOCATION.lng,
      Number(lat),
      Number(lng)
    );
  }

  // 2. Fallback distance from known PIN code if coordinates not provided
  const cleanPin = String(pincode || "").trim();
  if (distance === null && ALIGARH_PINCODE_MAP[cleanPin]) {
    distance = ALIGARH_PINCODE_MAP[cleanPin].distanceKm;
  }

  // 3. String based checks for non-Aligarh cities (e.g., Delhi, Noida, Gurgaon, Mumbai)
  const fullText = `${city || ""} ${address || ""}`.toLowerCase();
  const nonAligarhCities = [
    "delhi",
    "noida",
    "gurgaon",
    "gurugram",
    "faridabad",
    "mumbai",
    "bengaluru",
    "bangalore",
    "lucknow",
    "kanpur",
    "jaipur",
    "chandigarh",
    "pune",
    "hyderabad",
    "kolkata",
  ];

  const mentionsOtherCity = nonAligarhCities.some((c) =>
    fullText.includes(c)
  );

  // If PIN code is definitely outside Aligarh (not 202xxx)
  const isInvalidPin =
    cleanPin.length === 6 &&
    (!cleanPin.startsWith("202") || !ALIGARH_PINCODE_MAP[cleanPin]);

  // If coordinates show distance > 45 km OR non-Aligarh city explicitly mentioned
  if (
    (distance !== null && distance > STORE_LOCATION.maxDeliveryRadiusKm) ||
    (mentionsOtherCity && !fullText.includes("aligarh")) ||
    (isInvalidPin && distance === null)
  ) {
    return {
      isDeliverable: false,
      distanceKm: distance,
      deliveryTime: "Not Deliverable",
      deliveryBadge: "Out of Service Area",
      tier: null,
      message:
        "Delivery not available at this location. Currently, MediDeliver operates exclusively within Aligarh District (up to 45 km from our central pharmacy).",
    };
  }

  // If distance is still not determined but mentions Aligarh, assume average city distance (4 km)
  if (distance === null) {
    distance = 4.0;
  }

  // Distance Tiers
  if (distance <= 6) {
    return {
      isDeliverable: true,
      distanceKm: distance,
      deliveryTime: "30-45 mins",
      deliveryBadge: "⚡ Express 30-45 Mins",
      tier: 1,
      tag: "City Express Zone",
      message: "Express 30-45 minutes delivery available in Aligarh City!",
    };
  } else if (distance <= 15) {
    return {
      isDeliverable: true,
      distanceKm: distance,
      deliveryTime: "45-90 mins",
      deliveryBadge: "🛵 Fast 45-90 Mins",
      tier: 2,
      tag: "Aligarh Suburbs",
      message: "Fast delivery within 45 to 90 minutes to outer Aligarh.",
    };
  } else if (distance <= 30) {
    return {
      isDeliverable: true,
      distanceKm: distance,
      deliveryTime: "2-3 hours",
      deliveryBadge: "🚗 Same-Day (2-3 hrs)",
      tier: 3,
      tag: "Tehsil Express",
      message: "Same-day delivery in 2 to 3 hours to Aligarh Tehsil towns.",
    };
  } else if (distance <= 45) {
    return {
      isDeliverable: true,
      distanceKm: distance,
      deliveryTime: "3-5 hours",
      deliveryBadge: "📦 Same-Day (3-5 hrs)",
      tier: 4,
      tag: "Outer Tehsil Delivery",
      message: "Same-day delivery in 3 to 5 hours to outer Aligarh district.",
    };
  } else {
    return {
      isDeliverable: false,
      distanceKm: distance,
      deliveryTime: "Not Deliverable",
      deliveryBadge: "Out of Service Area",
      tier: null,
      message: `Selected address is ${distance} km away. MediDeliver only delivers within 45 km radius of Aligarh pharmacy hub.`,
    };
  }
};

// ============================================================================
// Detect & Parse Custom Aligarh Locality / Colony / Landmark
// ============================================================================
export const detectAligarhCustomLocation = (customInput) => {
  if (!customInput || typeof customInput !== "string") return null;
  const text = customInput.trim();
  if (text.length < 2) return null;

  const lower = text.toLowerCase();

  // 1. Check if user typed a city outside Aligarh
  const nonAligarhCities = [
    "delhi",
    "noida",
    "gurgaon",
    "gurugram",
    "faridabad",
    "mumbai",
    "bengaluru",
    "bangalore",
    "lucknow",
    "kanpur",
    "jaipur",
    "chandigarh",
    "pune",
    "hyderabad",
    "kolkata",
    "agra",
    "mathura",
    "hathras",
    "bulandshahr",
    "meerut",
    "ghaziabad",
  ];

  const mentionsNonAligarh = nonAligarhCities.some((c) => lower.includes(c));
  if (mentionsNonAligarh && !lower.includes("aligarh")) {
    return {
      isDeliverable: false,
      name: text,
      fullAddress: text,
      distanceKm: null,
      deliveryTime: "Not Deliverable",
      deliveryBadge: "Outside Service Area",
      message: `Delivery not available for "${text}". MediDeliver operates exclusively within Aligarh District (up to 45 km radius).`,
    };
  }

  // 2. Keyword mapping for Aligarh localities, colonies, roads, and tehsils
  const ALIGARH_KEYWORD_RULES = [
    // Sarsol / GT Road (Sai Vihar Colony, Masoodabad, etc.)
    {
      keywords: [
        "sarsol",
        "sai vihar",
        "sai vihar colony",
        "masoodabad",
        "grand trunk",
        "gt road",
        "bhagwan nagar",
        "krishna vihar sarsol",
      ],
      matchedArea: "Sarsol / GT Road",
      pincode: "202001",
      lat: 27.928,
      lng: 78.051,
      distanceKm: 7.2,
      deliveryTime: "45-90 mins",
      badge: "🛵 Fast 45-90 Mins",
    },
    // Ramghat Road / Swarn Jayanti / Surendra Nagar / Kishanpur
    {
      keywords: [
        "ramghat",
        "ram ghat",
        "swarn jayanti",
        "surendra nagar",
        "kishanpur",
        "atal chungi",
        "meenakshi",
        "ganga dham",
        "vidya nagar",
      ],
      matchedArea: "Ramghat Road",
      pincode: "202001",
      lat: 27.904,
      lng: 78.0995,
      distanceKm: 3.2,
      deliveryTime: "30-45 mins",
      badge: "⚡ Express 30-45 Mins",
    },
    // Civil Lines / AMU / Dodhpur / Medical Road
    {
      keywords: [
        "civil lines",
        "amu",
        "university",
        "medical road",
        "medical college",
        "jnmc",
        "dodhpur",
        "shamshad",
        "purani chungi",
        "zakir nagar",
        "tika ram",
      ],
      matchedArea: "Civil Lines / AMU Campus",
      pincode: "202002",
      lat: 27.9135,
      lng: 78.0782,
      distanceKm: 2.5,
      deliveryTime: "30-45 mins",
      badge: "⚡ Express 30-45 Mins",
    },
    // Centre Point / Marris Road / Samad Road
    {
      keywords: [
        "centre point",
        "center point",
        "samad road",
        "marris road",
        "maris road",
        "railway road",
        "tasveer mahal",
      ],
      matchedArea: "Centre Point",
      pincode: "202001",
      lat: 27.8974,
      lng: 78.088,
      distanceKm: 1.0,
      deliveryTime: "30-45 mins",
      badge: "⚡ Express 30-45 Mins",
    },
    // Quarsi / Tala Nagri / Bypass
    {
      keywords: [
        "quarsi",
        "kwarsi",
        "tala nagri",
        "talanagri",
        "bypass",
        "ramghat bypass",
        "manzoor garhi",
      ],
      matchedArea: "Quarsi Bypass / Tala Nagri",
      pincode: "202001",
      lat: 27.925,
      lng: 78.115,
      distanceKm: 6.5,
      deliveryTime: "45-90 mins",
      badge: "🛵 Fast 45-90 Mins",
    },
    // Banna Devi / Banna Devi Thana
    {
      keywords: [
        "banna devi",
        "banna devi thana",
        "bannadevi",
        "bannadevi thana",
        "police station banna devi",
        "banna devi chauraha",
        "banna devi police station",
      ],
      matchedArea: "Banna Devi / Thana",
      pincode: "202001",
      lat: 27.8926,
      lng: 78.0645,
      distanceKm: 2.8,
      deliveryTime: "30-45 mins",
      badge: "⚡ Express 30-45 Mins",
    },
    // Gular Road / Achal Taal
    {
      keywords: [
        "gular road",
        "gularroad",
        "gular road aligarh",
        "gular rod",
        "achal taal",
        "achal tal",
      ],
      matchedArea: "Gular Road / Achal Taal",
      pincode: "202001",
      lat: 27.8965,
      lng: 78.0712,
      distanceKm: 2.1,
      deliveryTime: "30-45 mins",
      badge: "⚡ Express 30-45 Mins",
    },
    // Railway Station / Old City / Ghanta Ghar
    {
      keywords: [
        "railway station",
        "station",
        "ghanta ghar",
        "clock tower",
        "mahavir ganj",
        "kanhaiya ganj",
        "upper fort",
        "kotwali",
      ],
      matchedArea: "Railway Station / GT Road",
      pincode: "202001",
      lat: 27.891,
      lng: 78.079,
      distanceKm: 2.2,
      deliveryTime: "30-45 mins",
      badge: "⚡ Express 30-45 Mins",
    },
    // Sasni Gate / Delhi Gate / Mathura Road / Hathras Road
    {
      keywords: [
        "sasni gate",
        "delhi gate",
        "madar gate",
        "turkman gate",
        "agra road",
        "mathura road",
        "hathras road",
        "pala sahibabad",
        "delhi road",
      ],
      matchedArea: "Sasni Gate / Delhi Gate",
      pincode: "202001",
      lat: 27.873,
      lng: 78.071,
      distanceKm: 4.0,
      deliveryTime: "30-45 mins",
      badge: "⚡ Express 30-45 Mins",
    },
    // Dhanipur / Airport
    {
      keywords: ["dhanipur", "airport", "etah road", "etah chungi"],
      matchedArea: "Dhanipur / Airport Road",
      pincode: "202002",
      lat: 27.872,
      lng: 78.135,
      distanceKm: 9.8,
      deliveryTime: "45-90 mins",
      badge: "🛵 Fast 45-90 Mins",
    },
    // Lodha
    {
      keywords: ["lodha", "karsua"],
      matchedArea: "Lodha",
      pincode: "202140",
      lat: 27.854,
      lng: 78.005,
      distanceKm: 11.5,
      deliveryTime: "45-90 mins",
      badge: "🛵 Fast 45-90 Mins",
    },
    // Harduaganj / Qasimpur / Jawan
    {
      keywords: ["harduaganj", "qasimpur", "jawan", "kasimpur"],
      matchedArea: "Harduaganj / Jawan",
      pincode: "202125",
      lat: 27.942,
      lng: 78.181,
      distanceKm: 14.5,
      deliveryTime: "45-90 mins",
      badge: "🛵 Fast 45-90 Mins",
    },
    // Gabhana Tehsil / Somna
    {
      keywords: ["gabhana", "somna", "khair bypass"],
      matchedArea: "Gabhana (Tehsil)",
      pincode: "202136",
      lat: 28.031,
      lng: 77.928,
      distanceKm: 21.0,
      deliveryTime: "2-3 hours",
      badge: "🚗 Same-Day (2-3 hrs)",
    },
    // Iglas Tehsil / Beswan
    {
      keywords: ["iglas", "beswan", "gorai", "hathras border"],
      matchedArea: "Iglas (Tehsil)",
      pincode: "202124",
      lat: 27.712,
      lng: 77.935,
      distanceKm: 26.5,
      deliveryTime: "2-3 hours",
      badge: "🚗 Same-Day (2-3 hrs)",
    },
    // Khair Tehsil / Tappal
    {
      keywords: ["khair", "tappal", "yamuna expressway", "jewar road"],
      matchedArea: "Khair (Tehsil)",
      pincode: "202138",
      lat: 27.945,
      lng: 77.839,
      distanceKm: 33.5,
      deliveryTime: "3-5 hours",
      badge: "📦 Same-Day (3-5 hrs)",
    },
    // Atrauli Tehsil / Chharra
    {
      keywords: ["atrauli", "chharra", "barla", "narora road"],
      matchedArea: "Atrauli (Tehsil)",
      pincode: "202280",
      lat: 28.032,
      lng: 78.291,
      distanceKm: 34.0,
      deliveryTime: "3-5 hours",
      badge: "📦 Same-Day (3-5 hrs)",
    },
  ];

  // Capitalize words cleanly
  const formattedTitle = text
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

  // Try matching any keyword
  for (const rule of ALIGARH_KEYWORD_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return {
        isDeliverable: true,
        name: formattedTitle,
        area: formattedTitle,
        subArea: rule.matchedArea,
        city: "Aligarh",
        district: "Aligarh",
        state: "Uttar Pradesh",
        pincode: rule.pincode,
        lat: rule.lat,
        lng: rule.lng,
        distanceKm: rule.distanceKm,
        deliveryTime: rule.deliveryTime,
        deliveryBadge: rule.badge,
        fullAddress: `${formattedTitle}, ${rule.matchedArea}, Aligarh, Uttar Pradesh - ${rule.pincode}`,
        message: `Detected near ${rule.matchedArea} (~${rule.distanceKm} km from Pharmacy). Estimated delivery: ${rule.deliveryTime}.`,
      };
    }
  }

  // 3. If no specific keyword matched, treat as an Aligarh custom colony/mohalla
  return {
    isDeliverable: true,
    name: formattedTitle,
    area: formattedTitle,
    subArea: "Aligarh City Core",
    city: "Aligarh",
    district: "Aligarh",
    state: "Uttar Pradesh",
    pincode: "202001",
    lat: 27.8974,
    lng: 78.088,
    distanceKm: 4.5,
    deliveryTime: "30-45 mins",
    deliveryBadge: "⚡ Express 30-45 Mins",
    fullAddress: `${formattedTitle}, Aligarh, Uttar Pradesh - 202001`,
    message: `Custom Aligarh location detected (~4.5 km from Pharmacy). Express delivery: 30-45 mins.`,
  };
};

