import { request } from "./api.js";

const isApiMode =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_USE_API === "true") ||
  (typeof globalThis.process !== "undefined" &&
    globalThis.process.env &&
    globalThis.process.env.VITE_USE_API === "true");

const USER_RENTALS_STORAGE_KEY = "podsphere_user_rentals";

function getUserRentals() {
  const stored = localStorage.getItem(USER_RENTALS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserRentals(list) {
  localStorage.setItem(USER_RENTALS_STORAGE_KEY, JSON.stringify(list));
}

// Creator requests equipment rental
export async function createRental(payload) {
  if (isApiMode) {
    const data = await request("/rentals", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return data && (data.rental || data);
  }

  const userRentals = getUserRentals();
  const idNum = Math.floor(100 + Math.random() * 900);
  const newRental = {
    ...payload,
    id: `rnt-usr-${idNum}`,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    totalAmountFormatted: `₹${(Number(payload.totalAmount) || 0).toLocaleString("en-IN")}`
  };
  userRentals.unshift(newRental);
  saveUserRentals(userRentals);
  return newRental;
}

// Fetch rentals (role-aware)
export async function getRentals(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/rentals?${query}` : "/rentals";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.rentals)) return data.rentals;
    return [];
  }

  return getUserRentals();
}

// Creator rentals
export async function getCreatorRentals(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/rentals/creator?${query}` : "/rentals/creator";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.rentals)) return data.rentals;
    return [];
  }

  return getUserRentals();
}

// Provider rentals
export async function getProviderRentals(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/rentals/provider?${query}` : "/rentals/provider";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.rentals)) return data.rentals;
    return [];
  }

  return getUserRentals();
}

// Single rental details
export async function getRentalById(id) {
  if (isApiMode) {
    const data = await request(`/rentals/${id}`);
    if (data && (data.rental || data.id)) return data.rental || data;
    const err = new Error(`Rental with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const list = getUserRentals();
  const found = list.find((r) => String(r.id) === String(id));
  if (!found) {
    const err = new Error(`Rental with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return found;
}

// Provider updates rental status (e.g. APPROVED, REJECTED, ACTIVE, RETURNED, COMPLETED)
export async function updateRentalStatus(id, status, expectedCurrentStatus) {
  if (isApiMode) {
    const data = await request(`/rentals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, expectedCurrentStatus })
    });
    return data && (data.rental || data);
  }

  const list = getUserRentals();
  const idx = list.findIndex((r) => String(r.id) === String(id));
  if (idx !== -1) {
    const updated = { ...list[idx], status, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    saveUserRentals(list);
    return updated;
  }
  return { id, status };
}

// Creator or Provider cancels rental
export async function cancelRental(id, expectedCurrentStatus) {
  if (isApiMode) {
    const data = await request(`/rentals/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ expectedCurrentStatus })
    });
    return data && (data.rental || data);
  }

  const list = getUserRentals();
  const idx = list.findIndex((r) => String(r.id) === String(id));
  if (idx !== -1) {
    const updated = { ...list[idx], status: "CANCELLED", updatedAt: new Date().toISOString() };
    list[idx] = updated;
    saveUserRentals(list);
    return updated;
  }
  return { id, status: "CANCELLED" };
}
