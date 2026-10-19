import { useCallback, useEffect, useRef, useState } from "react";

const COUNTER_STORAGE_KEY = "pip-dream-simulated-count";
const SHELF_STORAGE_KEY = "pip-dream-shelf";
const LEGACY_COUNTER_STORAGE_KEY = "pip-dream-simulated-dreams";
const MAX_COUNTER_VALUE = 999999;

function normalizeCounter(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0
    ? Math.min(parsed, MAX_COUNTER_VALUE)
    : 0;
}

/** Read synchronously in the state initializer so the first render is hydrated. */
function readInitialCounter() {
  try {
    const storedValue = window.localStorage.getItem(COUNTER_STORAGE_KEY);
    if (storedValue !== null) return normalizeCounter(storedValue);

    // Migrate the prior modular guestbook counter before falling back to shelf data.
    const legacyValue = window.localStorage.getItem(LEGACY_COUNTER_STORAGE_KEY);
    if (legacyValue !== null) return normalizeCounter(legacyValue);

    // Backfill older installs from saved items without inventing compile events.
    const shelf = JSON.parse(window.localStorage.getItem(SHELF_STORAGE_KEY) || "[]");
    return Array.isArray(shelf)
      ? Math.min(shelf.filter((item) => item && typeof item.id === "string").length, MAX_COUNTER_VALUE)
      : 0;
  } catch {
    return 0;
  }
}

export default function usePersistentDreamCounter() {
  const [count, setCount] = useState(readInitialCounter);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count;
    try {
      window.localStorage.setItem(COUNTER_STORAGE_KEY, String(count));
    } catch {
      // The counter remains usable for this visit when storage is blocked.
    }
  }, [count]);

  const increment = useCallback(() => {
    // Persist synchronously in the action handler, then schedule the React render.
    const nextCount = Math.min(countRef.current + 1, MAX_COUNTER_VALUE);
    countRef.current = nextCount;
    setCount(nextCount);
    try {
      window.localStorage.setItem(COUNTER_STORAGE_KEY, String(nextCount));
    } catch {
      // The value still updates in memory for this visit when storage is blocked.
    }
  }, []);

  return { count, increment };
}
