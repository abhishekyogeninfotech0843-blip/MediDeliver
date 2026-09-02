// High quality, realistic medical product photos curated for pharmacy products
export const SPECIFIC_MEDICINE_IMAGES = [
  {
    // Combiflam / Painkillers / Tablet strips
    keywords: ["combiflam", "oxalgin", "dolo", "paracetamol", "crocin", "calpol", "flexon", "brufen", "disprin"],
    url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Nucoxia / Antibiotics / Capsule packs
    keywords: ["nucoxia", "amoxicillin", "azithromycin", "cfix", "augmentin", "zifi", "capsule", "antibiotic"],
    url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Syrups / Liquid Medicines (Benadryl, Honitus, Cough Syrups)
    keywords: ["syrup", "benadryl", "honitus", "cough", "madhuvaani", "alex", "ascoril", "zeet", "liquid"],
    url: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Ointment / Skin Creams (Soframycin, Betnovate, Ointments)
    keywords: ["soframycin", "cream", "ointment", "gel", "betnovate", "volini", "quadriderm", "tube", "lotion"],
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Vitamins & Supplements (Limcee, Becosules, Multivitamin)
    keywords: ["limcee", "becosules", "vitamin", "multivitamin", "zinc", "celfix", "evion", "revital", "chewable"],
    url: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Diabetes Care (Metformin, Glycomet, Janumet)
    keywords: ["metformin", "glycomet", "diabetes", "sugar", "janumet", "teneligliptin", "glimepiride"],
    url: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Heart & BP Care (Atorvastatin, Telmikind, Amlodipine)
    keywords: ["atorvastatin", "lupin", "heart", "telmikind", "amlodipine", "pantocid", "cholesterol"],
    url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Antacid & Gastric (Omeprazole, Pantoprazole, Digene, Gelusil)
    keywords: ["omeprazole", "pantoprazole", "digene", "gelusil", "eno", "antacid", "rabeprazole"],
    url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Allergy / Cold (Cetirizine, Allegra, Montair LC)
    keywords: ["cetirizine", "allegra", "montair", "cold", "allergy", "okacet", "levocetirizine"],
    url: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80"
  },
  {
    // Baby Care & Wipes
    keywords: ["baby", "wipes", "himalaya", "pampers", "diaper", "johnson"],
    url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80"
  }
];

export const CATEGORY_IMAGE_MAP = {
  "Medicines": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
  "Diabetes Care": "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80",
  "Vitamins & Supplements": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80",
  "Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
  "Baby Care": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80",
  "Heart Care": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
};

export const getMedicineImage = (medicine) => {
  if (!medicine) return CATEGORY_IMAGE_MAP["Medicines"];

  // 1. If explicit custom image URL is provided by admin
  if (medicine.image && typeof medicine.image === "string" && medicine.image.trim() !== "") {
    return medicine.image.trim();
  }
  if (medicine.imageUrl && typeof medicine.imageUrl === "string" && medicine.imageUrl.trim() !== "") {
    return medicine.imageUrl.trim();
  }

  const nameLower = (medicine.name || "").toLowerCase();
  const catLower = (medicine.category || "").toLowerCase();

  // 2. Match specific medicine keywords (Combiflam, Dolo, Oxalgin, Soframycin, Benadryl, etc.)
  for (const item of SPECIFIC_MEDICINE_IMAGES) {
    if (item.keywords.some((kw) => nameLower.includes(kw))) {
      return item.url;
    }
  }

  // 3. Match category
  for (const [catName, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (catLower.includes(catName.toLowerCase())) {
      return url;
    }
  }

  // 4. Default clean pharmacy medicine photo
  return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80";
};
