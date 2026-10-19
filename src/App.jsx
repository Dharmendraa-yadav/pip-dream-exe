import { useEffect, useRef, useState } from "react";
import BonusAudioController from "./components/BonusAudioController.jsx";
import ChaosOverlay from "./components/ChaosOverlay.jsx";
import DreamGuestbook from "./components/DreamGuestbook.jsx";
import { createLullabyLabEngine } from "./utils/LullabyLabEngine.js";
import dreamConfig from "./dreams.config.json";
import { getDreamAudioGraph, readDreamAudioEnabled, setDreamAudioEnabled } from "./audio/dreamAudioBus.js";
import usePersistentDreamCounter from "./hooks/usePersistentDreamCounter.js";
import useSparkleTrail from "./hooks/useSparkleTrail.js";
import "./App.css";

// Application copy and mood behavior live in dreams.config.json so components
// render the configured data rather than maintaining parallel content arrays.
const dreamMoods = Object.entries(dreamConfig.moods).map(([id, mood]) => ({
  id,
  ...mood,
}));
const dreamIngredients = dreamConfig.ingredients;
const dreamDestinations = dreamConfig.destinations;
const dailyDreamPrompts = dreamConfig.copy.dailyDreamPrompts;

function fillDreamTemplate(template, values) {
  return String(template ?? "").replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (match, token) => (
    Object.hasOwn(values, token) ? String(values[token]) : match
  ));
}

function selectDreamTemplate(templates, seed) {
  if (!Array.isArray(templates) || templates.length === 0) return "A little dream";
  const index = ((seed % templates.length) + templates.length) % templates.length;
  return templates[index];
}

function escapePrintText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function printDreamPassport(receipt) {
  if (!receipt) return;

  const printWindow = window.open("", "_blank", "width=960,height=700");
  if (!printWindow) {
    window.alert("Please allow pop-ups for this site to print your Dream Passport.");
    return;
  }

  const title = escapePrintText(receipt.title || "A Little Dream");
  const serial = escapePrintText(receipt.serial || "PIP-000000");
  const dateLabel = escapePrintText(receipt.dateLabel || new Date().toLocaleDateString());
  const destination = escapePrintText(receipt.destination || "A quiet place");
  const mood = escapePrintText(receipt.mood || "A little hope");
  const ingredient = escapePrintText(receipt.ingredient || "Moon dust");

  const documentHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dream Passport — ${title}</title>
<style>
  @page { size: A5 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; color: #30223b; background: #fff; font-family: Arial, Helvetica, sans-serif; }
  body { padding: 0; }
  .passport { position: relative; width: 100%; min-height: 105mm; padding: 9mm 10mm 7mm; overflow: hidden; border: 1.6px solid #a95d81; border-radius: 5mm; background: #fffaf2; }
  .topline, .bottomline { display: flex; justify-content: space-between; align-items: center; gap: 8mm; color: #6c587a; font-family: 'Courier New', monospace; font-size: 8pt; letter-spacing: 1.4px; text-transform: uppercase; }
  .topline { padding-bottom: 4mm; border-bottom: 1px solid #ead9e1; }
  .main { display: flex; align-items: center; justify-content: space-between; gap: 10mm; padding: 8mm 0; }
  .copy { min-width: 0; flex: 1; }
  .kicker { margin: 0 0 2mm; color: #80516b; font-family: 'Courier New', monospace; font-size: 7.5pt; letter-spacing: 1.5px; text-transform: uppercase; }
  h1 { margin: 0 0 1mm; color: #30223b; font-size: 25pt; line-height: 1.05; letter-spacing: -.5px; }
  .dream-title { margin: 0; color: #715016; font-size: 12pt; font-weight: 700; overflow-wrap: anywhere; }
  .details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 3mm; margin: 6mm 0 0; }
  .detail { min-width: 0; padding: 3mm; border: 1px solid #dfcede; border-radius: 2mm; background: #fff; }
  dt { margin: 0 0 1.5mm; color: #685574; font-family: 'Courier New', monospace; font-size: 7pt; letter-spacing: .7px; }
  dd { margin: 0; color: #30223b; font-size: 10pt; font-weight: 700; overflow-wrap: anywhere; }
  .stamp { width: 31mm; height: 31mm; flex: 0 0 31mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; border: 1.6px dashed #a95d81; border-radius: 50%; color: #a95d81; transform: rotate(7deg); }
  .stamp span { font-size: 19pt; line-height: 1; }
  .stamp strong { font-family: 'Courier New', monospace; font-size: 8pt; letter-spacing: 1px; }
  .stamp small { font-family: 'Courier New', monospace; font-size: 6pt; letter-spacing: 1.2px; }
  .bottomline { padding-top: 4mm; border-top: 1px dashed #dfcede; color: #6c587a; }
  .screen-actions { margin: 8mm auto 0; display: flex; justify-content: center; gap: 3mm; }
  .screen-actions button { padding: 10px 16px; border: 1px solid #a95d81; border-radius: 8px; background: #30223b; color: #fffaf2; font-weight: 700; cursor: pointer; }
  @media screen { body { padding: 24px; background: #eee7ee; } .passport { max-width: 760px; min-height: 0; margin: 0 auto; box-shadow: 0 12px 36px #30223b1c; } }
  @media print { .screen-actions { display: none !important; } body { background: #fff; } .passport { box-shadow: none; break-inside: avoid; } }
  @media (max-width: 640px) { .main { gap: 5mm; } .details { grid-template-columns: 1fr; } .stamp { width: 25mm; height: 25mm; flex-basis: 25mm; } }
</style>
</head>
<body>
  <article class="passport" aria-label="Dream Passport keepsake">
    <div class="topline"><span>Midnight Nursery Post</span><span>${serial}</span></div>
    <div class="main">
      <div class="copy">
        <p class="kicker">Delivery confirmed · ${dateLabel}</p>
        <h1>Dream Passport</h1>
        <p class="dream-title">${title}</p>
        <dl class="details">
          <div class="detail"><dt>DESTINATION</dt><dd>${destination}</dd></div>
          <div class="detail"><dt>MOOD</dt><dd>${mood}</dd></div>
          <div class="detail"><dt>INGREDIENT</dt><dd>${ingredient}</dd></div>
        </dl>
      </div>
      <div class="stamp" aria-label="Dream successfully delivered"><span>✦</span><strong>DELIVERED</strong><small>BY PIP</small></div>
    </div>
    <div class="bottomline"><span>No dream left behind</span><span>Keep this little world</span></div>
  </article>
  <div class="screen-actions"><button onclick="window.print()" type="button">Print / Save as PDF</button><button onclick="window.close()" type="button">Close</button></div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(documentHtml);
  printWindow.document.close();
  printWindow.focus();
}

function getLocalDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function App() {
  const [started, setStarted] = useState(false);
  const [lullabyPlaying, setLullabyPlaying] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(readDreamAudioEnabled);
  const { count: dreamActivityCount, increment: incrementDreamActivity } = usePersistentDreamCounter();
  const [activeProject, setActiveProject] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [pipExpression, setPipExpression] = useState("sleepy");
  const [courierReceipt, setCourierReceipt] = useState(null);
  const [nightlightEnabled, setNightlightEnabled] = useState(true);
  const [nightlightBrightness, setNightlightBrightness] = useState(65);
  const [destination, setDestination] = useState("Moon Garden");
  const [courierStatus, setCourierStatus] = useState("idle");
  const [dayMode, setDayMode] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);
  const [visitCount, setVisitCount] = useState(() => {
    try {
      const count = Number(window.localStorage.getItem("pip-dream-visit-count") || 0);
      return Number.isSafeInteger(count) && count >= 0 ? count : 0;
    } catch {
      return 0;
    }
  });

  const [returningVisitor, setReturningVisitor] = useState(() => visitCount > 0);
  const [dreamSaveMessage, setDreamSaveMessage] = useState("");
  const [pipTapCount, setPipTapCount] = useState(0);
  const [secretFound, setSecretFound] = useState(false);
  const [ritualMood, setRitualMood] = useState("rest");
  const [ritualIngredient, setRitualIngredient] = useState("moon-dust");
  const [ritualDestination, setRitualDestination] = useState("Moon Garden");
  const [generatedDream, setGeneratedDream] = useState(null);
  const [dreamShelf, setDreamShelf] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("pip-dream-shelf") || "[]");
      return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === "string" && typeof item.title === "string" && typeof item.message === "string").slice(0, 4) : [];
    } catch {
      return [];
    }
  });
  const todayKey = getLocalDayKey();
  const dayNumber = Math.floor(new Date(`${todayKey}T12:00:00`).getTime() / 86400000);
  const dailyDreamPrompt = dailyDreamPrompts[((dayNumber % dailyDreamPrompts.length) + dailyDreamPrompts.length) % dailyDreamPrompts.length];


  const cursorSparkleRef = useRef(null);
  const courierTimerRef = useRef(null);
  const lullabyTimerRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  const lullabyEngineRef = useRef(null);
  const activeMoodConfig = dreamConfig.moods[ritualMood] ?? dreamConfig.moods.rest;
  const { canvasRef: sparkleTrailCanvasRef } = useSparkleTrail({
    enabled: started && !focusMode,
    soundEnabled,
    onChime: ({ frequency }) => lullabyEngineRef.current?.playSparkleChime({
      frequency,
      soundEnabled: soundEnabledRef.current,
    }),
  });

  useEffect(() => {
    setDreamAudioEnabled(soundEnabled);
    lullabyEngineRef.current?.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const engine = createLullabyLabEngine({
      // Route every generated note through the app's existing single master gain.
      getAudioGraph: getDreamAudioGraph,
      isSoundEnabled: () => soundEnabledRef.current,
    });
    engine.setEnabled(soundEnabledRef.current);
    lullabyEngineRef.current = engine;

    return () => {
      void engine.dispose();
      if (lullabyEngineRef.current === engine) lullabyEngineRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(courierTimerRef.current);
      window.clearTimeout(lullabyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!started) return undefined;

    const sparkle = cursorSparkleRef.current;
    if (!sparkle) return undefined;
    const pip = document.querySelector(".pip-secret-trigger");

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      sparkle.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY + 10}px, 0) rotate(${(event.clientX + event.clientY) % 36}deg)`;
      sparkle.style.opacity = "0.9";

      if (pip) {
        const rect = pip.getBoundingClientRect();
        const horizontal = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width / 2, 1);
        const vertical = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height / 2, 1);
        const eyeX = Math.max(-3, Math.min(3, horizontal * 3));
        const eyeY = Math.max(-3, Math.min(3, vertical * 2));
        pip.style.setProperty("--eye-x", `${eyeX.toFixed(1)}px`);
        pip.style.setProperty("--eye-y", `${eyeY.toFixed(1)}px`);
      }
    };
    const hideSparkle = () => {
      sparkle.style.opacity = "0";
      if (pip) {
        pip.style.setProperty("--eye-x", "0px");
        pip.style.setProperty("--eye-y", "0px");
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", hideSparkle);
    document.addEventListener("mouseleave", hideSparkle);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", hideSparkle);
      document.removeEventListener("mouseleave", hideSparkle);
    };
  }, [started]);

  useEffect(() => {
    if (!started) return undefined;
    const scenes = document.querySelectorAll(".story-scene");
    if (!("IntersectionObserver" in window)) {
      scenes.forEach((scene) => scene.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    scenes.forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
  }, [started]);

  const createDreamRecipe = () => {
    setDreamSaveMessage("");
    const mood = dreamMoods.find((item) => item.id === ritualMood) || dreamMoods[0];
    setPipExpression(mood.expression);
    const ingredient = dreamIngredients.find((item) => item.id === ritualIngredient) || dreamIngredients[0];
    const templateSeed = ingredient.id.length + dayNumber;
    const values = {
      adjective: mood.word,
      destination: ritualDestination,
      ingredient: ingredient.label.toLowerCase(),
      ingredientDetail: ingredient.detail,
      mood: mood.label.toLowerCase(),
      moodLine: mood.line,
    };
    const title = fillDreamTemplate(
      selectDreamTemplate(mood.recipeTemplates?.titles, templateSeed),
      values,
    );
    const message = fillDreamTemplate(
      selectDreamTemplate(mood.recipeTemplates?.messages, templateSeed + 1),
      values,
    );
    const recipe = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      dayKey: todayKey,
      dateLabel: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood: mood.label,
      moodId: mood.id,
      moodIcon: mood.icon,
      ingredient: ingredient.label,
      ingredientIcon: ingredient.icon,
      destination: ritualDestination,
      title,
      message,
    };
    setGeneratedDream(recipe);
    // A completed compile is an activity even before the visitor chooses to save it.
    incrementDreamActivity();
    // The generated cue uses the same master bus as every other sound in the app.
    void lullabyEngineRef.current?.playArpeggio({
      moodConfig: mood,
      text: `${recipe.title}. ${recipe.message}`,
      keywords: mood.keywords,
      soundEnabled: soundEnabledRef.current,
      componentLoadState: "ready",
      noteCount: 4,
      durationMs: 260,
    });
  };

  const saveDreamRecipe = () => {
    if (!generatedDream) return;
    const isNewShelfEntry = !dreamShelf.some((item) => item.id === generatedDream.id);
    const nextShelf = [generatedDream, ...dreamShelf.filter((item) => item.id !== generatedDream.id)].slice(0, 4);
    setDreamShelf(nextShelf);

    let persisted = true;
    try {
      window.localStorage.setItem("pip-dream-shelf", JSON.stringify(nextShelf));
    } catch {
      // The shelf remains available in the current view if storage is unavailable.
      persisted = false;
    }

    if (isNewShelfEntry) {
      // Re-saving or reopening the same recipe does not count as another shelf addition.
      incrementDreamActivity();
      setDreamSaveMessage(persisted
        ? "Saved to your Dream Shelf on this device."
        : "Added for this visit, but browser storage is unavailable.");
    } else {
      setDreamSaveMessage("This dream is already on your Dream Shelf.");
    }
  };

  const sendRitualDream = () => {
    if (!generatedDream) return;
    setDestination(generatedDream.destination);
    openProject("courier");
    document.getElementById("workshop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePipTap = () => {
    if (secretFound) return;
    const nextCount = pipTapCount + 1;
    setPipTapCount(nextCount);
    if (nextCount >= 5) setSecretFound(true);
  };

  const enterDreamMode = () => {
    try {
      const alreadyCounted = window.sessionStorage.getItem("pip-dream-counted-this-session") === "1";
      if (!alreadyCounted) {
        const previousCount = Number(window.localStorage.getItem("pip-dream-visit-count") || 0);
        const safePreviousCount = Number.isSafeInteger(previousCount) && previousCount >= 0 ? previousCount : 0;
        const nextCount = Math.min(safePreviousCount + 1, 999999);
        window.localStorage.setItem("pip-dream-visit-count", String(nextCount));
        window.sessionStorage.setItem("pip-dream-counted-this-session", "1");
        setVisitCount(nextCount);
        setReturningVisitor(safePreviousCount > 0);
      } else {
        const savedCount = Number(window.localStorage.getItem("pip-dream-visit-count") || 0);
        if (Number.isSafeInteger(savedCount) && savedCount >= 0) setVisitCount(savedCount);
        setReturningVisitor(savedCount > 0);
      }
    } catch {
      // Keep the experience usable when this browser blocks storage.
      setVisitCount((count) => Math.min(count + 1, 999999));
    }
    setStarted(true);
  };

  const playLullaby = async () => {
    if (!soundEnabledRef.current || lullabyPlaying) return;

    setLullabyPlaying(true);
    const selectedMood = dreamConfig.moods[ritualMood] ?? dreamConfig.moods.rest;
    const didPlay = await lullabyEngineRef.current?.playArpeggio({
      moodConfig: selectedMood,
      text: `${selectedMood.label} ${selectedMood.line}`,
      keywords: selectedMood.keywords,
      soundEnabled: soundEnabledRef.current,
      componentLoadState: "ready",
      volume: 0.1,
      noteCount: 6,
      noteSpacingMs: 220,
      durationMs: 300,
      delayMs: 12,
    });

    if (!didPlay) {
      setLullabyPlaying(false);
      return;
    }

    window.clearTimeout(lullabyTimerRef.current);
    lullabyTimerRef.current = window.setTimeout(() => {
      setLullabyPlaying(false);
    }, 6 * 220 + 400);
  };

  const toggleSound = (nextEnabled = !soundEnabled) => {
    // Stop scheduled voices synchronously before React's next render.
    soundEnabledRef.current = nextEnabled;
    setDreamAudioEnabled(nextEnabled);
    lullabyEngineRef.current?.setEnabled(nextEnabled);
    if (!nextEnabled) setLullabyPlaying(false);
    setSoundEnabledState(nextEnabled);
  };

  const openProject = (project) => {
    window.clearTimeout(courierTimerRef.current);
    setCourierStatus("idle");
    setCourierReceipt(null);
    setActiveProject(project);
    if (project === "courier") setPipExpression("curious");
  };

  const closeProject = () => {
    window.clearTimeout(courierTimerRef.current);
    setCourierStatus("idle");
    setCourierReceipt(null);
    setActiveProject(null);
  };

  const sendDream = () => {
    if (courierStatus === "preparing" || courierStatus === "in-flight") return;
    window.clearTimeout(courierTimerRef.current);
    setCourierReceipt(null);
    setPipExpression("curious");
    setCourierStatus("preparing");

    const dream = generatedDream?.destination === destination ? generatedDream : null;
    const receiptDraft = {
      serial: `PD-${String(Date.now()).slice(-6)}`,
      title: dream?.title || `A Little Wish for ${destination}`,
      mood: dream?.mood || "A little hope",
      ingredient: dream?.ingredient || "Moonlight",
      destination,
      dateLabel: new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
    };

    // A short launch sequence makes the delivery feel intentional without holding the visitor for long.
    courierTimerRef.current = window.setTimeout(() => {
      setCourierStatus("in-flight");
      courierTimerRef.current = window.setTimeout(() => {
        setCourierReceipt(receiptDraft);
        setCourierStatus("delivered");
        setPipExpression("delighted");
      }, 1450);
    }, 420);
  };

  if (!started) {
    return (
      <main className="boot-screen">
        <div className="boot-card">
          <div className="boot-stars" aria-hidden="true">✦ · ˚ ✧ · ˚ ✦</div>
          <p className="boot-label">MIDNIGHT NURSERY SYSTEMS</p>
          <h1>PIP:// DREAM.EXE</h1>
          <p className="boot-subtitle">Junior Dream Engineer</p>
          <div className="boot-divider" />
          <p className="boot-message">Preparing a small world of dreams...</p>
          <button className="dream-button" onClick={enterDreamMode}>
            ENTER DREAM MODE
          </button>
          <p className="boot-hint">press gently ✦</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`desktop ${dayMode ? "day-mode" : ""} ${chaosMode ? "chaos-mode" : ""} ${focusMode ? "focus-mode" : ""}`}
      data-active-mood={ritualMood}
      style={{
        "--active-mood-primary": activeMoodConfig.primaryColor,
        "--active-mood-accent": activeMoodConfig.accentColor,
        "--active-mood-ambient": activeMoodConfig.ambientColor,
      }}
    >
      <canvas
        ref={sparkleTrailCanvasRef}
        className="dream-sparkle-canvas"
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 79,
          display: started && !focusMode ? "block" : "none",
        }}
      />
      <a className="skip-link" href="#workshop">Skip to the workshop</a>
      <div ref={cursorSparkleRef} className="cursor-sparkle" aria-hidden="true">✦</div>
      <header className="desktop-header">
        <div className="header-brand">
          <div className="brand-mark" aria-hidden="true"><span>P</span><i>✦</i></div>
          <div className="brand-copy">
            <p className="system-label">MIDNIGHT NURSERY SYSTEMS</p>
            <h1>Pip&apos;s Dream Workshop</h1>
            <p className="brand-subtitle">A PERSONAL DREAM OPERATING SYSTEM</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDayMode((mode) => !mode)}
            aria-pressed={dayMode}
          >
            {dayMode ? "☾ Night mode" : "☀ Day mode"}
          </button>
          <button
            className={`theme-toggle focus-toggle ${focusMode ? "is-active" : ""}`}
            type="button"
            onClick={() => {
              const nextFocus = !focusMode;
              setFocusMode(nextFocus);
              if (nextFocus) {
                window.setTimeout(() => document.getElementById("dream-ritual")?.scrollIntoView({
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                  block: "start",
                }), 0);
              }
            }}
            aria-pressed={focusMode}
            title="Bring the Dream Ritual into focus."
          >
            {focusMode ? "◎ Exit focus" : "◎ Ritual focus"}
          </button>
          <ChaosOverlay
            enabled={chaosMode}
            onToggle={setChaosMode}
            label="1999 Chaos Mode"
            disabledLabel="🌀 Chaos mode"
            enabledLabel="✦ Calm the chaos"
            className={`theme-toggle chaos-toggle ${chaosMode ? "is-active" : ""}`}
          />
          <div className="status">
            <span className="status-dot" />
            DREAM MACHINE ONLINE
          </div>
        </div>
      </header>

      <nav className="quick-nav" aria-label="Main navigation">
        <a href="#profile"><span>01</span> PROFILE</a>
        <a href="#workshop"><span>02</span> WORKSHOP</a>
        <a href="#dream-ritual"><span>03</span> DREAM RITUAL</a>
        <a href="#origin-story"><span>04</span> DREAM LOG</a>
        <span className="quick-nav-meta"><i aria-hidden="true" /> BUILD 1.0 · 3 MODULES</span>
      </nav>

      <section className="pip-area" id="profile" aria-labelledby="pip-heading">
        <div className="orbit-card orbit-card-left" aria-hidden="true">
          <span>MOOD FILE</span><strong>sleepy.exe</strong><small>RUNNING WELL</small>
        </div>
        <div className="orbit-card orbit-card-right" aria-hidden="true">
          <span>MODULES READY</span><strong>03 <i>／ 03</i></strong><small>ALL SYSTEMS GENTLE</small>
        </div>
        <div className="stars" aria-hidden="true">✦ ˚ ✧ ⋆ ˚ ✦ ˚ ⋆</div>
        <button
          type="button"
          className={`pip pip-secret-trigger pip-expression-${pipExpression} ${secretFound ? "secret-found" : ""}`}
          aria-label={`Pip, a little dream engineer, currently ${pipExpression}. Tap five times to find a secret.`}
          onClick={handlePipTap}
        >
          <div className="nightcap" aria-hidden="true">
            <span>★</span><span>✦</span><span>★</span>
          </div>
          <div className="face">
            <div className="eye left-eye"><span /></div>
            <div className="eye right-eye"><span /></div>
            <div className="smile">⌣</div>
          </div>
          <div className="bow" aria-hidden="true">🎀</div>
        </button>

        <div className="pip-intro">
          <p className="pip-role">JUNIOR DREAM ENGINEER</p>
          <h2 id="pip-heading">Hi, I&apos;m Pip.</h2>
          <p>I build the dreams you fall asleep inside.</p>
          <small>Curious · Sleepy · Gentle · Slightly Clumsy</small>
          <p className="pip-reaction" aria-live="polite">
            {pipExpression === "delighted" ? "Pip is doing a tiny victory wiggle ✦"
              : pipExpression === "brave" ? "Pip packed an extra lantern for courage."
                : pipExpression === "curious" ? "Pip is checking the little star map…"
                  : "Pip is listening for a kind little dream."}
          </p>
          <p className="visit-memory" aria-live="polite">
            {returningVisitor ? "WELCOME BACK, DREAMER · I KEPT THE LIGHT ON" : "FIRST VISIT · MAKE YOURSELF AT HOME"}
          </p>
          <div className="hero-signals" aria-label="Pip's principles">
            <span><i aria-hidden="true">✦</i> SOFT MAGIC ENABLED</span>
            <span><i aria-hidden="true">♡</i> NO DREAM LEFT BEHIND</span>
          </div>
        </div>
      </section>

      <div className="dream-ticker" aria-label="Dream system status">
        <span className="ticker-live"><i aria-hidden="true" /> SIGNAL ONLINE</span>
        <p>Every little dream deserves a safe journey <span aria-hidden="true">✦</span> take what you need, leave a little wonder.</p>
        <div className="visitor-odometer" title="Dream activity is counted locally in this browser, not shared across visitors." aria-label={`Dream activity counter: ${dreamActivityCount} events recorded in this browser`} aria-live="polite" aria-atomic="true">
          <span>DREAMS SIMULATED</span>
          <strong key={dreamActivityCount} aria-hidden="true">{String(dreamActivityCount).padStart(6, "0").slice(-6).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</strong>
          <small>THIS DEVICE</small>
        </div>
      </div>

      <section className="workshop" id="workshop" aria-labelledby="workshop-heading">
        <div className="section-heading">
          <div>
            <p>OPEN THE WORKSHOP <span className="section-heading-slash">/ CHOOSE A MODULE</span></p>
            <h2 id="workshop-heading">What should we make tonight?</h2>
          </div>
          <span className="section-heading-note">THREE LITTLE WAYS TO DREAM <b>↘</b></span>
        </div>

        <div className="project-grid">
          <button className={`project-card ${lullabyPlaying ? "is-playing" : ""}`} onClick={playLullaby} aria-pressed={lullabyPlaying}>
            <span className="project-topline"><span className="project-index">MODULE 01</span><span className="project-status">AUDIO</span></span>
            <span className="project-icon icon-music" aria-hidden="true">♫</span>
            <span className="project-title">{lullabyPlaying ? "Lullaby playing" : "Lullaby Lab"}</span>
            <span className="project-description">
              {lullabyPlaying
                ? "Pip is playing a tiny bedtime melody."
                : "Build a tiny bedtime melody."}
            </span>
            <span className="project-card-footer"><span>{lullabyPlaying ? "SEQUENCE PLAYING" : "PLAY A MELODY"}</span><span aria-hidden="true">↗</span></span>
          </button>

          <button
            className={`project-card ${activeProject === "nightlight" ? "is-selected" : ""}`}
            onClick={() => (activeProject === "nightlight" ? closeProject() : openProject("nightlight"))}
            aria-label={activeProject === "nightlight" ? "Close Nightlight Studio panel" : "Open Nightlight Studio panel"}
            aria-expanded={activeProject === "nightlight"}
            aria-controls={activeProject === "nightlight" ? "nightlight-panel" : undefined}
          >
            <span className="project-topline"><span className="project-index">MODULE 02</span><span className="project-status">LIGHT</span></span>
            <span className="project-icon icon-light" aria-hidden="true">✹</span>
            <span className="project-title">Nightlight Studio</span>
            <span className="project-description">Paint the perfect sleepy glow.</span>
            <span className="project-card-footer"><span>{activeProject === "nightlight" ? "MIXER OPEN" : "OPEN LIGHT MIXER"}</span><span aria-hidden="true">↗</span></span>
          </button>

          <button
            className={`project-card ${activeProject === "courier" ? "is-selected" : ""}`}
            onClick={() => (activeProject === "courier" ? closeProject() : openProject("courier"))}
            aria-label={activeProject === "courier" ? "Close Dream Courier panel" : "Open Dream Courier panel"}
            aria-expanded={activeProject === "courier"}
            aria-controls={activeProject === "courier" ? "courier-panel" : undefined}
          >
            <span className="project-topline"><span className="project-index">MODULE 03</span><span className="project-status">DELIVERY</span></span>
            <span className="project-icon icon-rocket" aria-hidden="true">🚀</span>
            <span className="project-title">Dream Courier</span>
            <span className="project-description">Deliver a dream across the night sky.</span>
            <span className="project-card-footer"><span>{activeProject === "courier" ? "ROUTE PLANNER OPEN" : "CHOOSE A DESTINATION"}</span><span aria-hidden="true">↗</span></span>
          </button>
        </div>

        {activeProject === "nightlight" && (
          <section id="nightlight-panel" className="project-panel" aria-labelledby="nightlight-title" aria-label="Nightlight Studio controls">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">WORKSHOP MODULE 02</p>
                <h3 id="nightlight-title">Nightlight Studio</h3>
                <p className="panel-copy">Find a gentle glow for tonight&apos;s dream.</p>
              </div>
              <button className="panel-close" onClick={closeProject} aria-label="Close Nightlight Studio">✕</button>
            </div>

            <div
              className={`nightlight-scene ${nightlightEnabled ? "lamp-on" : "lamp-off"}`}
              style={{
                "--glow-opacity": nightlightEnabled ? String((nightlightBrightness / 100) * 0.72) : "0",
                "--glow-shadow-opacity": nightlightEnabled ? String((nightlightBrightness / 100) * 0.65) : "0",
              }}
            >
              <span className="scene-star star-one" aria-hidden="true">✦</span>
              <span className="scene-star star-two" aria-hidden="true">✧</span>
              <span className="scene-moon" aria-hidden="true">☾</span>
              <span className="scene-lamp" aria-hidden="true">{nightlightEnabled ? "💡" : "🌙"}</span>
              <p>{nightlightEnabled ? "A little light for little dreams." : "The room is resting in the dark."}</p>
            </div>

            <div className="nightlight-controls">
              <label className="brightness-control" htmlFor="glow-slider">
                <span>Glow strength</span>
                <strong>{nightlightEnabled ? `${nightlightBrightness}%` : "OFF"}</strong>
                <input
                  id="glow-slider"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={nightlightBrightness}
                  disabled={!nightlightEnabled}
                  onChange={(event) => setNightlightBrightness(Number(event.target.value))}
                />
                <span className="range-ends"><span>soft glow</span><span>bright moon</span></span>
              </label>
              <button
                className="action-button"
                onClick={() => setNightlightEnabled((enabled) => !enabled)}
                aria-pressed={nightlightEnabled}
              >
                {nightlightEnabled ? "Turn nightlight off" : "Turn nightlight on"}
              </button>
            </div>
          </section>
        )}

        {activeProject === "courier" && (
          <section id="courier-panel" className="project-panel courier-panel" aria-labelledby="courier-title" aria-label="Dream Courier controls">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">WORKSHOP MODULE 03</p>
                <h3 id="courier-title">Dream Courier</h3>
                <p className="panel-copy">Choose a place, then send a little dream on its way.</p>
              </div>
              <button className="panel-close" onClick={closeProject} aria-label="Close Dream Courier">✕</button>
            </div>

            <label className="destination-control" htmlFor="dream-destination">
              Dream destination
              <select
                id="dream-destination"
                value={destination}
                disabled={courierStatus === "preparing" || courierStatus === "in-flight"}
                onChange={(event) => {
                  setDestination(event.target.value);
                  setCourierStatus("idle");
                }}
              >
                <option>Moon Garden</option>
                <option>Cloud Harbor</option>
                <option>Star Library</option>
              </select>
            </label>

            <div className={`courier-sky ${courierStatus === "in-flight" ? "flight-active" : ""}`}>
              <span className="courier-cloud cloud-left" aria-hidden="true">☁</span>
              <span className="courier-cloud cloud-right" aria-hidden="true">☁</span>
              <span className="courier-path" aria-hidden="true" />
              <span
                key={`${destination}-${courierStatus}`}
                className={`courier-rocket ${courierStatus === "preparing" ? "is-preparing" : ""} ${courierStatus === "in-flight" ? "is-flying" : ""} ${courierStatus === "delivered" ? "at-destination" : ""}`}
                aria-hidden="true"
              >🚀</span>
              <span className="destination-star" aria-hidden="true">✦</span>
              <span className="destination-label">{destination}</span>
            </div>

            <div className="courier-footer">
              <p className={`courier-message ${courierStatus}`} aria-live="polite">
                {courierStatus === "preparing"
                  ? `Pip is packing the dream for ${destination}…`
                  : courierStatus === "in-flight"
                    ? `Pip is flying to ${destination}…`
                    : courierStatus === "delivered"
                      ? `Dream delivered to ${destination}! Sweet dreams ✨`
                      : "The sky is clear. Ready for delivery?"}
              </p>
              <button
                className="action-button send-dream-button"
                onClick={sendDream}
                disabled={courierStatus === "preparing" || courierStatus === "in-flight"}
              >
                {courierStatus === "preparing" ? "Preparing launch…" : courierStatus === "in-flight" ? "Dream in transit…" : courierStatus === "delivered" ? "Send another dream" : "Send the dream ✦"}
              </button>
            </div>

            {courierReceipt && courierStatus === "delivered" && (
              <article className="dream-passport" aria-labelledby="passport-title">
                <div className="passport-topline"><span>MIDNIGHT NURSERY POST</span><span>{courierReceipt.serial}</span></div>
                <div className="passport-main">
                  <div className="passport-copy">
                    <p className="panel-kicker">DELIVERY CONFIRMED · {courierReceipt.dateLabel.toUpperCase()}</p>
                    <h4 id="passport-title">Dream Passport</h4>
                    <p className="passport-dream-title">{courierReceipt.title}</p>
                    <dl className="passport-details">
                      <div><dt>DESTINATION</dt><dd>{courierReceipt.destination}</dd></div>
                      <div><dt>MOOD</dt><dd>{courierReceipt.mood}</dd></div>
                      <div><dt>INGREDIENT</dt><dd>{courierReceipt.ingredient}</dd></div>
                    </dl>
                  </div>
                  <div className="passport-stamp" aria-label="Dream successfully delivered"><span>✦</span><strong>DELIVERED</strong><small>BY PIP</small></div>
                </div>
                <div className="passport-bottomline"><span>NO DREAM LEFT BEHIND</span><span>KEEP THIS LITTLE WORLD</span></div>
                <button type="button" className="action-button passport-print" onClick={() => printDreamPassport(courierReceipt)}>Print dream keepsake ↗</button>
              </article>
            )}
          </section>
        )}

        <div className="sound-control" aria-label="Dream audio preferences">
          <BonusAudioController soundEnabled={soundEnabled} onToggle={toggleSound} />
        </div>
      </section>

      <section className="dream-ritual" id="dream-ritual" aria-labelledby="ritual-heading">
        <div className="ritual-heading">
          <div>
            <p className="panel-kicker">PERSONAL MODULE · RITUAL 001</p>
            <h2 id="ritual-heading">Make a dream that feels like yours.</h2>
            <p>Three tiny choices. One small world to take with you.</p>
          </div>
          <div className="ritual-day-stamp"><span>TONIGHT&apos;S SEED</span><strong>{todayKey}</strong><small>NEW PROMPT EACH DAY</small></div>
        </div>

        <div className="daily-prompt"><span aria-hidden="true">✧</span><div><small>PIP&apos;S QUESTION OF THE DAY</small><p>{dailyDreamPrompt}</p></div></div>

        <div className="ritual-steps">
          <fieldset className="ritual-step">
            <legend><span>01</span> How are you arriving tonight?</legend>
            <div className="choice-grid mood-choices">
              {dreamMoods.map((mood) => (
                <button key={mood.id} type="button" className={`choice-card ${ritualMood === mood.id ? "is-chosen" : ""}`} onClick={() => { setRitualMood(mood.id); setPipExpression(mood.expression); }} aria-pressed={ritualMood === mood.id}>
                  <span className="choice-icon" aria-hidden="true">{mood.icon}</span><strong>{mood.label}</strong><small>{mood.subLabel}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ritual-step">
            <legend><span>02</span> Add one ingredient to your dream.</legend>
            <div className="choice-grid ingredient-choices">
              {dreamIngredients.map((ingredient) => (
                <button key={ingredient.id} type="button" className={`ingredient-choice ${ritualIngredient === ingredient.id ? "is-chosen" : ""}`} onClick={() => setRitualIngredient(ingredient.id)} aria-pressed={ritualIngredient === ingredient.id}>
                  <span aria-hidden="true">{ingredient.icon}</span>{ingredient.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="ritual-step ritual-destination-step">
            <legend><span>03</span> Where should Pip send it?</legend>
            <div className="destination-picks">
              {dreamDestinations.map((place) => (
                <button key={place} type="button" className={ritualDestination === place ? "is-chosen" : ""} onClick={() => setRitualDestination(place)} aria-pressed={ritualDestination === place}>{place}</button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="ritual-actions">
          <p>Your choices stay on this device. No account, no pressure—just a little ritual.</p>
          <button type="button" className="action-button ritual-create-button" onClick={createDreamRecipe}>Make my dream ✦</button>
        </div>

        {generatedDream && (
          <article className="dream-recipe-card" aria-live="polite">
            <div className="recipe-card-topline"><span>YOUR DREAM RECIPE</span><span>{generatedDream.dateLabel}</span></div>
            <div className="recipe-card-art" aria-hidden="true"><span>{generatedDream.ingredientIcon}</span><i>✦</i><b>{generatedDream.moodIcon}</b><span>☾</span></div>
            <p className="panel-kicker">A LITTLE DREAM FOR {generatedDream.mood.toUpperCase()}</p>
            <h3>{generatedDream.title}</h3>
            <p className="recipe-message">{generatedDream.message}</p>
            <div className="recipe-tags"><span>{generatedDream.mood}</span><span>{generatedDream.ingredient}</span><span>{generatedDream.destination}</span></div>
            <div className="recipe-actions">
              <button type="button" className="action-button" onClick={saveDreamRecipe}>Save to dream shelf ♡</button>
              <button type="button" className="recipe-send-button" onClick={sendRitualDream}>Send with Pip ↗</button>
            </div>
            {dreamSaveMessage && <p className="recipe-save-feedback" role="status">✦ {dreamSaveMessage}</p>}
          </article>
        )}

        <div className="dream-shelf">
          <div className="shelf-heading"><div><p className="panel-kicker">YOUR LOCAL COLLECTION</p><h3>Dream shelf <span>{dreamShelf.length}/4</span></h3></div><small>Little worlds you chose to keep</small></div>
          {dreamShelf.length ? (
            <div className="shelf-grid">
              {dreamShelf.map((dream) => (
                <article className="shelf-card" key={dream.id}>
                  <div className="shelf-card-icons" aria-hidden="true"><span>{dream.ingredientIcon || "✦"}</span><span>{dream.moodIcon || "☾"}</span></div>
                  <p>{dream.dateLabel || "Saved dream"} · {dream.destination}</p>
                  <h4>{dream.title}</h4>
                  <button type="button" onClick={() => { setGeneratedDream(dream); setRitualDestination(dream.destination); setDreamSaveMessage(""); }}>Open this dream ↗</button>
                </article>
              ))}
            </div>
          ) : (
            <p className="shelf-empty">Your shelf is waiting for its first little world. Make a dream and save it here ✧</p>
          )}
          <p className="shelf-note">Stored in this browser only · Clear browser data and these saved dreams may disappear.</p>
        </div>
      </section>

      <section className="origin-story" id="origin-story" aria-labelledby="origin-heading">
        <div className="story-heading">
          <p>THE STORY SO FAR <span className="story-heading-code">/ MEMORY LOG 001</span></p>
          <h2 id="origin-heading">Every dream has a beginning.</h2>
          <span>Scroll gently to follow Pip&apos;s story ✦</span>
          <div className="story-progress-label"><span>ORIGIN FILE</span><strong>03 SCENES · 01 PROMISE</strong></div>
        </div>
        <div className="story-timeline">
          <article className="story-scene scene-nursery">
            <span className="story-number">01 / THE FIND</span>
            <span className="story-illustration" aria-hidden="true">🌙</span>
            <div>
              <h3>A spark in the quiet</h3>
              <p>One sleepy night, Pip found a tiny star hiding under a cloud. It was a dream that had lost its way home.</p>
            </div>
          </article>
          <article className="story-scene scene-lullaby">
            <span className="story-number">02 / THE IDEA</span>
            <span className="story-illustration" aria-hidden="true">🎵</span>
            <div>
              <h3>A melody to guide it</h3>
              <p>Pip built a little lullaby machine. Each gentle note became a lantern, lighting a safe path through the dark.</p>
            </div>
          </article>
          <article className="story-scene scene-courier">
            <span className="story-number">03 / THE PROMISE</span>
            <span className="story-illustration" aria-hidden="true">🚀</span>
            <div>
              <h3>No dream left behind</h3>
              <p>Now Pip runs a tiny workshop for wandering dreams: make a glow, pack a wish, and send a little wonder where it belongs.</p>
            </div>
          </article>
        </div>
        <DreamGuestbook dreamsSimulated={dreamActivityCount} />

        {secretFound && (
          <aside className="secret-note" role="status" aria-label="Pip secret message" aria-live="polite">
            <span className="secret-stamp" aria-hidden="true">✦</span>
            <div>
              <p className="panel-kicker">HIDDEN FILE FOUND · 05/05</p>
              <h3>Pip&apos;s little secret</h3>
              <p>Dear dreamer, even the smallest light can help someone find their way. Thank you for staying curious. — Pip</p>
            </div>
            <button className="panel-close" onClick={() => setSecretFound(false)} aria-label="Close secret note">✕</button>
          </aside>
        )}
        <footer className="site-credits">
          <span>MADE UNDER A FRIENDLY NIGHT SKY</span>
          <span>CSS-DRAWN PIP · NUNITO + DM MONO / GOOGLE FONTS</span>
          <span>PIP:// DREAM.EXE · MIDNIGHT NURSERY SYSTEMS</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
