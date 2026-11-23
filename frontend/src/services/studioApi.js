import { request } from "./api.js";
import { getBookings } from "./bookingApi.js";

const USER_STUDIOS_STORAGE_KEY = "podsphere_user_studios";
const DELETED_DEMO_STUDIOS_KEY = "podsphere_deleted_demo_studios";
const MODIFIED_DEMO_STUDIOS_KEY = "podsphere_modified_demo_studios";
const isApiMode =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_USE_API === "true";

const DEMO_STUDIOS = [
  {
    id: "st-001",
    name: "Echo Room Studio",
    city: "Delhi",
    address: "Suite 402, Okhla Phase III, Industrial Area, New Delhi",
    hourlyRate: 1500,
    description: "Treated acoustic broadcast space with multi-camera live switching and Shure vocal microphones.",
    gear: ["4x Shure SM7B", "Rodecaster Pro II", "2x Blackmagic 4K", "Sound Booth"],
    equipment: ["4x Shure SM7B", "Rodecaster Pro II", "2x Blackmagic 4K", "Sound Booth"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW",
    status: "LIVE READY",
    providerId: "usr-provider-1",
    createdAt: "2026-09-14T10:00:00Z",
    isDemo: true,
  },
  {
    id: "st-002",
    name: "Soundstage Precision Lab",
    city: "Mumbai",
    address: "Stage 4, Film City Complex, Goregaon East, Mumbai",
    hourlyRate: 2200,
    description: "High-ceiling industrial soundstage optimized for multi-guest interview podcasts and video shows.",
    gear: ["Sennheiser MKH 416", "Allen & Heath SQ-5", "Aputure 300d II Lighting", "Sony FX3 Rig"],
    equipment: ["Sennheiser MKH 416", "Allen & Heath SQ-5", "Aputure 300d II Lighting", "Sony FX3 Rig"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7oQaCfARyz3Z5Cfvozlp6-tuYUO8fjPj8HPPQ2HqOrrFpyXFTLQZO",
    status: "LIVE READY",
    providerId: "usr-provider-1",
    createdAt: "2026-09-22T14:30:00Z",
    isDemo: true,
  },
  {
    id: "st-003",
    name: "Metropolis Broadcast Lab",
    city: "Bengaluru",
    address: "77 Koramangala 4th Block, Bengaluru",
    hourlyRate: 1800,
    description: "Modular isolation suites with dedicated audio engineer monitoring and optical gigabit fiber.",
    gear: ["4x Neumann TLM-103", "Universal Audio Apollo x8p", "Genelec 8030C Monitors"],
    equipment: ["4x Neumann TLM-103", "Universal Audio Apollo x8p", "Genelec 8030C Monitors"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwSJXATKVh9I1RBqYTP7GErc6Dbo65xLusVDBfm8AQyzatSqj0pnxF",
    status: "LIVE READY",
    providerId: "usr-provider-1",
    createdAt: "2026-10-01T09:00:00Z",
    isDemo: true,
  },
];

function getUserStudios() {
  const stored = localStorage.getItem(USER_STUDIOS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserStudios(studios) {
  localStorage.setItem(USER_STUDIOS_STORAGE_KEY, JSON.stringify(studios));
}

function getDeletedDemoIds() {
  const stored = localStorage.getItem(DELETED_DEMO_STUDIOS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDeletedDemoIds(ids) {
  localStorage.setItem(DELETED_DEMO_STUDIOS_KEY, JSON.stringify(ids));
}

function getModifiedDemoStudios() {
  const stored = localStorage.getItem(MODIFIED_DEMO_STUDIOS_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveModifiedDemoStudios(map) {
  localStorage.setItem(MODIFIED_DEMO_STUDIOS_KEY, JSON.stringify(map));
}

function getAllStudios() {
  const userStudios = getUserStudios();
  const deletedDemoIds = getDeletedDemoIds();
  const modifiedDemoMap = getModifiedDemoStudios();

  const activeDemoStudios = DEMO_STUDIOS.filter(
    (s) => !deletedDemoIds.includes(String(s.id))
  ).map((s) => {
    if (modifiedDemoMap[s.id]) {
      return { ...s, ...modifiedDemoMap[s.id] };
    }
    return s;
  });

  return [...userStudios, ...activeDemoStudios];
}

export async function getStudios(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/studios?${query}` : "/studios";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.studios)) return data.studios;
    return [];
  }

  let studios = getAllStudios();

  if (filters.providerId) {
    studios = studios.filter((s) => String(s.providerId) === String(filters.providerId));
  }

  if (filters.city && filters.city !== "all" && filters.city !== "All Cities") {
    studios = studios.filter(
      (s) => s.city.toLowerCase() === filters.city.toLowerCase()
    );
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    studios = studios.filter((s) => {
      const matchName = s.name && s.name.toLowerCase().includes(q);
      const matchCity = s.city && s.city.toLowerCase().includes(q);
      const matchAddress = s.address && s.address.toLowerCase().includes(q);
      const matchDesc = s.description && s.description.toLowerCase().includes(q);
      const matchGear =
        Array.isArray(s.gear) &&
        s.gear.some((g) => typeof g === "string" && g.toLowerCase().includes(q));
      return matchName || matchCity || matchAddress || matchDesc || matchGear;
    });
  }

  if (filters.maxPrice) {
    const max = Number(filters.maxPrice);
    if (!isNaN(max) && max > 0) {
      studios = studios.filter((s) => Number(s.hourlyRate) <= max);
    }
  }

  return studios;
}

export async function getStudioById(id) {
  if (isApiMode) {
    const data = await request(`/studios/${id}`);
    if (data && (data.studio || data.id)) return data.studio || data;
    const error = new Error(`Studio with id ${id} not found`);
    error.status = 404;
    throw error;
  }

  const studios = getAllStudios();
  const found = studios.find((s) => String(s.id) === String(id));
  if (!found) {
    const error = new Error(`Studio with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return found;
}

export async function createStudio(studioData) {
  const trimmedName = (studioData.name || "").trim();
  const trimmedAddress = (studioData.address || "").trim();
  const trimmedDesc = (studioData.description || "").trim();
  const numRate = Number(studioData.hourlyRate);

  if (!trimmedName) {
    const error = new Error("Studio name is required.");
    error.status = 400;
    throw error;
  }

  if (!studioData.city) {
    const error = new Error("Studio city is required.");
    error.status = 400;
    throw error;
  }

  if (!trimmedAddress) {
    const error = new Error("Studio address is required.");
    error.status = 400;
    throw error;
  }

  if (!numRate || numRate <= 0) {
    const error = new Error("Hourly rate must be a valid positive number.");
    error.status = 400;
    throw error;
  }

  if (!trimmedDesc) {
    const error = new Error("Studio description is required.");
    error.status = 400;
    throw error;
  }

  if (isApiMode) {
    const data = await request("/studios", {
      method: "POST",
      body: JSON.stringify(studioData),
    });
    if (data && (data.studio || data.id)) return data.studio || data;
    const error = new Error("Failed to create studio on server.");
    error.status = 502;
    throw error;
  }

  const userStudios = getUserStudios();
  const gearList = Array.isArray(studioData.gear)
    ? studioData.gear
    : Array.isArray(studioData.equipment)
    ? studioData.equipment
    : [];

  const newStudio = {
    id: `st-${Date.now()}`,
    name: trimmedName,
    city: studioData.city,
    address: trimmedAddress,
    hourlyRate: numRate,
    description: trimmedDesc,
    gear: gearList,
    equipment: gearList,
    imageUrl:
      studioData.imageUrl ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Js5asS-K45ETzqtnRCzez9QWi4Sf9mwbsY7UZTFsPEh_BK_4nfW",
    status: studioData.status || "LIVE READY",
    providerId: studioData.providerId || "usr-provider-1",
    createdAt: new Date().toISOString(),
    isDemo: false,
  };

  userStudios.unshift(newStudio);
  saveUserStudios(userStudios);
  return newStudio;
}

export async function updateStudio(id, studioData) {
  const trimmedName = (studioData.name || "").trim();
  const trimmedAddress = (studioData.address || "").trim();
  const trimmedDesc = (studioData.description || "").trim();
  const numRate = Number(studioData.hourlyRate);

  if (!trimmedName) {
    const error = new Error("Studio name is required.");
    error.status = 400;
    throw error;
  }

  if (!studioData.city || !String(studioData.city).trim()) {
    const error = new Error("Studio city is required.");
    error.status = 400;
    throw error;
  }

  if (!numRate || numRate <= 0) {
    const error = new Error("Hourly rate must be a valid positive number.");
    error.status = 400;
    throw error;
  }

  if (isApiMode) {
    const data = await request(`/studios/${id}`, {
      method: "PUT",
      body: JSON.stringify(studioData),
    });
    if (data && (data.studio || data.id)) return data.studio || data;
    const error = new Error("Failed to update studio on server.");
    error.status = 502;
    throw error;
  }

  const userStudios = getUserStudios();
  const userIndex = userStudios.findIndex((s) => String(s.id) === String(id));

  const gearList = Array.isArray(studioData.gear)
    ? studioData.gear
    : Array.isArray(studioData.equipment)
    ? studioData.equipment
    : [];

  if (userIndex !== -1) {
    if (studioData.providerId && userStudios[userIndex].providerId !== studioData.providerId) {
      const error = new Error("Unauthorized: You can only update your own studios.");
      error.status = 403;
      throw error;
    }

    const updated = {
      ...userStudios[userIndex],
      ...studioData,
      name: trimmedName,
      address: trimmedAddress || userStudios[userIndex].address,
      description: trimmedDesc || userStudios[userIndex].description,
      hourlyRate: numRate,
      gear: gearList.length > 0 ? gearList : userStudios[userIndex].gear,
      equipment: gearList.length > 0 ? gearList : userStudios[userIndex].equipment,
      updatedAt: new Date().toISOString(),
    };

    userStudios[userIndex] = updated;
    saveUserStudios(userStudios);
    return updated;
  }

  const demoStudio = DEMO_STUDIOS.find((s) => String(s.id) === String(id));
  if (demoStudio) {
    const modifiedMap = getModifiedDemoStudios();
    const updated = {
      ...demoStudio,
      ...modifiedMap[id],
      ...studioData,
      name: trimmedName,
      hourlyRate: numRate,
      updatedAt: new Date().toISOString(),
    };
    modifiedMap[id] = updated;
    saveModifiedDemoStudios(modifiedMap);
    return updated;
  }

  const error = new Error(`Studio with id ${id} not found`);
  error.status = 404;
  throw error;
}

export async function deleteStudio(id, providerId) {
  const allBookings = await getBookings();
  const activeBookings = allBookings.filter(
    (b) => String(b.studioId) === String(id) && (b.status === "CONFIRMED" || b.status === "PENDING")
  );

  if (activeBookings.length > 0) {
    const error = new Error("A studio with active or scheduled bookings cannot be deleted.");
    error.status = 400;
    throw error;
  }

  if (isApiMode) {
    await request(`/studios/${id}`, { method: "DELETE" });
    return { success: true };
  }

  const userStudios = getUserStudios();
  const userIndex = userStudios.findIndex((s) => String(s.id) === String(id));

  if (userIndex !== -1) {
    if (providerId && userStudios[userIndex].providerId !== providerId) {
      const error = new Error("Unauthorized: You can only delete your own studios.");
      error.status = 403;
      throw error;
    }
    userStudios.splice(userIndex, 1);
    saveUserStudios(userStudios);
    return { success: true };
  }

  const demoStudio = DEMO_STUDIOS.find((s) => String(s.id) === String(id));
  if (demoStudio) {
    if (providerId && demoStudio.providerId !== providerId) {
      const error = new Error("Unauthorized: You can only delete your own studios.");
      error.status = 403;
      throw error;
    }
    const deletedDemoIds = getDeletedDemoIds();
    if (!deletedDemoIds.includes(String(id))) {
      deletedDemoIds.push(String(id));
      saveDeletedDemoIds(deletedDemoIds);
    }
    return { success: true };
  }

  const error = new Error(`Studio with id ${id} not found`);
  error.status = 404;
  throw error;
}
