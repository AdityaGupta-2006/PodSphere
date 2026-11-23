import { request } from "./api.js";

const USER_BOOKINGS_STORAGE_KEY = "podsphere_user_bookings";
const MODIFIED_BOOKINGS_STORAGE_KEY = "podsphere_modified_bookings";
const isApiMode =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_USE_API === "true") ||
  (typeof globalThis.process !== "undefined" &&
    globalThis.process.env &&
    globalThis.process.env.VITE_USE_API === "true");

const DEMO_BOOKINGS = [
  {
    id: "BKG-2026-DEL-094",
    studioId: "st-001",
    studio: "Echo Room Studio",
    location: "Delhi • Suite 402, Okhla Phase III",
    city: "Delhi",
    creatorId: "usr-creator-1",
    creatorName: "Alex Miller",
    creatorEmail: "alex@podcaster.com",
    date: "Nov 25, 2026",
    rawDate: "2026-11-25",
    day: "Wednesday",
    time: "10:00 AM - 12:00 PM",
    duration: "2.0 Hours Allocated",
    rate: "₹1,500/hr rack rate",
    amount: "₹3,000",
    rawAmount: 3000,
    status: "CONFIRMED",
    paymentStatus: "PAID ESCROW",
    icon: "mic",
    createdAt: "2026-10-20T10:00:00Z",
    isDemo: true,
  },
  {
    id: "BKG-2026-MUM-033",
    studioId: "st-002",
    studio: "Soundstage Precision Lab",
    location: "Mumbai • Stage 4, Film City Complex",
    city: "Mumbai",
    creatorId: "usr-creator-1",
    creatorName: "Alex Miller",
    creatorEmail: "alex@podcaster.com",
    date: "Nov 28, 2026",
    rawDate: "2026-11-28",
    day: "Saturday",
    time: "14:00 - 16:00",
    duration: "2.0 Hours Allocated",
    rate: "₹2,200/hr rack rate",
    amount: "₹4,400",
    rawAmount: 4400,
    status: "CONFIRMED",
    paymentStatus: "PAID ESCROW",
    icon: "graphic_eq",
    createdAt: "2026-10-22T11:00:00Z",
    isDemo: true,
  },
  {
    id: "BKG-2026-DEL-104",
    studioId: "st-001",
    studio: "Echo Room Studio",
    location: "Delhi • Suite 402, Okhla Phase III",
    city: "Delhi",
    creatorId: "usr-creator-2",
    creatorName: "Jordan Miller",
    creatorEmail: "engineer@domain.com",
    date: "Dec 02, 2026",
    rawDate: "2026-12-02",
    day: "Wednesday",
    time: "19:00 - 21:00",
    duration: "2.0 Hours Allocated",
    rate: "₹1,500/hr rack rate",
    amount: "₹3,000",
    rawAmount: 3000,
    status: "PENDING",
    paymentStatus: "HOLD PENDING",
    icon: "mic",
    createdAt: "2026-10-25T14:30:00Z",
    isDemo: true,
  },
  {
    id: "BKG-2026-BLR-041",
    studioId: "st-003",
    studio: "Metropolis Broadcast Lab",
    location: "Bengaluru • 77 Koramangala 4th Block",
    city: "Bengaluru",
    creatorId: "usr-creator-1",
    creatorName: "Alex Miller",
    creatorEmail: "alex@podcaster.com",
    date: "Oct 15, 2026",
    rawDate: "2026-10-15",
    day: "Thursday",
    time: "16:30 - 18:30",
    duration: "2.0 Hours Allocated",
    rate: "₹1,800/hr rack rate",
    amount: "₹3,600",
    rawAmount: 3600,
    status: "COMPLETED",
    paymentStatus: "SETTLED",
    icon: "videocam",
    createdAt: "2026-09-10T09:00:00Z",
    isDemo: true,
  },
];

function getUserBookings() {
  const stored = localStorage.getItem(USER_BOOKINGS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserBookings(bookings) {
  localStorage.setItem(USER_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

function getModifiedBookingsMap() {
  const stored = localStorage.getItem(MODIFIED_BOOKINGS_STORAGE_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveModifiedBookingsMap(map) {
  localStorage.setItem(MODIFIED_BOOKINGS_STORAGE_KEY, JSON.stringify(map));
}

function getAllBookings() {
  const userBookings = getUserBookings();
  const modifiedMap = getModifiedBookingsMap();

  const demoList = DEMO_BOOKINGS.map((b) => {
    if (modifiedMap[b.id]) {
      return { ...b, ...modifiedMap[b.id] };
    }
    return b;
  });

  return [...userBookings, ...demoList];
}

// Parse time slot string for demo mode interval conflict detection
function parseDemoSlot(rawDate, timeRangeStr) {
  if (!rawDate || !timeRangeStr || typeof timeRangeStr !== "string") return null;
  const parts = timeRangeStr.split("-");
  if (parts.length !== 2) return null;

  const parseSingle = (str) => {
    const clean = str.trim();
    const m12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m12) {
      let h = parseInt(m12[1], 10);
      const m = parseInt(m12[2], 10);
      const mer = m12[3].toUpperCase();
      if (mer === "PM" && h < 12) h += 12;
      if (mer === "AM" && h === 12) h = 0;
      return { h, m };
    }
    const m24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      return { h: parseInt(m24[1], 10), m: parseInt(m24[2], 10) };
    }
    return null;
  };

  const s = parseSingle(parts[0]);
  const e = parseSingle(parts[1]);
  if (!s || !e) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const sIso = `${rawDate}T${pad(s.h)}:${pad(s.m)}:00+05:30`;
  const eIso = `${rawDate}T${pad(e.h)}:${pad(e.m)}:00+05:30`;

  const startMs = new Date(sIso).getTime();
  const endMs = new Date(eIso).getTime();
  if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return null;

  return { start: startMs, end: endMs };
}

export async function getBookings(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/bookings?${query}` : "/bookings";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.bookings)) return data.bookings;
    return [];
  }

  let bookings = getAllBookings();

  if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
    bookings = bookings.filter(
      (b) => b.status.toUpperCase() === filters.status.toUpperCase()
    );
  }

  if (filters.studioId && filters.studioId !== "ALL" && filters.studioId !== "All Studios" && filters.studioId !== "All My Studios") {
    bookings = bookings.filter((b) => String(b.studioId) === String(filters.studioId));
  }

  if (filters.date) {
    bookings = bookings.filter((b) => b.rawDate === filters.date || (b.date && b.date.includes(filters.date)));
  }

  if (filters.creatorId) {
    bookings = bookings.filter((b) => String(b.creatorId) === String(filters.creatorId));
  }

  return bookings;
}

export async function getProviderBookings(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/bookings/provider?${query}` : "/bookings/provider";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.bookings)) return data.bookings;
    return [];
  }

  let bookings = getAllBookings();

  if (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") {
    bookings = bookings.filter(
      (b) => b.status.toUpperCase() === filters.status.toUpperCase()
    );
  }

  if (filters.studioId && filters.studioId !== "ALL" && filters.studioId !== "All Studios" && filters.studioId !== "All My Studios") {
    bookings = bookings.filter((b) => String(b.studioId) === String(filters.studioId));
  }

  return bookings;
}

export async function getCreatorBookings(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const endpoint = query ? `/bookings/creator?${query}` : "/bookings/creator";

  if (isApiMode) {
    const data = await request(endpoint);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.bookings)) return data.bookings;
    return [];
  }

  return getBookings(filters);
}

export async function getBookingById(id) {
  if (isApiMode) {
    const data = await request(`/bookings/${id}`);
    if (data && (data.booking || data.id)) return data.booking || data;
    const error = new Error(`Booking with id ${id} not found`);
    error.status = 404;
    throw error;
  }

  const bookings = getAllBookings();
  const found = bookings.find((b) => String(b.id) === String(id));
  if (!found) {
    const error = new Error(`Booking with id ${id} not found`);
    error.status = 404;
    throw error;
  }
  return found;
}

export async function createBooking(bookingData) {
  if (!bookingData.studioId) {
    const error = new Error("Studio ID is required for booking.");
    error.status = 400;
    throw error;
  }

  if (!bookingData.rawDate) {
    const error = new Error("Booking date is required.");
    error.status = 400;
    throw error;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(bookingData.rawDate)) {
    const error = new Error("Invalid date format. Expected YYYY-MM-DD.");
    error.status = 400;
    throw error;
  }

  const [year, month, day] = bookingData.rawDate.split("-").map(Number);
  const testDate = new Date(Date.UTC(year, month - 1, day));
  if (
    testDate.getUTCFullYear() !== year ||
    testDate.getUTCMonth() !== month - 1 ||
    testDate.getUTCDate() !== day
  ) {
    const error = new Error("Invalid calendar date.");
    error.status = 400;
    throw error;
  }

  if (!bookingData.time) {
    const error = new Error("Time slot is required.");
    error.status = 400;
    throw error;
  }

  // Parse time and validate that start time is in the future
  const timeParts = bookingData.time.split("-");
  if (timeParts.length === 2) {
    const cleanTime = timeParts[0].trim();
    let hours = 0;
    let minutes = 0;
    const match12 = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const match24 = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
    if (match12) {
      hours = parseInt(match12[1], 10);
      minutes = parseInt(match12[2], 10);
      const meridian = match12[3].toUpperCase();
      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    } else if (match24) {
      hours = parseInt(match24[1], 10);
      minutes = parseInt(match24[2], 10);
    }

    const pad = (n) => String(n).padStart(2, "0");
    const slotStartTime = new Date(`${bookingData.rawDate}T${pad(hours)}:${pad(minutes)}:00+05:30`);
    if (!isNaN(slotStartTime.getTime()) && slotStartTime <= new Date()) {
      const error = new Error("Booking start time must be in the future.");
      error.status = 400;
      throw error;
    }
  }

  if (isApiMode) {
    const data = await request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
    if (data && (data.booking || data.id)) return data.booking || data;
    const error = new Error("Failed to create booking on server.");
    error.status = 502;
    throw error;
  }

  const newSlot = parseDemoSlot(bookingData.rawDate, bookingData.time);
  if (newSlot && newSlot.start < Date.now()) {
    const error = new Error("Cannot book a time slot in the past.");
    error.status = 400;
    throw error;
  }

  const allBookings = getAllBookings();
  const hasConflict = allBookings.some((b) => {
    const matchStudio = String(b.studioId) === String(bookingData.studioId);
    const matchDate = b.rawDate === bookingData.rawDate;
    const isActive = b.status === "CONFIRMED" || b.status === "PENDING";
    if (!matchStudio || !matchDate || !isActive) return false;

    // Check interval overlap: existingStart < newEnd && existingEnd > newStart
    if (newSlot) {
      const existingSlot = parseDemoSlot(b.rawDate, b.time);
      if (existingSlot) {
        return existingSlot.start < newSlot.end && existingSlot.end > newSlot.start;
      }
    }
    return b.time === bookingData.time;
  });

  if (hasConflict) {
    const error = new Error("This studio is already booked for the selected date and time window.");
    error.status = 409;
    throw error;
  }

  const userBookings = getUserBookings();
  const idNum = Math.floor(100 + Math.random() * 900);
  const cityCode = (bookingData.city || "DEL").slice(0, 3).toUpperCase();
  const newId = `BKG-2026-${cityCode}-${idNum}`;

  const numRate = Number(bookingData.hourlyRate || bookingData.rate) || 1500;
  const rawAmount = Number(bookingData.rawAmount || bookingData.totalPrice) || numRate * 2;

  const newBooking = {
    id: newId,
    studioId: String(bookingData.studioId),
    studio: bookingData.studioName || bookingData.studio || "Studio Session",
    location: bookingData.location || `${bookingData.city || "Delhi"} • Control Room`,
    city: bookingData.city || "Delhi",
    creatorId: String(bookingData.creatorId || "usr-creator-1"),
    creatorName: bookingData.creatorName || "Verified Creator",
    creatorEmail: bookingData.creatorEmail || "creator@podsphere.net",
    date: bookingData.date || bookingData.rawDate,
    rawDate: bookingData.rawDate,
    day: bookingData.day || "Scheduled",
    time: bookingData.time,
    duration: bookingData.duration || "2.0 Hours Allocated",
    rate: `₹${numRate.toLocaleString()}/hr rack rate`,
    amount: `₹${rawAmount.toLocaleString()}`,
    rawAmount: rawAmount,
    totalPrice: rawAmount,
    status: "PENDING",
    paymentStatus: "HOLD PENDING",
    icon: "mic",
    createdAt: new Date().toISOString(),
    isDemo: false,
  };

  userBookings.unshift(newBooking);
  saveUserBookings(userBookings);
  return newBooking;
}

export async function cancelBooking(id, creatorId) {
  if (isApiMode) {
    const data = await request(`/bookings/${id}/cancel`, { method: "PATCH" });
    return data;
  }

  const userBookings = getUserBookings();
  const userIndex = userBookings.findIndex((b) => String(b.id) === String(id));

  if (userIndex !== -1) {
    if (creatorId && String(userBookings[userIndex].creatorId) !== String(creatorId)) {
      const error = new Error("Unauthorized: You can only cancel your own bookings.");
      error.status = 403;
      throw error;
    }

    if (userBookings[userIndex].status === "CANCELLED") {
      const error = new Error("This booking has already been cancelled.");
      error.status = 400;
      throw error;
    }

    if (userBookings[userIndex].status === "COMPLETED") {
      const error = new Error("Completed bookings cannot be cancelled.");
      error.status = 400;
      throw error;
    }

    const updated = {
      ...userBookings[userIndex],
      status: "CANCELLED",
      paymentStatus: "REFUNDED",
      cancelledAt: new Date().toISOString(),
    };

    userBookings[userIndex] = updated;
    saveUserBookings(userBookings);
    return { success: true, booking: updated };
  }

  const demoBooking = DEMO_BOOKINGS.find((b) => String(b.id) === String(id));
  if (demoBooking) {
    const modifiedMap = getModifiedBookingsMap();
    const current = modifiedMap[id] ? { ...demoBooking, ...modifiedMap[id] } : demoBooking;

    if (creatorId && String(current.creatorId) !== String(creatorId)) {
      const error = new Error("Unauthorized: You can only cancel your own bookings.");
      error.status = 403;
      throw error;
    }

    if (current.status === "CANCELLED") {
      const error = new Error("This booking has already been cancelled.");
      error.status = 400;
      throw error;
    }

    if (current.status === "COMPLETED") {
      const error = new Error("Completed bookings cannot be cancelled.");
      error.status = 400;
      throw error;
    }

    const updated = {
      ...current,
      status: "CANCELLED",
      paymentStatus: "REFUNDED",
      cancelledAt: new Date().toISOString(),
    };

    modifiedMap[id] = updated;
    saveModifiedBookingsMap(modifiedMap);
    return { success: true, booking: updated };
  }

  const error = new Error(`Booking with id ${id} not found`);
  error.status = 404;
  throw error;
}

export async function updateBookingStatus(id, newStatus) {
  const validStatuses = ["CONFIRMED", "PENDING", "COMPLETED", "CANCELLED", "REJECTED"];
  const upper = (newStatus || "").toUpperCase();

  if (!validStatuses.includes(upper)) {
    const error = new Error(`Invalid booking status: ${newStatus}`);
    error.status = 400;
    throw error;
  }

  if (isApiMode) {
    const data = await request(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: upper }),
    });
    return data;
  }

  const userBookings = getUserBookings();
  const userIndex = userBookings.findIndex((b) => String(b.id) === String(id));

  if (userIndex !== -1) {
    const current = userBookings[userIndex];
    if (["REJECTED", "CANCELLED", "COMPLETED"].includes(current.status)) {
      const error = new Error(`Cannot change status of a ${current.status} booking.`);
      error.status = 400;
      throw error;
    }
    if (current.status === "PENDING" && !["CONFIRMED", "REJECTED"].includes(upper)) {
      const error = new Error("Pending bookings can only be CONFIRMED or REJECTED.");
      error.status = 400;
      throw error;
    }
    if (current.status === "CONFIRMED" && upper !== "COMPLETED") {
      const error = new Error("Confirmed bookings can only transition to COMPLETED.");
      error.status = 400;
      throw error;
    }

    const updated = {
      ...current,
      status: upper,
      paymentStatus: upper === "REJECTED" ? "REFUNDED" : current.paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    userBookings[userIndex] = updated;
    saveUserBookings(userBookings);
    return { success: true, booking: updated };
  }

  const demoBooking = DEMO_BOOKINGS.find((b) => String(b.id) === String(id));
  if (demoBooking) {
    const modifiedMap = getModifiedBookingsMap();
    const current = modifiedMap[id] ? { ...demoBooking, ...modifiedMap[id] } : demoBooking;

    if (["REJECTED", "CANCELLED", "COMPLETED"].includes(current.status)) {
      const error = new Error(`Cannot change status of a ${current.status} booking.`);
      error.status = 400;
      throw error;
    }
    if (current.status === "PENDING" && !["CONFIRMED", "REJECTED"].includes(upper)) {
      const error = new Error("Pending bookings can only be CONFIRMED or REJECTED.");
      error.status = 400;
      throw error;
    }
    if (current.status === "CONFIRMED" && upper !== "COMPLETED") {
      const error = new Error("Confirmed bookings can only transition to COMPLETED.");
      error.status = 400;
      throw error;
    }

    const updated = {
      ...current,
      status: upper,
      paymentStatus: upper === "REJECTED" ? "REFUNDED" : current.paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    modifiedMap[id] = updated;
    saveModifiedBookingsMap(modifiedMap);
    return { success: true, booking: updated };
  }

  const error = new Error(`Booking with id ${id} not found`);
  error.status = 404;
  throw error;
}
