"use strict";

const { intervalsOverlap, calcTotalAmount, isFutureDate, parseDate } = require("../../src/utils/time");

describe("time utilities", () => {
  describe("intervalsOverlap", () => {
    const t = (h) => new Date(2026, 10, 25, h, 0, 0); // Nov 25 2026, hour h

    it("returns true for fully overlapping intervals", () => {
      expect(intervalsOverlap(t(9), t(13), t(10), t(12))).toBe(true);
    });

    it("returns true when interval A starts inside interval B", () => {
      expect(intervalsOverlap(t(11), t(14), t(10), t(13))).toBe(true);
    });

    it("returns true when interval B starts inside interval A", () => {
      expect(intervalsOverlap(t(10), t(14), t(12), t(16))).toBe(true);
    });

    it("returns false for non-overlapping intervals", () => {
      expect(intervalsOverlap(t(9), t(11), t(12), t(14))).toBe(false);
    });

    it("returns false when intervals only touch at a boundary (endA === startB)", () => {
      expect(intervalsOverlap(t(9), t(11), t(11), t(13))).toBe(false);
    });

    it("returns false when B ends at the same moment A starts", () => {
      expect(intervalsOverlap(t(11), t(13), t(9), t(11))).toBe(false);
    });
  });

  describe("calcTotalAmount", () => {
    it("calculates correctly for a 2-hour block at ₹1500/hr", () => {
      const start = new Date(2026, 10, 25, 10, 0, 0);
      const end = new Date(2026, 10, 25, 12, 0, 0);
      expect(calcTotalAmount(1500, start, end)).toBe(3000);
    });

    it("calculates correctly for a 1.5-hour block", () => {
      const start = new Date(2026, 10, 25, 10, 0, 0);
      const end = new Date(2026, 10, 25, 11, 30, 0);
      expect(calcTotalAmount(2000, start, end)).toBe(3000);
    });

    it("handles Decimal-like string hourlyRate values", () => {
      const start = new Date(2026, 10, 25, 10, 0, 0);
      const end = new Date(2026, 10, 25, 11, 0, 0);
      expect(calcTotalAmount("1800", start, end)).toBe(1800);
    });

    it("returns 0 for a zero-duration interval", () => {
      const t = new Date(2026, 10, 25, 10, 0, 0);
      expect(calcTotalAmount(1500, t, t)).toBe(0);
    });
  });

  describe("isFutureDate", () => {
    it("returns true for a date in the future", () => {
      const future = new Date(Date.now() + 10_000);
      expect(isFutureDate(future)).toBe(true);
    });

    it("returns false for a date in the past", () => {
      const past = new Date(Date.now() - 10_000);
      expect(isFutureDate(past)).toBe(false);
    });
  });

  describe("parseDate", () => {
    it("parses a valid ISO date string", () => {
      const result = parseDate("2026-11-25T10:00:00Z");
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(false);
    });

    it("returns null for an invalid string", () => {
      expect(parseDate("not-a-date")).toBeNull();
    });

    it("returns null for null or undefined", () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });
  });
});
