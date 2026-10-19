/** Browser-local Dream Shelf import/export. The caller owns React state; callbacks are explicit. */
export const DREAM_SHELF_STORAGE_KEY = "pip-dream-shelf";
const MAX_FILE_BYTES = 1_048_576;
const MAX_DREAMS = 100;

function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function normalizeDream(value, index) {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id.trim() ||
      typeof value.title !== "string" || typeof value.message !== "string") {
    throw new TypeError(`Dream at index ${index} must contain string id, title, and message fields.`);
  }
  return {
    ...value,
    id: value.id.trim().slice(0, 160),
    title: value.title.trim().slice(0, 240),
    message: value.message.trim().slice(0, 4000),
  };
}
export function validateDreamShelf(value) {
  const shelf = Array.isArray(value) ? value : value?.schemaVersion === 1 && Array.isArray(value.dreamShelf) ? value.dreamShelf : null;
  if (!shelf) throw new TypeError("Invalid Dream Shelf file: expected an array or a version 1 export object.");
  if (shelf.length > MAX_DREAMS) throw new RangeError(`Dream Shelf can contain at most ${MAX_DREAMS} entries per import.`);
  const normalized = shelf.map(normalizeDream);
  const seen = new Set();
  for (const dream of normalized) {
    if (seen.has(dream.id)) throw new TypeError(`Duplicate dream id: ${dream.id}`);
    seen.add(dream.id);
  }
  return normalized;
}
export function exportDreamShelf(dreamShelf, { filename = "pip-dream-shelf.json" } = {}) {
  const safeShelf = validateDreamShelf(dreamShelf);
  const payload = { app: "PIP:// DREAM.EXE", schemaVersion: 1, exportedAt: new Date().toISOString(), dreamShelf: safeShelf };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return payload;
}
export async function importDreamShelfFile(file, { onImported, merge = false } = {}) {
  if (!(file instanceof Blob)) throw new TypeError("Choose a JSON file to import.");
  if (file.size > MAX_FILE_BYTES) throw new RangeError("Import file exceeds the 1 MiB safety limit.");
  const parsed = JSON.parse(await file.text());
  const imported = validateDreamShelf(parsed);
  let nextShelf = imported;
  if (merge) {
    const existing = readDreamShelf();
    const merged = new Map(existing.map((dream) => [dream.id, dream]));
    for (const dream of imported) merged.set(dream.id, dream);
    nextShelf = [...merged.values()].slice(0, MAX_DREAMS);
  }
  // Persist first; never update UI to claim success if storage throws.
  window.localStorage.setItem(DREAM_SHELF_STORAGE_KEY, JSON.stringify(nextShelf));
  onImported?.(nextShelf);
  window.dispatchEvent(new CustomEvent("pip:dream-shelf-imported", { detail: { count: nextShelf.length } }));
  return nextShelf;
}
export function readDreamShelf() {
  try {
    const raw = window.localStorage.getItem(DREAM_SHELF_STORAGE_KEY);
    return raw ? validateDreamShelf(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}
