import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const app = read("src/App.jsx");
const audioBus = read("src/audio/dreamAudioBus.js");
const audioController = read("src/components/BonusAudioController.jsx");
const guestbook = read("src/components/DreamGuestbook.jsx");
const counterHook = read("src/hooks/usePersistentDreamCounter.js");
const manifest = read("src/components/ProjectManifest.jsx");
const dreamConfig = JSON.parse(read("src/dreams.config.json"));
const dreamSchema = JSON.parse(read("src/dreams.schema.json"));

function listSourceFiles(directory) {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = join(directory, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) return listSourceFiles(relativePath);
    return /\.(?:js|jsx)$/.test(entry.name) ? [relativePath] : [];
  });
}

for (const relativePath of listSourceFiles("src")) {
  if (relativePath === "src/audio/dreamAudioBus.js") continue;
  const source = read(relativePath);
  check(!/new\s+(?:window\.)?(?:AudioContext|webkitAudioContext)(?:\s*\(|\s*;)/.test(source), `${relativePath} must not create an independent AudioContext.`);
  if (relativePath !== "src/utils/LullabyLabEngine.js") {
    check(!/createOscillator\s*\(/.test(source), `${relativePath} must route generated audio through the shared LullabyLabEngine or dreamAudioBus.`);
  } else {
    check(source.includes("getAudioGraph") && source.includes("envelope.connect(output)"), "LullabyLabEngine must route voices through the shared app audio graph.");
  }
  check(!/\.connect\([^)]*destination\)/.test(source), `${relativePath} must not bypass the shared master output.`);
}

check(app.includes('from "./audio/dreamAudioBus.js"'), "App must use the shared audio bus.");
check(app.includes('from "./dreams.config.json"'), "App must read mood and recipe data from the canonical config.");
check(app.includes('from "./components/ChaosOverlay.jsx"'), "App must mount the controlled ChaosOverlay.");
check(app.includes('from "./utils/LullabyLabEngine.js"'), "App must use the shared-bus LullabyLabEngine.");
check(app.includes("recipeTemplates?.titles") && app.includes("recipeTemplates?.messages"), "Dream titles and messages must be rendered from configuration templates.");
check(app.includes("enabled={chaosMode}") && app.includes("onToggle={setChaosMode}"), "ChaosOverlay must be controlled by App state.");
check(dreamConfig.schemaVersion === 1, "Canonical dream configuration must declare schemaVersion 1.");
check(["rest", "courage", "wonder"].every((mood) => Boolean(dreamConfig.moods[mood]?.audio?.baseFrequencyHz)), "All active UI moods need configured audio profiles.");
check(dreamConfig.ingredients.length > 0 && dreamConfig.destinations.length > 0, "Ingredients and destination labels must be configuration-driven.");
check(dreamSchema.properties?.moods && dreamSchema.properties?.trackingMatrices, "JSON Schema must cover mood and local tracking configuration.");
check(!existsSync(join(root, "src/config/dreams.config.json")), "Do not keep a duplicate nested dream configuration.");
check(!existsSync(join(root, "src/audio/LullabyLabEngine.js")), "Keep one canonical LullabyLabEngine module.");
check(audioBus.includes("export function getDreamAudioGraph()"), "The shared audio bus must expose its graph to feature engines.");
check(app.includes('from "./components/BonusAudioController.jsx"'), "App must mount BonusAudioController.");
check(app.includes('from "./components/DreamGuestbook.jsx"'), "App must mount DreamGuestbook.");
check(!/new\s+(?:window\.)?(?:AudioContext|webkitAudioContext)/.test(app), "App must not create a second AudioContext.");
check(!/createOscillator\s*\(/.test(app), "App audio nodes must be created only by the audio engine and shared audio bus.");
check((audioBus.match(/\.connect\(audioContext\.destination\)/g) || []).length === 1, "The shared bus must be the only direct connection to AudioContext.destination.");
check(audioBus.includes("stopActiveOscillators()"), "Muting must stop active oscillator nodes immediately.");
check(audioController.includes("playDreamUiChime()"), "All interface click chimes must use the shared bus.");
check(audioController.includes("soundEnabled, onToggle"), "Audio control must be controlled by App state.");
check(counterHook.includes("useState(readInitialCounter)"), "Counter must hydrate synchronously before the first render.");
check(counterHook.includes('localStorage.getItem(COUNTER_STORAGE_KEY)'), "Counter must read its persistent value.");
check(counterHook.includes('localStorage.setItem(COUNTER_STORAGE_KEY, String(count))'), "Counter must persist updates.");
check(guestbook.includes("function DreamGuestbook({ dreamsSimulated = 0 })"), "Guestbook odometer must receive the parent-owned counter.");
check(guestbook.includes("formatOdometer(safeCounter)"), "Guestbook must render the zero-padded parent-owned count.");
check(!guestbook.includes("pip-dream-simulated-dreams"), "Guestbook must not maintain a competing counter key.");
check(app.includes('aria-controls={activeProject === "nightlight" ? "nightlight-panel" : undefined}'), "Nightlight disclosure must have a valid active aria-controls target.");
check(app.includes('aria-controls={activeProject === "courier" ? "courier-panel" : undefined}'), "Courier disclosure must have a valid active aria-controls target.");
check(app.includes('aria-label="Nightlight Studio controls"'), "Nightlight panel needs a distinct accessible label.");
check(app.includes('aria-label="Dream Courier controls"'), "Courier panel needs a distinct accessible label.");
check(manifest.includes("inert={!isExpanded}"), "Collapsed manifest panels must not leave hidden controls keyboard-focusable.");
check(manifest.includes("aria-expanded={isExpanded}"), "Manifest accordion triggers must expose their expanded state.");

if (failures.length > 0) {
  console.error("Dream OS architecture checks failed:");
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Dream OS architecture checks passed.");
}

if (process.exitCode) process.exit(process.exitCode);
if (process.argv.includes("--checks-only")) process.exit(0);

for (const command of [["run", "lint"], ["run", "build"]]) {
  console.log(`\n$ npm ${command.join(" ")}`);
  try {
    if (process.platform === "win32") {
      const commandLine = `npm ${command.join(" ")}`;
      execFileSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", commandLine], { cwd: root, stdio: "inherit" });
    } else {
      execFileSync("npm", command, { cwd: root, stdio: "inherit" });
    }
  } catch (error) {
    const exitCode = typeof error.status === "number" ? error.status : 1;
    console.error(`Command failed with exit code ${exitCode}: npm ${command.join(" ")}`);
    process.exit(exitCode);
  }
}
