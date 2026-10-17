import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [started, setStarted] = useState(false);
  const [lullabyPlaying, setLullabyPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef(null);

  const playLullaby = () => {
  if (!soundEnabled) return;

  if (lullabyPlaying) return;

  const AudioContext =
    window.AudioContext || window.webkitAudioContext;

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
  }

  const audioContext = audioContextRef.current;

  const notes = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23];

  setLullabyPlaying(true);

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const startTime = audioContext.currentTime + index * 0.45;
    const endTime = startTime + 0.4;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, endTime);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(endTime);
  });

  setTimeout(() => {
    setLullabyPlaying(false);
  }, notes.length * 450);
};

  if (!started) {
    return (
      <main className="boot-screen">
        <div className="boot-card">
          <div className="boot-stars">✦ · ˚ ✧ · ˚ ✦</div>

          <p className="boot-label">MIDNIGHT NURSERY SYSTEMS</p>

          <h1>PIP:// DREAM.EXE</h1>

          <p className="boot-subtitle">
            Junior Dream Engineer
          </p>

          <div className="boot-divider" />

          <p className="boot-message">
            Preparing a small world of dreams...
          </p>

          <button
            className="dream-button"
            onClick={() => setStarted(true)}
          >
            ENTER DREAM MODE
          </button>

          <p className="boot-hint">press gently ✦</p>
        </div>
      </main>
    );
  }

  return (
    <main className="desktop">
      <header className="desktop-header">
        <div>
          <p className="system-label">MIDNIGHT NURSERY SYSTEMS</p>
          <h1>Pip's Dream Workshop</h1>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          DREAM MACHINE ONLINE
        </div>
      </header>

      <section className="pip-area">
        <div className="stars">✦　˚　✧　⋆　˚　✦　˚　⋆</div>

        <div className="pip">
          <div className="nightcap">
            <span>★</span>
            <span>✦</span>
            <span>★</span>
          </div>

          <div className="face">
            <div className="eye left-eye">
              <span></span>
            </div>

            <div className="eye right-eye">
              <span></span>
            </div>

            <div className="smile">⌣</div>
          </div>

          <div className="bow">🎀</div>
        </div>

        <div className="pip-intro">
          <p className="pip-role">JUNIOR DREAM ENGINEER</p>

          <h2>Hi, I'm Pip.</h2>

          <p>
            I build the dreams you fall asleep inside.
          </p>

          <small>
            Curious · Sleepy · Gentle · Slightly Clumsy
          </small>
        </div>
      </section>

      <section className="workshop">
        <div className="section-heading">
          <p>OPEN THE WORKSHOP</p>
          <h2>What should we make tonight?</h2>
        </div>

        <div className="project-grid">
          <button
  className="project-card"
  onClick={playLullaby}
>
  <span className="project-icon">🎵</span>

  <span className="project-title">
    {lullabyPlaying ? "Playing..." : "Lullaby Lab"}
  </span>

  <span className="project-description">
    {lullabyPlaying
      ? "Pip is playing a tiny bedtime melody."
      : "Build a tiny bedtime melody."}
  </span>
</button>

          <button className="project-card">
            <span className="project-icon">💡</span>
            <span className="project-title">Nightlight Studio</span>
            <span className="project-description">
              Paint the perfect sleepy glow.
            </span>
          </button>

          <button className="project-card">
            <span className="project-icon">🚀</span>
            <span className="project-title">Dream Courier</span>
            <span className="project-description">
              Deliver a dream across the night sky.
            </span>
          </button>
        </div>
        
        <div className="sound-control">
  <button
    onClick={() => setSoundEnabled(!soundEnabled)}
  >
    {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
  </button>
</div>
      </section>
    </main>
  );
}

export default App;