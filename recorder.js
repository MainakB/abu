import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";
import {
  ensureChromiumInstalled,
  injectToLocalStorage,
  injectToSessionStorage,
  updateInitialRecorderState,
  allowPopups,
  injectScripts,
  exposeRecorderControls,
  exposeContextBindings,
} from "./utils/lib.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let globalRecorderMode = "record";

ensureChromiumInstalled(chromium);

const browser = await chromium.launch({
  headless: false,
  args: [
    "--disable-http2",
    "--no-sandbox",
    "--start-maximized",
    "--disable-web-security",
    "--disable-blink-features=AutomationControlled",
    "--ignore-certificate-errors",
    "--disable-site-isolation-trials", // 👈 disables process isolation
    "--disable-features=IsolateOrigins,site-per-process",
  ],
});
// const windowsUserAgent =  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const windowsUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const macUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15";

const context = await browser.newContext({
  viewport: null, // allow full window
  ignoreHTTPSErrors: true,
  userAgent: process.platform === "win32" ? windowsUserAgent : macUserAgent,
});

await exposeContextBindings(context);

const cssPath = path.join(__dirname, "injected", "style.css");
const cssContent = await fs.promises.readFile(cssPath, "utf8");

// Inject React UI and element highlighter
// ✅ Inject in correct order
const scriptPaths = {
  constants: "injected/constants-global.bundle.js",
  utilities: "utils/utilities.js",
  store: "ui-src/store/recorderStore.js",
  selector: "ui-src/selectorStrategy.js",
  overlay: "ui-src/overlay.js",
  panel: "injected/panel.bundle.js",
  assertion: "ui-src/assertionPicker.js", // 💥 capture assertion first
  events: "ui-src/recorderEvents.js", // 💥 high-level event binding
  floatingAssert: "injected/floatingAssert.bundle.js", // ✅ injected last
};

let firstUrlCaptured = false;

// Handle first page
const firstPage = await context.newPage();
await exposeRecorderControls(firstPage, __dirname, globalRecorderMode, browser);
const firstTabId = uuidv4();
await injectScripts(
  firstPage,
  firstTabId,
  true,
  globalRecorderMode,
  cssContent,
  scriptPaths,
  __dirname
);

// Handle new tabs/windows
context.on("page", async (newPage) => {
  await exposeRecorderControls(newPage, __dirname, globalRecorderMode, browser);
  const tabId = uuidv4();
  console.log("🆕 New tab opened:", tabId);
  await injectScripts(
    newPage,
    tabId,
    false,
    globalRecorderMode,
    cssContent,
    scriptPaths,
    __dirname
  );
  const url = newPage.url();
  if (!url.includes("about:blank") && firstUrlCaptured) {
    const title = await newPage.title();
    const eventKey = `newPage-${tabId}`;
    await Promise.all([
      injectToLocalStorage(newPage, false, tabId),
      injectToSessionStorage(newPage, [
        { key: "tabId", value: tabId },
        { key: "url", value: url },
        { key: "title", value: title },
      ]),
    ]);
    if (globalRecorderMode !== "pause") {
      // ✅ Record the switchToWindow action
      await fetch("http://localhost:3111/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "switchToWindow",
          tabId,
          attributes: { url, title, eventKey },
          timestamp: Date.now(),
        }),
      });
    }
  }
});

firstPage.on("framenavigated", async (frame) => {
  if (frame === firstPage.mainFrame() && !firstUrlCaptured) {
    const url = frame.url();
    if (!url.includes("about:blank") && !firstUrlCaptured) {
      await firstPage.waitForLoadState("load");
      await updateInitialRecorderState(firstPage, globalRecorderMode, true);
      const title = await firstPage.title();
      firstUrlCaptured = true;
      console.log("🌐 First page navigation recorded:", url);
      const tabId = uuidv4();
      await Promise.all([
        injectToLocalStorage(firstPage, true, tabId),
        injectToSessionStorage(firstPage, [
          { key: "tabId", value: tabId },
          { key: "url", value: url },
          { key: "title", value: title },
        ]),
      ]);
      await fetch("http://localhost:3111/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "navigate",
          url,
          tabId: firstTabId,
          attributes: { title },
          timestamp: Date.now(),
        }),
      });
    }
  }
});

// await firstPage.goto("about:blank");
await firstPage.goto("https://the-internet.herokuapp.com/");
// await firstPage.goto("https://amazon.com/");
