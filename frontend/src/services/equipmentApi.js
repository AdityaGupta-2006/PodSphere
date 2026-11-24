import { request } from "./api.js";

const isApiMode =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_USE_API === "true") ||
  (typeof globalThis.process !== "undefined" &&
    globalThis.process.env &&
    globalThis.process.env.VITE_USE_API === "true");

const DEMO_EQUIPMENT = [
  {
    id: "eq-001",
    name: "Shure SM7B Vocal Microphone",
    category: "Microphones",
    brand: "Shure",
    model: "SM7B",
    description: "Industry-standard dynamic microphone with flat, wide-range frequency response for clean spoken vocal capture.",
    condition: "LIKE_NEW",
    specifications: ["Dynamic Cartridge", "Cardioid Polar Pattern", "Internal Shock Isolation", "Bass Roll-Off & Mid-Range Controls"],
    city: "Delhi",
    address: "Okhla Phase III, Industrial Area, New Delhi",
    hourlyRate: 150,
    dailyRate: 900,
    pricingUnit: "HOURLY",
    minimumRentalHours: 2,
    maximumRentalHours: 72,
    totalQuantity: 4,
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW",
    isActive: true,
    isArchived: false,
    providerId: "usr-provider-1",
    provider: { id: "usr-provider-1", name: "Apex Audio Facilities" },
    createdAt: "2026-10-01T10:00:00Z"
  },
  {
    id: "eq-002",
    name: "Rodecaster Pro II Production Console",
    category: "Mixers",
    brand: "Rode",
    model: "Pro II",
    description: "Fully integrated audio production studio for podcasters and content creators with Revolution preamps and APHEX processing.",
    condition: "NEW",
    specifications: ["4x XLR/TRS Combo Inputs", "Ultra-Low-Noise Preamps", "Customizable SMART Pads", "Dual USB-C Audio Interfaces"],
    city: "Mumbai",
    address: "Film City Complex, Goregaon East, Mumbai",
    hourlyRate: 350,
    dailyRate: 2200,
    pricingUnit: "DAILY",
    minimumRentalHours: 24,
    maximumRentalHours: 168,
    totalQuantity: 2,
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuA7oQaCfARyz3Z5Cfvozlp6-tuYUO8fjPj8HPPQ2HqOrrFpyXFTLQZO"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7oQaCfARyz3Z5Cfvozlp6-tuYUO8fjPj8HPPQ2HqOrrFpyXFTLQZO",
    isActive: true,
    isArchived: false,
    providerId: "usr-provider-1",
    provider: { id: "usr-provider-1", name: "Soundstage Media" },
    createdAt: "2026-10-05T12:00:00Z"
  },
  {
    id: "eq-003",
    name: "Sony FX3 Full-Frame Cinema Camera",
    category: "Cameras",
    brand: "Sony",
    model: "ILME-FX3",
    description: "Compact 4K full-frame cinema camera with 15+ stops dynamic range, S-Cinetone, and active cooling for continuous recording.",
    condition: "LIKE_NEW",
    specifications: ["Full-Frame 12.1MP Sensor", "UHD 4K up to 120p", "10-Bit 4:2:2 XAVC S-I", "Top Handle with XLR Audio Unit"],
    city: "Bengaluru",
    address: "77 Koramangala 4th Block, Bengaluru",
    hourlyRate: 600,
    dailyRate: 3800,
    pricingUnit: "DAILY",
    minimumRentalHours: 24,
    maximumRentalHours: 336,
    totalQuantity: 2,
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDwSJXATKVh9I1RBqYTP7GErc6Dbo65xLusVDBfm8AQyzatSqj0pnxF"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwSJXATKVh9I1RBqYTP7GErc6Dbo65xLusVDBfm8AQyzatSqj0pnxF",
    isActive: true,
    isArchived: false,
    providerId: "usr-provider-2",
    provider: { id: "usr-provider-2", name: "Bangalore Broadcast Gear" },
    createdAt: "2026-10-10T14:00:00Z"
  },
  {
    id: "eq-004",
    name: "Aputure Light Storm 300d II Key Light",
    category: "Lighting",
    brand: "Aputure",
    model: "LS C300d II",
    description: "5500K daylight-balanced point-source LED fixture delivering high output with high CRI/TLCI 96+ color rendering.",
    condition: "GOOD",
    specifications: ["5500K Color Temp", "Bowens Mount", "0-100% Stepless Dimming", "Wireless 2.4G Remote & Sidus Link App"],
    city: "Delhi",
    address: "Hauz Khas Enclave, New Delhi",
    hourlyRate: 200,
    dailyRate: 1200,
    pricingUnit: "HOURLY",
    minimumRentalHours: 2,
    maximumRentalHours: 72,
    totalQuantity: 3,
    imageUrls: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW",
    isActive: true,
    isArchived: false,
    providerId: "usr-provider-1",
    provider: { id: "usr-provider-1", name: "Apex Audio Facilities" },
    createdAt: "2026-10-15T09:00:00Z"
  }
];

const USER_EQUIPMENT_STORAGE_KEY = "podsphere_user_equipment";

function getUserEquipment() {
  const stored = localStorage.getItem(USER_EQUIPMENT_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserEquipment(list) {
  localStorage.setItem(USER_EQUIPMENT_STORAGE_KEY, JSON.stringify(list));
}

// Fetch all marketplace equipment with pagination support
export async function getEquipment(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/equipment?${query}` : "/equipment";

  if (isApiMode) {
    const data = await request(endpoint);
    if (data && Array.isArray(data.equipment)) {
      return data;
    }
    if (Array.isArray(data)) return { equipment: data, pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
    return { equipment: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
  }

  let list = [...getUserEquipment(), ...DEMO_EQUIPMENT].filter((eq) => !eq.isArchived && eq.isActive);

  if (filters.category && filters.category !== "all" && filters.category !== "All Categories") {
    list = list.filter((eq) => eq.category.toLowerCase() === filters.category.toLowerCase());
  }

  if (filters.city && filters.city !== "all" && filters.city !== "All Cities") {
    list = list.filter((eq) => eq.city.toLowerCase() === filters.city.toLowerCase());
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter((eq) =>
      eq.name.toLowerCase().includes(q) ||
      eq.brand.toLowerCase().includes(q) ||
      eq.model.toLowerCase().includes(q) ||
      eq.description.toLowerCase().includes(q) ||
      eq.category.toLowerCase().includes(q)
    );
  }

  if (filters.maxPrice) {
    const max = Number(filters.maxPrice);
    if (!isNaN(max) && max > 0) {
      list = list.filter((eq) => {
        if (eq.pricingUnit === "HOURLY") return eq.hourlyRate !== null && eq.hourlyRate <= max;
        if (eq.pricingUnit === "DAILY") return eq.dailyRate !== null && eq.dailyRate <= max;
        return (eq.hourlyRate && eq.hourlyRate <= max) || (eq.dailyRate && eq.dailyRate <= max);
      });
    }
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 12));
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    equipment: paginated,
    pagination: { page, limit, total, totalPages }
  };
}

// Fetch single equipment by ID
export async function getEquipmentById(id) {
  if (isApiMode) {
    const data = await request(`/equipment/${id}`);
    if (data && (data.equipment || data.id)) return data.equipment || data;
    const err = new Error(`Equipment with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const all = [...getUserEquipment(), ...DEMO_EQUIPMENT];
  const found = all.find((eq) => String(eq.id) === String(id));
  if (!found) {
    const err = new Error(`Equipment with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return found;
}

// Provider: create equipment listing
export async function createEquipment(payload) {
  if (isApiMode) {
    const data = await request("/equipment", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return data && (data.equipment || data);
  }

  const userList = getUserEquipment();
  const idNum = Math.floor(100 + Math.random() * 900);
  const newEq = {
    ...payload,
    id: `eq-usr-${idNum}`,
    createdAt: new Date().toISOString(),
    isArchived: false,
    isActive: true,
    totalQuantity: Number(payload.totalQuantity) || 1,
    hourlyRate: payload.hourlyRate ? Number(payload.hourlyRate) : null,
    dailyRate: payload.dailyRate ? Number(payload.dailyRate) : null
  };
  userList.unshift(newEq);
  saveUserEquipment(userList);
  return newEq;
}

// Provider: update equipment listing
export async function updateEquipment(id, payload) {
  if (isApiMode) {
    const data = await request(`/equipment/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return data && (data.equipment || data);
  }

  const userList = getUserEquipment();
  const idx = userList.findIndex((eq) => String(eq.id) === String(id));
  if (idx !== -1) {
    const updated = { ...userList[idx], ...payload, updatedAt: new Date().toISOString() };
    userList[idx] = updated;
    saveUserEquipment(userList);
    return updated;
  }
  return { id, ...payload };
}

// Provider: delete equipment listing
export async function deleteEquipment(id) {
  if (isApiMode) {
    const data = await request(`/equipment/${id}`, {
      method: "DELETE"
    });
    return data;
  }

  let userList = getUserEquipment();
  userList = userList.filter((eq) => String(eq.id) !== String(id));
  saveUserEquipment(userList);
  return { success: true, id };
}

// Provider: get own equipment listings
export async function getProviderEquipment(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/provider/equipment?${query}` : "/provider/equipment";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.equipment)) return data.equipment;
    return [];
  }

  return getUserEquipment();
}

// Check availability for equipment in a given interval
export async function checkAvailability(id, startTime, endTime) {
  if (isApiMode) {
    const query = new URLSearchParams({ startTime, endTime }).toString();
    return await request(`/equipment/${id}/availability?${query}`);
  }

  const list = [...getUserEquipment(), ...DEMO_EQUIPMENT];
  const eq = list.find((item) => String(item.id) === String(id));
  if (!eq) {
    const err = new Error(`Equipment with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return {
    equipmentId: id,
    startTime,
    endTime,
    totalQuantity: eq.totalQuantity || 1,
    reservedQuantity: 0,
    availableQuantity: eq.totalQuantity || 1,
    isAvailable: true
  };
}
