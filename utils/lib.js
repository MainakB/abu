import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const ensureChromiumInstalled = (chromium) => {
  const executablePath = chromium.executablePath();
  if (!fs.existsSync(executablePath)) {
    console.log("🔧 Chromium not found. Installing...");
    execSync("npx playwright install chromium", { stdio: "inherit" });
  } else {
    console.log("✅ Chromium is already installed");
  }
};

export const injectToLocalStorage = async (p, isInitialPage) => {
  // ✅ Set flag in localStorage for this window
  await p.evaluate(
    (arg) => {
      try {
        localStorage.setItem("isInitialPage", arg.isInitialPage);
      } catch (err) {
        console.warn("⚠️ Could not write to localStorage:", err);
      }
    },
    { isInitialPage }
  );
};

export const injectToSessionStorage = async (p, sessionArgs) => {
  for (let i = 0; i < sessionArgs.length; i++) {
    const args = sessionArgs[i];
    // ✅ Set flag in localStorage for this window
    await p.evaluate((arg) => {
      try {
        if (arg.key === "tabId") {
          window.__recorderStore.setActiveTabId(arg.value);
        }
        sessionStorage.setItem(arg.key, arg.value);
      } catch (err) {
        console.warn("⚠️ Could not write to sessionStorage:", err);
      }
    }, args);
  }
};

export const updateInitialRecorderState = async (
  page,
  globalRecorderMode,
  initialPage = false
) => {
  const recorderState = initialPage
    ? globalRecorderMode.value
    : globalRecorderMode.value === "pause"
    ? "record"
    : "pause";
  globalRecorderMode.value = recorderState;
  await page.evaluate((value) => {
    localStorage.setItem("recorderMode", value);
  }, globalRecorderMode.value);
};

export const allowPopups = (page) => {
  page.on("dialog", async (dialog) => {
    console.log("🔔 Dialog shown:", dialog.message());
    // Do NOT accept/dismiss. Let the user handle it manually.
    // Just log or notify if needed.
  });
};

export const injectScripts = async (
  page,
  initialPage,
  recoderModeValue,
  cssContent,
  scriptPaths,
  dirName
) => {
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
    const filePath = path.join(dirName, scriptPaths[key]);
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
      const filePath = path.join(dirName, scriptPaths[key]);
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

  await allowPopups(page);
};

export const exposeRecorderControls = async (
  page,
  dirName,
  globalRecorderMode,
  browser
) => {
  await page.exposeBinding("__toggleRecording", async () => {
    await updateInitialRecorderState(page, globalRecorderMode, false);

    console.log(
      globalRecorderMode.value === "record"
        ? "▶️ Resumed recording"
        : "⏸️ Paused recording"
    );
    return globalRecorderMode.value;
  });

  await page.exposeBinding(
    "__syncRecorderStatusOnInternalSwitchTab",
    async () => {
      await page.evaluate((value) => {
        localStorage.setItem("recorderMode", value);
      }, globalRecorderMode.value);
    }
  );

  await page.exposeBinding("__stopRecording", async () => {
    console.log("🛑 Stopping recording. Fetching actions from store...");
    const steps = await fetch("http://localhost:3111/record").then((res) =>
      res.json()
    );

    const sorted = [
      ...steps.filter((a) => a.action === "navigate"),
      ...steps.filter((a) => a.action !== "navigate"),
    ];

    const filePath = path.join(
      dirName,
      "recordings",
      `test-${Date.now()}.json`
    );
    await fs.promises.writeFile(filePath, JSON.stringify(sorted, null, 2));
    console.log(`✅ ${steps.length} steps saved to ${filePath}`);

    await browser.close();
    process.exit(0);
  });

  await page.exposeBinding("__pageReload", async () => {
    // await new Promise((resolve) => setTimeout(resolve, 250));
    await page.reload({ waitUntil: "domcontentloaded" });
  });

  await page.exposeBinding("__pageUrl", async () => page.url());
};

export const exposeContextBindings = async (ctx) => {
  await ctx.exposeBinding("__addCookies", async ({ page }, cookies) => {
    const formatted = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite || "Strict",
    }));
    await ctx.addCookies(formatted);
  });

  await ctx.exposeBinding("__deleteCookies", async ({ page }, cookies) => {
    console.log("Received in __deleteCookies: ", cookies);
    if (cookies && Array.isArray(cookies) && cookies.length) {
      const cookiePromise = [];
      for (let cookie of cookies) {
        if (cookie) {
          cookiePromise.push(ctx.clearCookies({ name: cookie }));
        }
      }
      await Promise.all(cookiePromise);
    } else {
      await ctx.clearCookies();
    }
  });
};
