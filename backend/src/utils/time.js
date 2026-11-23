// Validate ISO calendar date string (YYYY-MM-DD) without silent JS rollover
function isValidCalendarDate(rawDate) {
  if (!rawDate || typeof rawDate !== "string") return false;
  const clean = rawDate.trim();
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

// Parse single time string in 12h or 24h format e.g. "10:00 AM", "12:00 PM", "14:00", "16:30"
function parseSingleTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim();

  // Match 12-hour format e.g. "10:00 AM", "1:30 PM", "12:00 PM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3].toUpperCase();

    // Enforce 12-hour clock boundaries: 1..12 hours, 0..59 minutes
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  // Match 24-hour format e.g. "14:00", "09:30"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);

    // Enforce 24-hour clock boundaries: 0..23 hours, 0..59 minutes
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return { hours, minutes };
  }

  return null;
}

// Parse a slot string e.g. "10:00 AM - 12:00 PM" or "14:00 - 16:00" on a given rawDate (YYYY-MM-DD)
// Treats input as Indian Standard Time (Asia/Kolkata: UTC+05:30) and returns UTC Date objects
function parseTimeSlot(rawDate, timeRangeStr) {
  if (!rawDate || !timeRangeStr || typeof timeRangeStr !== "string") return null;
  if (!isValidCalendarDate(rawDate)) return null;

  const parts = timeRangeStr.split("-");
  if (parts.length !== 2) return null;

  const startParsed = parseSingleTimeString(parts[0]);
  const endParsed = parseSingleTimeString(parts[1]);

  if (!startParsed || !endParsed) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const cleanDate = rawDate.trim();
  const startIso = `${cleanDate}T${pad(startParsed.hours)}:${pad(startParsed.minutes)}:00+05:30`;
  const endIso = `${cleanDate}T${pad(endParsed.hours)}:${pad(endParsed.minutes)}:00+05:30`;

  const startTime = new Date(startIso);
  const endTime = new Date(endIso);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return null;
  }

  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  if (durationHours <= 0) {
    return null;
  }

  return {
    startTime,
    endTime,
    durationHours
  };
}

// Format UTC Date objects back to IST representations for frontend display
function formatBookingTimes(startTime, endTime) {
  const s = new Date(startTime);
  const e = new Date(endTime);

  const rawDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(s);

  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(s);

  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long"
  }).format(s);

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  const time = `${timeFormatter.format(s)} - ${timeFormatter.format(e)}`;
  const durationHours = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
  const duration = `${durationHours.toFixed(1)} Hours Allocated`;

  return {
    rawDate,
    date,
    day,
    time,
    duration,
    durationHours
  };
}

module.exports = {
  isValidCalendarDate,
  parseSingleTimeString,
  parseTimeSlot,
  formatBookingTimes
};
