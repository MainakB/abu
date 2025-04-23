import fs from "fs";
import path from "path";

export async function getCssInjectionString(cssContent) {
  return `
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
}

export async function injectAllScripts({
  page,
  tabId,
  initialPage,
  cssContent,
  scriptPaths,
}) {
  await page.waitForLoadState("domcontentloaded");

  const cssInitString = await getCssInjectionString(cssContent);

  const injectInitScript = async (filePath) => {
    const content = await fs.promises.readFile(filePath, "utf8");
    await page.addInitScript(content);
  };

  const injectScript = initialPage
    ? async (filePath) => {
        await page.addInitScript(cssInitString);
        const content = await fs.promises.readFile(filePath, "utf8");
        await page.addInitScript(content);
      }
    : async (filePath) => {
        await page.addStyleTag({ content: cssContent });
        await page.addScriptTag({ path: filePath });
      };

  for (const key in scriptPaths) {
    const filePath = path.join(scriptPaths[key]);
    await injectScript(filePath);
  }

  // Inject fallback reinjector watcher (injected *only* as initScript to survive SPA transitions)
  await injectInitScript(path.join("ui-src", "reinjectionWatcher.js"));

  // Final fallback: Reinject scripts using addInitScript *again* if not initialPage
  if (!initialPage) {
    for (const key in scriptPaths) {
      const filePath = path.join(scriptPaths[key]);
      const content = await fs.promises.readFile(filePath, "utf8");
      await page.addInitScript(content);
    }
  }

  if (!initialPage) {
    await page.evaluate(() => {
      requestIdleCallback(() => {
        window.__bootRecorderUI?.();
      });
    });
  }
}
