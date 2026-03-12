const storageKey = (date) => `rungs_${date}`;

/**
 * Loads persisted game state for a given MM-DD-YYYY date string.
 * Returns null if nothing is stored.
 */
export const loadState = (date) => {
  try {
    const raw = localStorage.getItem(storageKey(date));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Persists game state for a given MM-DD-YYYY date string.
 */
export const saveState = (date, state) => {
  try {
    localStorage.setItem(storageKey(date), JSON.stringify(state));
  } catch {
    console.warn("localStorage unavailable — state will not persist.");
  }
};

/**
 * Clears game state for a given date (useful for testing).
 */
export const clearState = (date) => {
  try {
    localStorage.removeItem(storageKey(date));
  } catch {}
};