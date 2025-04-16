import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ensureChromiumInstalled = () => {
  const executablePath = chromium.executablePath();
  if (!fs.existsSync(executablePath)) {
    console.log("🔧 Chromium not found. Installing...");
    execSync("npx playwright install chromium", { stdio: "inherit" });
  } else {
    console.log("✅ Chromium is already installed");
  }
};

ensureChromiumInstalled();

const browser = await chromium.launch({
  headless: false,
  args: ["--start-maximized"],
});
const context = await browser.newContext({
  viewport: null, // allow full window
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});
const page = await context.newPage();

const cssPath = path.join(__dirname, "injected", "style.css");
const cssContent = await fs.promises.readFile(cssPath, "utf8");

// Inject style into page
await page.addInitScript(`
  (() => {
    const css = ${JSON.stringify(cssContent)};
    const inject = () => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  })();
`);

// Inject React UI and element highlighter
// File paths
// const uiBundlePath = path.join(__dirname, "injected", "ui.bundle.js");
const panelBundlePath = path.join(__dirname, "injected", "panel.bundle.js");
const floatingAssertPath = path.join(
  __dirname,
  "injected",
  "floatingAssert.bundle.js"
);
const overlayPath = path.join(__dirname, "ui-src", "overlay.js");
const eventScriptPath = path.join(__dirname, "ui-src", "recorderEvents.js");
const selectorScriptPath = path.join(
  __dirname,
  "ui-src",
  "selectorStrategy.js"
);
const assertionScriptPath = path.join(
  __dirname,
  "ui-src",
  "assertionPicker.js"
);
const storePath = path.join(__dirname, "ui-src", "store", "recorderStore.js");

// File content
// const uiBundleContent = await fs.promises.readFile(uiBundlePath, "utf8");
const panelScript = await fs.promises.readFile(panelBundlePath, "utf8");
const floatingAssertScript = await fs.promises.readFile(
  floatingAssertPath,
  "utf8"
);
const overlayContent = await fs.promises.readFile(overlayPath, "utf8");
const selectorScript = await fs.promises.readFile(selectorScriptPath, "utf8");
const assertionScript = await fs.promises.readFile(assertionScriptPath, "utf8");
const eventScript = await fs.promises.readFile(eventScriptPath, "utf8");
const storeScript = await fs.promises.readFile(storePath, "utf8");

// ✅ Inject in correct order
// await page.addInitScript(uiBundleContent); // React UI
await page.addInitScript(storeScript);
await page.addInitScript(selectorScript); // getSelectors (MUST be before recorder)
await page.addInitScript(panelScript); // React UI
await page.addInitScript(overlayContent); // Red box overlay
await page.addInitScript(floatingAssertScript);
await page.addInitScript(assertionScript);
await page.addInitScript(eventScript); // recorderEvents (uses getSelectors)

// UI Controls via window events
await page.exposeBinding("toggleRecording", () => {
  global.recording = !global.recording;
  console.log(
    global.recording ? "▶️ Resumed recording" : "⏸️ Paused recording"
  );
});

await page.exposeBinding("stopRecording", async () => {
  console.log("🛑 Stopping recording. Fetching actions from store...");

  const steps = await page.evaluate(() => {
    const store = window.__recorderStore;
    if (!store || !store.actions) return [];
    return store.actions;
  });

  const filePath = path.join(
    __dirname,
    "recordings",
    `test-${Date.now()}.json`
  );

  await fs.promises.writeFile(filePath, JSON.stringify(steps, null, 2));
  console.log(`✅ ${steps.length} steps saved to ${filePath}`);

  await browser.close();
  process.exit(0);
});

// await page.goto("https://example.com");
await page.goto("about:blank");
