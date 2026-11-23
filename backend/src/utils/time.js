"use strict";

/**
 * Time utility helpers for booking slot calculations.
 */

/**
 * Returns true when two time intervals [startA, endA) and [startB, endB) overlap.
 * Touching boundaries (endA === startB) are NOT considered overlapping.
 *
 * @param {Date} startA
 * @param {Date} endA
 * @param {Date} startB
 * @param {Date} endB
 * @returns {boolean}
 */
function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

/**
 * Calculates the total booking amount based on hourly rate and duration.
 *
 * @param {number|string|import("@prisma/client").Decimal} hourlyRate - Rate per hour.
 * @param {Date} startTime
 * @param {Date} endTime
 * @returns {number} Total amount (rounded to 2 decimal places).
 */
function calcTotalAmount(hourlyRate, startTime, endTime) {
  const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  return Math.round(Number(hourlyRate) * hours * 100) / 100;
}

/**
 * Returns true if the given date is strictly in the future relative to now.
 *
 * @param {Date} date
 * @returns {boolean}
 */
function isFutureDate(date) {
  return date.getTime() > Date.now();
}

/**
 * Parses a date string safely. Returns null if the string is not a valid date.
 *
 * @param {string} dateStr
 * @returns {Date|null}
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

module.exports = { intervalsOverlap, calcTotalAmount, isFutureDate, parseDate };
