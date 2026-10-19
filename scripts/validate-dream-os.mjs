import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const checksOnly = args.has("--checks-only");
const distOnly = args.has("--dist-only");
const failures = [];
const warnings = [];

function read(relativePath) {
  const absolutePath = resolve(ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Required project file is missing: ${relativePath}`);
  }
  return readFileSync(absolutePath, "utf8");
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath];
  });
}

function relativeToRoot(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join("/");
}

function printHeader(title) {
  console.log("\n+------------------------------------------------------------+");
  console.log(`| PIP:// DREAM.EXE :: ${title.padEnd(38, " ").slice(0, 38)}|`);
  console.log("| pip-dream-exe-team :: release gate                         |");
  console.log("+------------------------------------------------------------+");
}

function reportResults(successMessage) {
  if (warnings.length > 0) {
    for (const warning of warnings) console.warn(`[WARN] ${warning}`);
  }

  if (failures.length > 0) {
    console.error("\n[FAIL] Release gate blocked:");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return false;
  }

  console.log(`\n[PASS] ${successMessage}`);
  return true;
}

function runSourceChecks() {
  printHeader("SOURCE ARCHITECTURE CHECK");

  const app = read("src/App.jsx");
  const audioBus = read("src/audio/dreamAudioBus.js");
  const audioController = read("src/components/BonusAudioController.jsx");
  const guestbook = read("src/components/DreamGuestbook.jsx");
  const counterHook = read("src/hooks/usePersistentDreamCounter.js");
  const sparkleHook = read("src/hooks/useSparkleTrail.js");
  const manifest = read("src/components/ProjectManifest.jsx");
  const audioEngine = read("src/utils/LullabyLabEngine.js");
  const dreamConfig = JSON.parse(read("src/dreams.config.json"));
  const dreamSchema = JSON.parse(read("src/dreams.schema.json"));
  const sourceFiles = listFiles(resolve(ROOT, "src")).filter((file) => /\.(?:js|jsx|mjs)$/.test(file));

  check(app.includes('from "./audio/dreamAudioBus.js"'), "App must use the shared audio bus.");
  check(app.includes('from "./dreams.config.json"'), "App must use the canonical dream configuration.");
  check(app.includes('from "./components/ChaosOverlay.jsx"'), "App must mount ChaosOverlay.");
  check(app.includes('from "./utils/LullabyLabEngine.js"'), "App must use the shared-bus LullabyLabEngine.");
  check(app.includes('from "./hooks/useSparkleTrail.js"'), "App must mount the canvas sparkle trail hook.");
  check(app.includes("useSparkleTrail({") && app.includes("enabled: started && !focusMode"), "Sparkle trail must be scoped to the active dream interface.");
  check(app.includes("playSparkleChime({") && app.includes("soundEnabled: soundEnabledRef.current"), "Sparkle chimes must use the shared engine and app-level mute state.");
  check(app.includes("recipeTemplates?.titles") && app.includes("recipeTemplates?.messages"), "Dream copy must be rendered from configuration templates.");
  check(app.includes("enabled={chaosMode}") && app.includes("onToggle={setChaosMode}"), "ChaosOverlay must be controlled by App state.");
  check(dreamConfig.schemaVersion === 1, "Dream configuration must declare schemaVersion 1.");
  check(["rest", "courage", "wonder"].every((mood) => Boolean(dreamConfig.moods[mood]?.audio?.baseFrequencyHz)), "All active UI moods must define audio profiles.");
  check(dreamConfig.ingredients.length > 0 && dreamConfig.destinations.length > 0, "Ingredients and destinations must be data-driven.");
  check(dreamSchema.properties?.moods && dreamSchema.properties?.trackingMatrices, "JSON Schema must cover moods and local tracking configuration.");
  check(!existsSync(resolve(ROOT, "src/config/dreams.config.json")), "Do not retain the duplicate nested dream configuration.");
  check(!existsSync(resolve(ROOT, "src/audio/LullabyLabEngine.js")), "Keep one canonical LullabyLabEngine module under src/utils.");
  check(audioBus.includes("export function getDreamAudioGraph()"), "Shared audio bus must expose its graph to feature engines.");
  check(audioBus.includes("stopActiveOscillators()"), "Global mute must stop active shared-bus oscillators.");
  check(audioController.includes("playDreamUiChime()"), "Interface click sounds must use the shared audio bus.");
  check(audioController.includes("soundEnabled, onToggle"), "Audio control must be controlled by App state.");
  check(audioEngine.includes("async function playSparkleChime") && audioEngine.includes("playSparkleChime,"), "LullabyLabEngine must export a bounded sparkle-chime method on its engine instance.");
  check(audioEngine.includes("envelope.connect(output)"), "Engine notes must route into the shared master gain.");
  check(sparkleHook.includes("canvas.getContext(\"2d\"") && sparkleHook.includes("requestAnimationFrame"), "Sparkle trail must render to canvas via requestAnimationFrame.");
  check(sparkleHook.includes("onChimeRef.current") && sparkleHook.includes("CHIME_COOLDOWN_MS"), "Canvas chimes must use a callback and cooldown, not allocate audio in the frame loop.");
  check(sparkleHook.includes("prefers-reduced-motion") && sparkleHook.includes("cancelAnimationFrame"), "Sparkle trail must respect reduced motion and cancel scheduled frames.");
  check(counterHook.includes("useState(readInitialCounter)"), "Odometer must hydrate synchronously before first render.");
  check(counterHook.includes('localStorage.getItem(COUNTER_STORAGE_KEY)'), "Odometer must read its persistent value.");
  check(counterHook.includes('localStorage.setItem(COUNTER_STORAGE_KEY, String(count))'), "Odometer must persist updates.");
  check(guestbook.includes("function DreamGuestbook({ dreamsSimulated = 0 })"), "DreamGuestbook must receive the parent-owned counter.");
  check(guestbook.includes("formatOdometer(safeCounter)"), "DreamGuestbook must format its zero-padded odometer.");
  check(!guestbook.includes("pip-dream-simulated-dreams"), "DreamGuestbook must not maintain a competing counter key.");
  check(app.includes('aria-controls={activeProject === "nightlight" ? "nightlight-panel" : undefined}'), "Nightlight disclosure must have a valid aria-controls target.");
  check(app.includes('aria-controls={activeProject === "courier" ? "courier-panel" : undefined}'), "Courier disclosure must have a valid aria-controls target.");
  check(app.includes('aria-label="Nightlight Studio controls"'), "Nightlight panel must have an accessible label.");
  check(app.includes('aria-label="Dream Courier controls"'), "Dream Courier panel must have an accessible label.");
  check(manifest.includes("inert={!isExpanded}"), "Collapsed project manifest panels must be inert.");
  check(manifest.includes("aria-expanded={isExpanded}"), "Manifest disclosure triggers must expose aria-expanded.");

  for (const absolutePath of sourceFiles) {
    const relativePath = relativeToRoot(absolutePath);
    const source = readFileSync(absolutePath, "utf8");
    if (relativePath === "src/audio/dreamAudioBus.js") continue;

    check(
      !/new\s+(?:window\.)?(?:AudioContext|webkitAudioContext)(?:\s*\(|\s*;)/.test(source),
      `${relativePath} must not create a second AudioContext.`,
    );
    if (relativePath !== "src/utils/LullabyLabEngine.js") {
      check(
        !/createOscillator\s*\(/.test(source),
        `${relativePath} must delegate oscillator creation to the shared audio layer.`,
      );
    }
    check(
      !/\.connect\([^)]*destination\)/.test(source),
      `${relativePath} must not bypass the shared master output.`,
    );
  }

  reportResults("Source architecture is coherent; shared audio, canvas trail, and local data contracts are present.");
}

function runDistChecks() {
  printHeader("PRODUCTION ARTIFACT AUDIT");

  const distRoot = resolve(ROOT, "dist");
  const indexPath = resolve(distRoot, "index.html");
  check(existsSync(distRoot) && statSync(distRoot).isDirectory(), "The dist/ directory must exist; run Vite before the artifact audit.");
  check(existsSync(indexPath) && statSync(indexPath).isFile(), "dist/index.html must exist.");

  if (!existsSync(indexPath)) {
    reportResults("No distribution artifact to audit.");
    return;
  }

  const files = listFiles(distRoot);
  const relativeFiles = files.map((file) => relative(distRoot, file).split(sep).join("/"));
  const indexHtml = readFileSync(indexPath, "utf8");
  const javascriptBundles = relativeFiles.filter((file) => /(?:^|\/)assets\/.*\.(?:m?js)$/.test(file));
  const stylesheetBundles = relativeFiles.filter((file) => /(?:^|\/)assets\/.*\.css$/.test(file));

  check(files.length > 0, "dist/ must contain at least one built file.");
  check(javascriptBundles.length > 0, "dist/assets/ must contain at least one compiled JavaScript bundle.");
  check(stylesheetBundles.length > 0, "dist/assets/ must contain at least one compiled CSS stylesheet.");
  check(/<html\b/i.test(indexHtml) && /<body\b/i.test(indexHtml), "dist/index.html must contain a complete HTML document structure.");
  check(indexHtml.trim().length > 100, "dist/index.html must not be empty or truncated.");
  check(!/\bApp\.original\.jsx\b/i.test(indexHtml), "dist/index.html must not reference the legacy App.original.jsx backup.");
  check(!/(?:src\/)?App\.jsx(?:[?#"']|\s|$)/i.test(indexHtml), "dist/index.html must not point to raw App.jsx source.");
  check(!/\b(?:src\/)?[^\s"']+\.(?:jsx|tsx)(?:[?#"']|\s|$)/i.test(indexHtml), "dist/index.html must not load raw JSX/TSX modules.");

  // Check the complete artifact tree for accidental source/backup leakage.
  for (const file of relativeFiles) {
    check(!/(?:^|\/)App\.original\.jsx$/i.test(file), `Legacy backup leaked into dist/: ${file}`);
    check(!/\.(?:jsx|tsx|ts|bak|orig|backup)$/i.test(file), `Source or backup file leaked into dist/: ${file}`);
    check(!/(?:^|\/)(?:node_modules|\.git)(?:\/|$)/i.test(file), `Development-only tree leaked into dist/: ${file}`);
  }

  // Validate local script/stylesheet/icon references produced by Vite. Hashes
  // are intentionally not hard-coded because they change with each build.
  const attributePattern = /\b(src|href)\s*=\s*(["'])(.*?)\2/gi;
  for (const match of indexHtml.matchAll(attributePattern)) {
    const attribute = match[1].toLowerCase();
    const value = match[3].trim();
    if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) continue;

    const cleanValue = value.split(/[?#]/, 1)[0];
    if (!cleanValue) continue;
    const referencedPath = cleanValue.startsWith("/")
      ? resolve(distRoot, cleanValue.slice(1))
      : resolve(dirname(indexPath), cleanValue);
    const relPath = relative(distRoot, referencedPath);
    const escapesDist = relPath === ".." || relPath.startsWith(`..${sep}`) || isAbsolute(relPath);
    check(!escapesDist, `Local ${attribute} reference escapes dist/: ${value}`);
    if (!escapesDist) {
      check(existsSync(referencedPath) && statSync(referencedPath).isFile(), `Broken local ${attribute} reference in dist/index.html: ${value}`);
    }
  }

  // A bundle should be the deployed runtime entry, not a path back into source.
  const scriptRefs = [...indexHtml.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
  check(scriptRefs.length > 0, "dist/index.html must load at least one compiled script bundle.");
  for (const source of scriptRefs) {
    check(/\.(?:m?js)(?:[?#]|$)/i.test(source), `Script reference is not a compiled JavaScript asset: ${source}`);
  }

  console.log(`[INFO] Distribution tree scanned: ${files.length} files`);
  console.log(`[INFO] Compiled JS bundles discovered: ${javascriptBundles.length}`);
  console.log(`[INFO] CSS bundles discovered: ${stylesheetBundles.length}`);
  console.log(`[INFO] Local index asset references checked: ${[...indexHtml.matchAll(attributePattern)].length}`);
  reportResults("Production artifact is structurally clean and ready for browser smoke testing.");
}

if (!distOnly) runSourceChecks();
if (!checksOnly) runDistChecks();

if (process.exitCode) {
  console.error("\n[BLOCKED] Fix every release-gate failure before publishing this build.\n");
} else {
  console.log("\n+------------------------------------------------------------+");
  console.log("| RELEASE GATE GREEN :: BUILD WITH SOFT MAGIC ENABLED        |");
  console.log("+------------------------------------------------------------+\n");
}
