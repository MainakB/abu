import fs from "fs";
import path from "path";
import { program } from "commander";
import inquirer from "inquirer";
import { spawn, execSync } from "child_process";
import chalk from "chalk";
import { fileURLToPath } from "url";

import { RecorderConfig } from "../servers/RecorderConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let apiServer = null;
let wsServer = null;

function ensureExtension(fileName, requiredExt) {
  if (!fileName) return "";
  return fileName.endsWith(requiredExt)
    ? fileName
    : `${fileName}${requiredExt}`;
}

function ensureTagName(tagName) {
  if (!tagName) return "";
  return tagName.startsWith("@") ? tagName : `@${tagName}`;
}

async function getCliOptions() {
  if (
    !program._optionValues ||
    Object.keys(program._optionValues).length === 0
  ) {
    program
      .option(
        "-b, --base <baseFolder>",
        "Base folder (under which src/ exists)"
      )
      .option("-f, --feature <featureFile>", "Feature file name to output")
      .option("-l, --locator <locatorFile>", "Locator file name to output")
      .option("--featureName <featureName>", "Feature name to use")
      .option("--scenario <scenarioName>", "Scenario name to use")
      .option("--tag <tagName>", "Tag name to use")
      .option("--debug");

    program.parse(process.argv);
  }

  const options = program.opts();

  const baseFolder = options.base || process.cwd();
  const srcPath = path.join(baseFolder, "src");

  if (!fs.existsSync(srcPath)) {
    console.warn(
      chalk.red(
        `🔥🔥🔥 src/ folder not found in ${baseFolder}. Creating one automatically, but make sure you are in an existing test project folder to be able to replay the recording.\n`
      )
    );
    fs.mkdirSync(srcPath, { recursive: true });

    // process.exit(1);
  }

  let srcSubfolders = fs
    .readdirSync(srcPath, { withFileTypes: true })
    .filter((f) => f.isDirectory())
    .map((f) => f.name);

  if (srcSubfolders.length === 0) {
    fs.mkdirSync(path.join(srcPath, "recordings"), { recursive: true });
    srcSubfolders = fs
      .readdirSync(srcPath, { withFileTypes: true })
      .filter((f) => f.isDirectory())
      .map((f) => f.name);
  }

  let selectedFolder = srcSubfolders[0];
  if (srcSubfolders.length > 1) {
    const folderPrompt = await inquirer.prompt([
      {
        type: "list",
        name: "folder",
        message: "Select a subfolder from src:",
        choices: srcSubfolders,
      },
    ]);
    selectedFolder = folderPrompt.folder;
  }

  const prompts = [];

  if (!options.feature) {
    prompts.push({
      type: "input",
      name: "feature",
      message: "Enter feature file name (without .feature extension):",
    });
  }

  if (!options.locator) {
    prompts.push({
      type: "input",
      name: "locator",
      message: "Enter locator file name (without .ts extension):",
    });
  }

  if (!options.featureName) {
    prompts.push({
      type: "input",
      name: "featureName",
      message: "Enter feature name (optional):",
    });
  }

  if (!options.scenario) {
    prompts.push({
      type: "input",
      name: "scenario",
      message: "Enter scenario name (optional):",
    });
  }

  if (!options.tag) {
    prompts.push({
      type: "input",
      name: "tag",
      message: "Enter tag name (optional):",
    });
  }

  const answers = await inquirer.prompt(prompts);

  const result = {
    selectedSrcFolder: path.join(srcPath, selectedFolder),
    customerName: selectedFolder,
    // selectedFolder,
    featureFile: ensureExtension(
      options.feature || answers.feature,
      ".feature"
    ),
    locatorFile: ensureExtension(options.locator || answers.locator, ".ts"),
    featureName: options.featureName || answers.featureName,
    scenarioName: options.scenario || answers.scenario,
    tagName: ensureTagName(options.tag || answers.tag),
    basePath: baseFolder,
    debug: options.debug || false, // To set to true use -- --debug flag in run command
  };

  return result;
}

const waitForServer = async (debugMode, timeoutMs = 15000) => {
  const url = "http://localhost:3111/api/health";
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (err) {
      if (debugMode) console.warn("⏳ Waiting for server to be ready...");
      // wait and try again
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(
    `❌ Server at ${url} did not become ready within ${timeoutMs}ms`
  );
};

export const startAndSaveCliConfig = async () => {
  const cliConfigEntries = await getCliOptions();
  const recorderConfig = new RecorderConfig(cliConfigEntries);

  return recorderConfig.toJSON();
  // const recordingsDir = path.join(process.cwd(), ".recording_metadata");
  // // return path.join(process.cwd(), "recordings", FILE_NAME);
  // const filePath = path.join(recordingsDir, ".recorder-config.json");
  // const dir = path.dirname(filePath);
  // if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // fs.writeFileSync(
  //   filePath,
  //   JSON.stringify(recorderConfig.toJSON(), null, 2),
  //   "utf-8"
  // );
};

export const initRecorderConfig = async (recorderConfig) => {
  await waitForServer(recorderConfig.debug);
  await fetch("http://localhost:3111/api/recorder/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recorderConfig),
  });
};

export const startServers = (debugMode) => {
  const apiPath = path.join(__dirname, "../servers", "api-server.js");
  const wsPath = path.join(__dirname, "../servers", "ws-server.js");

  apiServer = spawn("node", [apiPath, "--debugMode", debugMode], {
    stdio: "inherit",
  });
  wsServer = spawn("node", [wsPath, "--debugMode", debugMode], {
    stdio: "inherit",
  });
};

const stopServers = async (debugMode) => {
  if (debugMode) console.log("🛑 Shutting down servers...");
  await fetch("http://localhost:3111/api/flushQueue", {
    headers: { "Content-Type": "application/json" },
  });

  apiServer.kill(); // 3111
  wsServer.kill(); // 8787
  process.exit(0);
};

export const ensureChromiumInstalled = (chromium, debugMode) => {
  const executablePath = chromium.executablePath();
  if (!fs.existsSync(executablePath)) {
    console.log("🔧 Chromium not found. Installing...");
    if (debugMode) {
      execSync("npx playwright install chromium", { stdio: "inherit" });
    } else {
      try {
        execSync("npx playwright install chromium", { stdio: "pipe" });
      } catch (e) {
        console.error("❌ Failed to install Chromium:", e.stderr.toString());
      }
    }
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
  browser,
  recorderConfig
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
    if (recorderConfig.debug)
      console.log("🛑 Stopping recording. Fetching actions from store...");

    const steps = await fetch("http://localhost:3111/record").then((res) =>
      res.json()
    );

    const sorted = [
      ...steps.filter((a) => a.action === "navigate"),
      ...steps.filter((a) => a.action !== "navigate"),
    ];

    const recordingsDir = path.join(process.cwd(), ".recording_metadata");
    const filePath = path.join(recordingsDir, `test-${Date.now()}.json`);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await fs.promises.writeFile(filePath, JSON.stringify(sorted, null, 2));
    const testCommand = `"npx abc --customer=${recorderConfig.customerName} --tags=${recorderConfig.tagName} --platform=dev"`;

    if (recorderConfig.debug) {
      console.log(
        `✅ ${
          steps.length
        } steps saved to ${filePath}. Run recorded test with the comand ${chalk.green(
          chalk.blue.underline.bold(testCommand)
        )} ✅ ✅ ✅ ✅\n`
      );
    } else {
      console.log(
        `\n✅ ✅ ✅ ✅ Run recorded test with the comand ${chalk.green(
          chalk.blue.underline.bold(testCommand)
        )} ✅ ✅ ✅ ✅\n`
      );
    }

    await browser.close();
    await stopServers(recorderConfig.debug);
    process.exit(0);
  });

  await page.exposeBinding("__pageReload", async () => {
    // await new Promise((resolve) => setTimeout(resolve, 250));
    await page.reload({ waitUntil: "domcontentloaded" });
  });

  await page.exposeBinding("__pageUrl", async () => page.url());

  await page.exposeBinding("__getPageTitle", async () => page.title());

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

export async function gracefulShutdown(exitCode = 0) {
  try {
    await stopServers();
  } catch (error) {
    console.error("Error during shutdown:", error);
    exitCode = 1;
  } finally {
    process.exit(exitCode);
  }
}
