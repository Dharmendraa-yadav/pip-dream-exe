import { useEffect, useState } from "react";

const GUESTBOOK_STORAGE_KEY = "pip-dream-guestbook";
const COUNTER_STORAGE_KEY = "pip-dream-simulated-dreams";
const MAX_VISIBLE_ENTRIES = 24;
const MAX_NAME_LENGTH = 32;
const MAX_WISH_LENGTH = 240;

function safeReadEntries() {
  try {
    const raw = window.localStorage.getItem(GUESTBOOK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry) => entry && typeof entry.name === "string" && typeof entry.message === "string")
      .map((entry, index) => ({
        id: typeof entry.id === "string" ? entry.id : `restored-${index}`,
        name: entry.name.slice(0, MAX_NAME_LENGTH),
        message: entry.message.slice(0, MAX_WISH_LENGTH),
        stamp: typeof entry.stamp === "string" ? entry.stamp : "Saved dream",
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : "",
      }))
      .slice(0, MAX_VISIBLE_ENTRIES);
  } catch {
    return [];
  }
}

function safeReadCounter() {
  try {
    const value = Number(window.localStorage.getItem(COUNTER_STORAGE_KEY) || 0);
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function createEntryId() {
  try {
    if (typeof window.crypto?.randomUUID === "function") return window.crypto.randomUUID();
  } catch {
    // Fall through to a local, non-security-sensitive identifier.
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`;
}

function formatOdometer(value) {
  return String(value).padStart(6, "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function makeDateStamp(date = new Date()) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** A local-first dream wall. Entries persist in the current browser, not on a shared server. */
export default function DreamGuestbook() {
  const [entries, setEntries] = useState(safeReadEntries);
  const [dreamsSimulated, setDreamsSimulated] = useState(safeReadCounter);
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // The interactive guestbook remains usable for this session without storage.
    }
  }, [entries]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanName = name.trim().slice(0, MAX_NAME_LENGTH);
    const cleanWish = wish.trim().slice(0, MAX_WISH_LENGTH);
    if (!cleanName || !cleanWish) {
      setStatusMessage("Add a name and a tiny wish before pinning it.");
      return;
    }

    const created = new Date();
    const entry = {
      id: createEntryId(),
      name: cleanName,
      message: cleanWish,
      stamp: makeDateStamp(created),
      createdAt: created.toISOString(),
    };

    // Update the React state immediately; the newest dream appears at the top.
    setEntries((currentEntries) => [entry, ...currentEntries].slice(0, MAX_VISIBLE_ENTRIES));
    const nextCount = dreamsSimulated + 1;
    setDreamsSimulated(nextCount);
    try {
      window.localStorage.setItem(COUNTER_STORAGE_KEY, String(nextCount));
    } catch {
      // Counter value remains correct for this session even if persistence is blocked.
    }

    setName("");
    setWish("");
    setStatusMessage("Your tiny dream is pinned to this device's dream wall. ✦");
  };

  return (
    <section className="dream-guestbook guestbook" aria-labelledby="dream-guestbook-title">
      <div className="dream-guestbook-header guestbook-header">
        <div>
          <p className="panel-kicker">SIDE QUEST · THE DREAMBOOK</p>
          <h2 id="dream-guestbook-title">Leave a Tiny Dream Behind</h2>
          <p className="dream-guestbook-copy guestbook-copy">
            Leave a kind wish for the next dreamer passing through the midnight nursery.
          </p>
        </div>
        <span className="dream-guestbook-seal guestbook-seal" aria-hidden="true">
          ✎<small>PIN A<br />WISH</small>
        </span>
      </div>

      <form className="dream-guestbook-form guestbook-form" onSubmit={handleSubmit}>
        <label className="dream-guestbook-field">
          <span>Your tiny name <em>required</em></span>
          <input
            name="dreamerName"
            type="text"
            autoComplete="nickname"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={MAX_NAME_LENGTH}
            minLength={1}
            placeholder="A moon visitor"
            required
          />
        </label>
        <label className="dream-guestbook-field">
          <span>Your dream wish <em>{wish.length}/{MAX_WISH_LENGTH}</em></span>
          <textarea
            name="dreamWish"
            value={wish}
            onChange={(event) => setWish(event.target.value)}
            maxLength={MAX_WISH_LENGTH}
            rows={3}
            placeholder="May tomorrow bring one small, kind surprise..."
            required
          />
        </label>
        <div className="dream-guestbook-form-footer">
          <span>Saved on this device only</span>
          <button className="action-button dream-guestbook-submit" type="submit" disabled={!name.trim() || !wish.trim()}>
            Pin the wish ✦
          </button>
        </div>
        <p className="dream-guestbook-status" role="status" aria-live="polite">{statusMessage}</p>
      </form>

      <div className="dream-guestbook-wall-heading">
        <span>THE WISH WALL</span>
        <span>{entries.length} / {MAX_VISIBLE_ENTRIES} visible</span>
      </div>
      <div className="dream-guestbook-wall" aria-label="Saved dream wishes">
        {entries.length > 0 ? (
          <ol className="dream-guestbook-list" aria-live="polite" aria-relevant="additions">
            {entries.map((entry) => (
              <li className="dream-guestbook-entry guestbook-entry" key={entry.id}>
                <span className="dream-guestbook-pin entry-pin" aria-hidden="true">✦</span>
                <div className="dream-guestbook-entry-copy">
                  <p>{entry.message}</p>
                  <footer>
                    <strong>{entry.name}</strong>
                    <time dateTime={entry.createdAt || undefined}>{entry.stamp || "Saved dream"}</time>
                  </footer>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="dream-guestbook-empty guestbook-empty">No wishes pinned yet. Yours can be the first ✧</p>
        )}
      </div>

      <footer className="dream-guestbook-odometer" aria-label={`Dreams simulated on this browser: ${dreamsSimulated}`}>
        <div>
          <span className="dream-guestbook-odometer-label">DREAMS SIMULATED</span>
          <small>LOCAL DEVICE COUNTER · NOT A GLOBAL VISITOR COUNT</small>
        </div>
        <strong aria-hidden="true">{formatOdometer(dreamsSimulated)}</strong>
      </footer>
    </section>
  );
}
