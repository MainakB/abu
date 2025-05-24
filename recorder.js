#!/usr/bin/env node

// Handle Ctrl+C (SIGINT)
process.on("SIGINT", () => {
  console.log("Received SIGINT. Shutting down gracefully...");
  gracefulShutdown(0);
});

// Handle termination (SIGTERM)
process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Shutting down gracefully...");
  gracefulShutdown(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown(1);
});

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import WebSocket from "ws";
import { dirname } from "path";
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
  startServers,
  startAndSaveCliConfig,
  initRecorderConfig,
  gracefulShutdown,
  getPageTitleWithRetry,
} from "./utils/lib.js";
import { ASSERTIONMODES } from "./ui-src/constants/index.js";

const recorderConfig = await startAndSaveCliConfig();
await startServers(recorderConfig.debug);
await initRecorderConfig(recorderConfig);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const globalRecorderMode = {
  value: "record",
};

ensureChromiumInstalled(chromium, recorderConfig.debug);
const socket = new WebSocket("ws://localhost:8787");
await new Promise((resolve, reject) => {
  socket.addEventListener("open", () => resolve());
  socket.addEventListener("error", (err) => reject(err));
});

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
await exposeRecorderControls(
  firstPage,
  __dirname,
  globalRecorderMode,
  browser,
  recorderConfig
);
const firstTabId = uuidv4();
await injectScripts(
  firstPage,
  true,
  globalRecorderMode,
  cssContent,
  scriptPaths,
  __dirname
);

// Handle new tabs/windows
context.on("page", async (newPage) => {
  await exposeRecorderControls(
    newPage,
    __dirname,
    globalRecorderMode,
    browser,
    recorderConfig
  );
  const tabId = uuidv4();
  if (recorderConfig.debug) console.log("🆕 New tab opened:", tabId);
  await injectScripts(
    newPage,
    false,
    globalRecorderMode,
    cssContent,
    scriptPaths,
    __dirname
  );
  await onPageLoadSetRecorderState(true);
  const url = newPage.url();
  let isManualNewTab = false;
  if (!url.includes("about:blank") && firstUrlCaptured) {
    if (globalRecorderMode.value !== "pause") {
      const title = await getPageTitleWithRetry(newPage);
      // await newPage.title();
      const eventKey = `newPage-${tabId}`;
      if (
        (url && url.includes("//newtab/")) ||
        (title && title.includes("//newtab/"))
      ) {
        await newPage.goto("about:blank");
        isManualNewTab = true;
      } else {
        await Promise.all([
          injectToLocalStorage(newPage, false),
          injectToSessionStorage(newPage, [
            { key: "tabId", value: tabId },
            { key: "url", value: url },
            { key: "title", value: title },
          ]),
        ]);
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
  }

  newPage.on("framenavigated", async (frame) => {
    if (frame === newPage.mainFrame() && isManualNewTab) {
      let navurl = frame.url();
      if (
        navurl === "about:blank" ||
        (typeof navurl === "string" && !navurl.startsWith("http"))
      )
        return;

      if (!navurl.includes("about:blank") && isManualNewTab) {
        isManualNewTab = false;
        await newPage.waitForLoadState("domcontentloaded");

        // ✅ Wait for origin to stabilize
        await newPage.waitForFunction(() => location.origin !== "null");

        // Optional: small buffer
        await newPage.waitForTimeout(500);

        const titleVal = await getPageTitleWithRetry(newPage);
        // await newPage.title();
        if (!newPage.isClosed()) {
          await Promise.all([
            injectToLocalStorage(newPage, false),
            injectToSessionStorage(newPage, [
              { key: "tabId", value: tabId },
              { key: "url", value: navurl },
              { key: "title", value: titleVal },
            ]),
          ]);
          await fetch("http://localhost:3111/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: ASSERTIONMODES.NEWTAB,
              timestamp: Date.now(),
            }),
          });
          await fetch("http://localhost:3111/record", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "navigate",
              url: navurl,
              tabId: tabId,
              attributes: { titleVal },
              timestamp: Date.now(),
            }),
          });
        }
      }
    }
  });
  await onPageLoadSetRecorderState(false);
});

firstPage.on("framenavigated", async (frame) => {
  if (frame === firstPage.mainFrame() && !firstUrlCaptured) {
    const url = frame.url();
    if (!url.includes("about:blank") && !firstUrlCaptured) {
      firstUrlCaptured = true;
      await firstPage.waitForLoadState("load");
      await updateInitialRecorderState(firstPage, globalRecorderMode, true);
      const title = await getPageTitleWithRetry(firstPage);
      // await firstPage.title();

      if (recorderConfig.debug)
        console.log("🌐 First page navigation recorded:", url);

      const tabId = uuidv4();
      await Promise.all([
        injectToLocalStorage(firstPage, true),
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

await firstPage.goto("about:blank");
// await firstPage.goto("https://the-internet.herokuapp.com/");
// await firstPage.goto("https://amazon.com/");

const onPageLoadSetRecorderState = async (isPageLoadPending) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "page-load-recorder-state",
        state: isPageLoadPending,
      })
    );
  }
  await new Promise((r) => setTimeout(r, 500));
};
