import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [started, setStarted] = useState(false);
  const [lullabyPlaying, setLullabyPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [nightlightEnabled, setNightlightEnabled] = useState(true);
  const [nightlightBrightness, setNightlightBrightness] = useState(65);
  const [destination, setDestination] = useState("Moon Garden");
  const [courierStatus, setCourierStatus] = useState("idle");
  const [dayMode, setDayMode] = useState(false);
  const [pipTapCount, setPipTapCount] = useState(0);
  const [secretFound, setSecretFound] = useState(false);

  const audioContextRef = useRef(null);
  const cursorSparkleRef = useRef(null);
  const masterGainRef = useRef(null);
  const courierTimerRef = useRef(null);
  const lullabyTimerRef = useRef(null);

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

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      sparkle.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY + 10}px, 0) rotate(${(event.clientX + event.clientY) % 36}deg)`;
      sparkle.style.opacity = "0.9";
    };
    const hideSparkle = () => { sparkle.style.opacity = "0"; };

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

  const handlePipTap = () => {
    if (secretFound) return;
    const nextCount = pipTapCount + 1;
    setPipTapCount(nextCount);
    if (nextCount >= 5) setSecretFound(true);
  };

  const playLullaby = async () => {
    if (!soundEnabled || lullabyPlaying) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = soundEnabled ? 1 : 0;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    const audioContext = audioContextRef.current;
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const notes = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23];
    setLullabyPlaying(true);

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const noteGain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      const startTime = audioContext.currentTime + index * 0.45;
      const endTime = startTime + 0.4;
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
      noteGain.gain.linearRampToValueAtTime(0, endTime);

      oscillator.connect(noteGain);
      noteGain.connect(masterGainRef.current);
      oscillator.start(startTime);
      oscillator.stop(endTime);
    });

    window.clearTimeout(lullabyTimerRef.current);
    lullabyTimerRef.current = window.setTimeout(() => {
      setLullabyPlaying(false);
    }, notes.length * 450);
  };

  const toggleSound = () => {
    const nextEnabled = !soundEnabled;
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        nextEnabled ? 1 : 0,
        audioContextRef.current.currentTime,
        0.025,
      );
    }
    setSoundEnabled(nextEnabled);
  };

  const openProject = (project) => {
    window.clearTimeout(courierTimerRef.current);
    setCourierStatus("idle");
    setActiveProject(project);
  };

  const closeProject = () => {
    window.clearTimeout(courierTimerRef.current);
    setCourierStatus("idle");
    setActiveProject(null);
  };

  const sendDream = () => {
    if (courierStatus === "in-flight") return;
    window.clearTimeout(courierTimerRef.current);
    setCourierStatus("in-flight");
    courierTimerRef.current = window.setTimeout(() => {
      setCourierStatus("delivered");
    }, 1800);
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
          <button className="dream-button" onClick={() => setStarted(true)}>
            ENTER DREAM MODE
          </button>
          <p className="boot-hint">press gently ✦</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`desktop ${dayMode ? "day-mode" : ""}`}>
      <div ref={cursorSparkleRef} className="cursor-sparkle" aria-hidden="true">✦</div>
      <header className="desktop-header">
        <div>
          <p className="system-label">MIDNIGHT NURSERY SYSTEMS</p>
          <h1>Pip&apos;s Dream Workshop</h1>
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
          <div className="status">
            <span className="status-dot" />
            DREAM MACHINE ONLINE
          </div>
        </div>
      </header>

      <section className="pip-area" aria-labelledby="pip-heading">
        <div className="stars" aria-hidden="true">✦ ˚ ✧ ⋆ ˚ ✦ ˚ ⋆</div>
        <button
          type="button"
          className={`pip pip-secret-trigger ${secretFound ? "secret-found" : ""}`}
          aria-label="Pip, a sleepy little dream engineer."
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
        </div>
      </section>

      <section className="workshop" aria-labelledby="workshop-heading">
        <div className="section-heading">
          <p>OPEN THE WORKSHOP</p>
          <h2 id="workshop-heading">What should we make tonight?</h2>
        </div>

        <div className="project-grid">
          <button className="project-card" onClick={playLullaby} aria-pressed={lullabyPlaying}>
            <span className="project-icon" aria-hidden="true">🎵</span>
            <span className="project-title">{lullabyPlaying ? "Playing..." : "Lullaby Lab"}</span>
            <span className="project-description">
              {lullabyPlaying
                ? "Pip is playing a tiny bedtime melody."
                : "Build a tiny bedtime melody."}
            </span>
          </button>

          <button
            className="project-card"
            onClick={() => openProject("nightlight")}
            aria-expanded={activeProject === "nightlight"}
          >
            <span className="project-icon" aria-hidden="true">💡</span>
            <span className="project-title">Nightlight Studio</span>
            <span className="project-description">Paint the perfect sleepy glow.</span>
          </button>

          <button
            className="project-card"
            onClick={() => openProject("courier")}
            aria-expanded={activeProject === "courier"}
          >
            <span className="project-icon" aria-hidden="true">🚀</span>
            <span className="project-title">Dream Courier</span>
            <span className="project-description">Deliver a dream across the night sky.</span>
          </button>
        </div>

        {activeProject === "nightlight" && (
          <section className="project-panel" aria-labelledby="nightlight-title">
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
          <section className="project-panel courier-panel" aria-labelledby="courier-title">
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
                disabled={courierStatus === "in-flight"}
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
                key={`${destination}-${courierStatus === "in-flight" ? "flight" : "rest"}`}
                className={`courier-rocket ${courierStatus === "in-flight" ? "is-flying" : ""} ${courierStatus === "delivered" ? "at-destination" : ""}`}
                aria-hidden="true"
              >🚀</span>
              <span className="destination-star" aria-hidden="true">✦</span>
              <span className="destination-label">{destination}</span>
            </div>

            <div className="courier-footer">
              <p className={`courier-message ${courierStatus}`} aria-live="polite">
                {courierStatus === "in-flight"
                  ? `Pip is flying to ${destination}...`
                  : courierStatus === "delivered"
                    ? `Dream delivered to ${destination}! Sweet dreams ✨`
                    : "The sky is clear. Ready for delivery?"}
              </p>
              <button
                className="action-button send-dream-button"
                onClick={sendDream}
                disabled={courierStatus === "in-flight"}
              >
                {courierStatus === "in-flight" ? "Dream in transit..." : courierStatus === "delivered" ? "Send another dream" : "Send the dream ✦"}
              </button>
            </div>
          </section>
        )}

        <div className="sound-control">
          <button onClick={toggleSound} aria-pressed={soundEnabled}>
            {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
          </button>
        </div>
      </section>

      <section className="origin-story" aria-labelledby="origin-heading">
        <div className="story-heading">
          <p>THE STORY SO FAR</p>
          <h2 id="origin-heading">Every dream has a beginning.</h2>
          <span>Scroll gently to follow Pip&apos;s story ✦</span>
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
        {secretFound && (
          <aside className="secret-note" role="status" aria-live="polite">
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
          <span>PIP:// DREAM.EXE · MIDNIGHT NURSERY SYSTEMS</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
