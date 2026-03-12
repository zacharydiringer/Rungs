import { DAYS } from "../constants";

/**
 * Returns today's date as YYYY-MM-DD string (used as puzzle key).
 */
export const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * Parses a YYYY-MM-DD string into a Date object.
 */
export const parseDate = (str) => {
  const [yyyy, mm, dd] = str.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
};

/**
 * Returns the full day-of-week name for a MM-DD-YYYY string.
 * e.g. "03-14-2026" → "Saturday"
 */
export const getDayName = (dateStr) => {
  const d = parseDate(dateStr);
  return DAYS[d.getDay()];
};

/**
 * Returns a human-readable label for a MM-DD-YYYY string.
 * e.g. "03-14-2026" → "Saturday, March 14"
 */
export const formatDisplayDate = (dateStr) => {
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats elapsed seconds as MM:SS.
 */
export const fmtTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};