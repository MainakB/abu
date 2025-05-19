import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v4 as uuidv4 } from "uuid";

let apiServer = null;
let wsServer = null;

export const startServers = () => {
  apiServer = spawn("node", ["servers/api-server.js"], {
    stdio: "inherit",
  });
  wsServer = spawn("node", ["servers/ws-server.js"], {
    stdio: "inherit",
  });
};

const stopServers = () => {
  console.log("🛑 Shutting down servers...");
  apiServer.kill();
  wsServer.kill();
  process.exit(0);
};

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
    try {
      localStorage.setItem("recorderMode", value);
    } catch (err) {
      console.warn("⚠️ Could not write to localStorage:", err);
    }
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
      try {
        localStorage.setItem("recorderMode", value);
      } catch (err) {
        console.warn("⚠️ Could not write to localStorage:", err);
      }
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
        try {
          localStorage.setItem("recorderMode", value);
        } catch (err) {
          console.warn("⚠️ Could not write to localStorage:", err);
        }
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

    const recordingsDir = path.join(
      process.cwd(),
      "src",
      "recordings",
      "jsonMetadata"
    );
    const filePath = path.join(recordingsDir, `test-${Date.now()}.json`);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    //   return filePath;

    // const filePath = path.join(
    //   dirName,
    //   "recordings",
    //   `test-${Date.now()}.json`
    // );
    await fs.promises.writeFile(filePath, JSON.stringify(sorted, null, 2));
    console.log(
      `✅ ${steps.length} steps saved to ${filePath}. Run recorded test with the coomand "npx abc --customer=recordings --tags=@recordedTest --platform=dev"`
    );

    await browser.close();
    stopServers();
    process.exit(0);
  });

  await page.exposeBinding("__pageReload", async () => {
    // await new Promise((resolve) => setTimeout(resolve, 250));
    await page.reload({ waitUntil: "domcontentloaded" });
  });

  await page.exposeBinding("__pageUrl", async () => page.url());

  await page.exposeBinding("__getPageTitle", async () => page.title());

  // await page.exposeBinding("__executeAction", async (source, action) => {
  //   const htmlTagTypeMapping = {
  //     button: ["button", "div"],
  //     link: ["a"],
  //     hyperlink: ["a"],
  //     input: ["input"],
  //     textbox: ["input"],
  //     header: ["h1", "h2", "h3", "h4", "span", "label", "header"],
  //     radio: ["input"],
  //     "radio-button": ["input"],
  //     checkbox: ["input"],
  //   };

  //   function escapeForXPath(str) {
  //     if (!str.includes(`"`)) {
  //       return `"${str}"`; // Wrap in double quotes
  //     }
  //     if (!str.includes(`'`)) {
  //       return `'${str}'`; // Wrap in single quotes
  //     }

  //     // Contains both ' and ", use concat() XPath function
  //     return (
  //       "concat(" +
  //       str
  //         .split(`"`)
  //         .map((part, i, arr) =>
  //           i < arr.length - 1 ? `"${part}", '"', ` : `"${part}"`
  //         )
  //         .join("") +
  //       ")"
  //     );
  //   }

  //   try {
  //     console.log("Action is: ", action);

  //     if (action.intent === "navigate") {
  //       console.log("Navigate to : ", action.value);
  //       await page.goto(action.value || "");
  //       return { success: true };
  //     }

  //     const tagCandidates =
  //       htmlTagTypeMapping[action.target.type?.toLowerCase()] || [];

  //     // const safeName = escapeForXPath
  //     const fallbackLocator = action.target.name
  //       ? page.locator(
  //           `xpath=.//*[text()=${escapeForXPath(
  //             action.target.name
  //           )}]|.//*[@aria-label=${escapeForXPath(
  //             action.target.name
  //           )}]|.//*[name=${escapeForXPath(
  //             action.target.name
  //           )}]|.//*[title=${escapeForXPath(
  //             action.target.name
  //           )}]|.//*[aria-describedBy=${escapeForXPath(
  //             action.target.name
  //           )}]|.//*[@placeholder=${escapeForXPath(action.target.name)}]`
  //         )
  //       : null;

  //     // Try each tag type until we find a visible matching element
  //     const tagAttempts = fallbackLocator
  //       ? [null, ...tagCandidates]
  //       : tagCandidates;

  //     for (const tag of tagAttempts) {
  //       let locator = null;
  //       let nameMatchXPath = null;

  //       if (tag === null && fallbackLocator) {
  //         locator = fallbackLocator;
  //       } else if (tag) {
  //         locator = page.locator(tag);
  //       }

  //       if (!locator) continue;

  //       const elements = await locator.all();
  //       const visibleElements = [];

  //       for (const el of elements) {
  //         if (await el.isVisible()) visibleElements.push(el);
  //       }

  //       // Check if we need to do a refined search
  //       if (
  //         fallbackLocator &&
  //         tag &&
  //         visibleElements.length > 1 &&
  //         (await fallbackLocator.count()) > 1
  //       ) {
  //         // Narrow down: build combined XPath with tag filter
  //         const name = action.target.name;
  //         if (!name) continue;
  //         const safeName = escapeForXPath(name);
  //         const xpath = `
  //               .//${tag}[text()=${safeName}] |
  //               .//${tag}[@aria-label=${safeName}] |
  //               .//${tag}[@name=${safeName}] |
  //               .//${tag}[@title=${safeName}] |
  //               .//${tag}[@aria-describedBy=${safeName}] |
  //               .//${tag}[@placeholder=${safeName}]
  //             `.trim();

  //         console.log(`🔍 Refined XPath: ${xpath}`);
  //         locator = page.locator(`xpath=${xpath}`);
  //         const refinedVisible = [];

  //         for (const el of await locator.all()) {
  //           if (await el.isVisible()) refinedVisible.push(el);
  //         }

  //         if (refinedVisible.length === 0) continue;

  //         visibleElements.splice(0, visibleElements.length, ...refinedVisible);
  //       }

  //       if (visibleElements.length === 0) continue;

  //       const targetIndex = action.target.position
  //         ? action.target.position - 1
  //         : 0;
  //       const element = visibleElements[targetIndex] || visibleElements[0];
  //       if (!element) continue;
  //       console.log("Switch to intent: ", action);
  //       // 🎯 Execute the action
  //       switch (action.intent) {
  //         case "click":
  //           await element.click();
  //           break;
  //         case "input":
  //           await element.type(action.value || "");
  //           break;
  //         case "hover":
  //           await element.hover();
  //         default:
  //           console.warn("⚠️ Unknown action intent:", action.intent);
  //           return { success: false, error: "Unknown action intent" };
  //       }

  //       console.log("✅ Action executed successfully:", action);
  //       return { success: true };
  //     }

  //     console.warn("⚠️ No visible elements found after tag retries:", action);
  //     return { success: false, error: "No visible elements found" };
  //   } catch (error) {
  //     console.error("❌ Error executing action:", action, error);
  //     return { success: false, error: error.message };
  //   }
  // });

  await page.exposeBinding("__executeAction", async (source, action) => {
    const htmlTagTypeMapping = {
      button: ["button", "div"],
      link: ["a"],
      hyperlink: ["a"],
      input: ["input"],
      textbox: ["input"],
      header: ["h1", "h2", "h3", "h4", "span", "label", "header"],
      radio: ["input"],
      "radio-button": ["input"],
      checkbox: ["input"],
    };

    function escapeForXPath(str) {
      if (!str.includes(`"`)) return `"${str}"`;
      if (!str.includes(`'`)) return `'${str}'`;
      return (
        "concat(" +
        str
          .split(`"`)
          .map((s, i, arr) => (i < arr.length - 1 ? `"${s}", '"', ` : `"${s}"`))
          .join("") +
        ")"
      );
    }

    try {
      console.log("Action is: ", action);

      if (action.intent === "navigate") {
        await page.goto(action.value || "");
        return { success: true };
      }

      const name = action.target.name;
      const safeName = name ? escapeForXPath(name) : null;
      const tagCandidates =
        htmlTagTypeMapping[action.target.type?.toLowerCase()] || [];

      const locatorAttempts = [];

      // 1. tag + name combinations (most specific)
      if (name && tagCandidates.length > 0) {
        for (const tag of tagCandidates) {
          const xpath = `
          .//${tag}[text()=${safeName}] |
          .//${tag}[@aria-label=${safeName}] |
          .//${tag}[@name=${safeName}] |
          .//${tag}[@title=${safeName}] |
          .//${tag}[@aria-describedBy=${safeName}] |
          .//${tag}[@placeholder=${safeName}]
        `.trim();
          locatorAttempts.push({
            strategy: "tag+name",
            locator: page.locator(`xpath=${xpath}`),
          });
        }
      }

      // 2. name-only XPath
      if (name) {
        const xpath = `
        .//*[text()=${safeName}] |
        .//*[@aria-label=${safeName}] |
        .//*[name=${safeName}] |
        .//*[@title=${safeName}] |
        .//*[@aria-describedBy=${safeName}] |
        .//*[@placeholder=${safeName}]
      `.trim();
        locatorAttempts.push({
          strategy: "name-only",
          locator: page.locator(`xpath=${xpath}`),
        });
      }

      // 3. tag-only locator
      if (tagCandidates.length > 0) {
        for (const tag of tagCandidates) {
          locatorAttempts.push({
            strategy: "tag-only",
            locator: page.locator(tag),
          });
        }
      }

      // 4. Attempt each locator in order
      for (const { locator, strategy } of locatorAttempts) {
        const all = await locator.all();
        const visible = [];
        for (const el of all) {
          if (await el.isVisible()) visible.push(el);
        }

        if (visible.length === 0) continue;

        const targetIndex = action.target.position
          ? action.target.position - 1
          : 0;
        const element = visible[targetIndex] || visible[0];
        if (!element) continue;

        console.log(`🎯 Matched using strategy: ${strategy}`);

        switch (action.intent) {
          case "click":
            await element.click();
            break;
          case "input":
            await element.type(action.value || "");
            break;
          case "hover":
            await element.hover();
            break;
          default:
            return { success: false, error: "Unknown action intent" };
        }

        console.log("✅ Action executed successfully:", action);
        return { success: true };
      }

      console.warn(
        "⚠️ No visible elements found after all strategies:",
        action
      );
      return { success: false, error: "No visible elements found" };
    } catch (error) {
      console.error("❌ Error executing action:", error);
      return { success: false, error: error.message };
    }
  });
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

  await ctx.exposeBinding("__getCookies", async () => ctx.cookies());
};
