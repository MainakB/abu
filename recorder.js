import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let globalRecorderMode = "record";

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
  args: [
    "--start-maximized",
    "--disable-site-isolation-trials", // 👈 disables process isolation
    "--disable-features=IsolateOrigins,site-per-process",
  ],
});
const context = await browser.newContext({
  viewport: null, // allow full window
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});

const cssPath = path.join(__dirname, "injected", "style.css");
const cssContent = await fs.promises.readFile(cssPath, "utf8");

// Inject React UI and element highlighter
// ✅ Inject in correct order
const scriptPaths = {
  utilities: "ui-src/utilities.js",
  store: "ui-src/store/recorderStore.js",
  selector: "ui-src/selectorStrategy.js",
  overlay: "ui-src/overlay.js",
  panel: "injected/panel.bundle.js",
  assertion: "ui-src/assertionPicker.js", // 💥 capture assertion first
  events: "ui-src/recorderEvents.js", // 💥 high-level event binding
  floatingAssert: "injected/floatingAssert.bundle.js", // ✅ injected last
};

let firstUrlCaptured = false;

async function injectToLocalStorage(p, isInitialPage, tabId) {
  // ✅ Set flag in localStorage for this window
  await p.evaluate(
    (arg) => {
      try {
        localStorage.setItem("isInitialPage", arg.isInitialPage);
        localStorage.setItem("activeTabId", arg.tabId);
      } catch (err) {
        console.warn("⚠️ Could not write to localStorage:", err);
      }
    },
    { isInitialPage, tabId }
  );
}

async function injectToSessionStorage(p, sessionArgs) {
  for (let i = 0; i < sessionArgs.length; i++) {
    const args = sessionArgs[i];
    // ✅ Set flag in localStorage for this window
    await p.evaluate((arg) => {
      try {
        sessionStorage.setItem(arg.key, arg.value);
      } catch (err) {
        console.warn("⚠️ Could not write to sessionStorage:", err);
      }
    }, args);
  }
}

async function updateInitialRecorderState(page, initialPage = false) {
  const recorderState = initialPage
    ? globalRecorderMode
    : globalRecorderMode === "pause"
    ? "record"
    : "pause";
  globalRecorderMode = recorderState;
  await page.evaluate((value) => {
    localStorage.setItem("recorderMode", value);
  }, globalRecorderMode);
}

async function injectScripts(page, tabId, initialPage, recoderModeValue) {
  await page.waitForLoadState("domcontentloaded");
  if (!initialPage) {
    await page.evaluate((value) => {
      localStorage.setItem("recorderMode", value);
    }, recoderModeValue);
  }
  const cssValue = `
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
  `;

  const injectInitScript = async (path) => {
    const content = await fs.promises.readFile(path, "utf8");
    await page.addInitScript(content);
  };

  // Inject style
  // ✅ Inject all scripts
  const injectScript = initialPage
    ? async (path) => {
        await page.addInitScript(cssValue);
        const content = await fs.promises.readFile(path, "utf8");
        await page.addInitScript(content);
      }
    : async (path) => {
        await page.addStyleTag({ content: cssContent });
        await page.addScriptTag({ path });
      };

  for (const key in scriptPaths) {
    const filePath = path.join(__dirname, scriptPaths[key]);
    await injectScript(filePath);
  }

  // Inject fallback reinjector watcher (injected *only* as initScript to survive SPA transitions)
  // await injectInitScript(path.join(__dirname, "ui-src/reinjectionWatcher.js"));

  // Final fallback: Reinject scripts using addInitScript *again* if not initialPage
  if (!initialPage) {
    const reInjectScript = async (path) => {
      await page.addInitScript(cssValue);
      const content = await fs.promises.readFile(path, "utf8");
      await page.addInitScript(content);
    };
    for (const key in scriptPaths) {
      const filePath = path.join(__dirname, scriptPaths[key]);
      await reInjectScript(filePath);
    }
  }

  // ✅ Boot UI manually for non-initial pages
  if (!initialPage) {
    await page.evaluate(() => {
      requestIdleCallback(() => {
        window.__bootRecorderUI?.();
      });
    });
  }
}

// Handle first page
const firstPage = await context.newPage();
await exposeRecorderControls(firstPage);
const firstTabId = uuidv4();
await injectScripts(firstPage, firstTabId, true, globalRecorderMode);

// Handle new tabs/windows
context.on("page", async (newPage) => {
  await exposeRecorderControls(newPage);
  const tabId = uuidv4();
  console.log("🆕 New tab opened:", tabId);
  await injectScripts(newPage, tabId, false, globalRecorderMode);
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
      await updateInitialRecorderState(firstPage, true);
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

async function exposeRecorderControls(page) {
  await page.exposeBinding("__toggleRecording", async () => {
    await updateInitialRecorderState(page, false);

    console.log(
      globalRecorderMode === "record"
        ? "▶️ Resumed recording"
        : "⏸️ Paused recording"
    );
    return globalRecorderMode;
  });

  await page.exposeBinding(
    "__syncRecorderStatusOnInternalSwitchTab",
    async () => {
      await page.evaluate((value) => {
        localStorage.setItem("recorderMode", value);
      }, globalRecorderMode);
    }
  );

  await page.exposeBinding("stopRecording", async () => {
    console.log("🛑 Stopping recording. Fetching actions from store...");
    const steps = await fetch("http://localhost:3111/record").then((res) =>
      res.json()
    );

    const sorted = [
      ...steps.filter((a) => a.action === "navigate"),
      ...steps.filter((a) => a.action !== "navigate"),
    ];

    const filePath = path.join(
      __dirname,
      "recordings",
      `test-${Date.now()}.json`
    );
    await fs.promises.writeFile(filePath, JSON.stringify(sorted, null, 2));
    console.log(`✅ ${steps.length} steps saved to ${filePath}`);

    await browser.close();
    process.exit(0);
  });
}

// await firstPage.goto("about:blank");
await firstPage.goto("https://the-internet.herokuapp.com/javascript_alerts");
