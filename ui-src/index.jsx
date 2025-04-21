import React from "react";
import ReactDOM from "react-dom/client";
import RecorderPanel from "./components/RecorderPanel";
import "./style.css";

let root; // Persist root for potential reuse

// Function to initialize the panel safely
const initializeRecorderPanel = () => {
  let rootEl = document.getElementById("recorder-panel-root");

  if (!rootEl) {
    rootEl = document.createElement("div");
    rootEl.id = "recorder-panel-root";

    // Ensure document.body exists before appending
    if (document.body) {
      document.body.appendChild(rootEl);
    } else {
      console.warn("document.body not ready. Retrying...");
      requestIdleCallback(initializeRecorderPanel);
      return;
    }
  }

  if (!rootEl.hasChildNodes()) {
    if (!root) {
      root = ReactDOM.createRoot(rootEl);
    }

    root.render(<RecorderPanel />);
    console.log("✅ React panel injected");
  } else {
    console.log("⚠️ Recorder panel already rendered");
  }
};

const observeDOMAndRoute = () => {
  console.log("🔍 DOM + Route observer initialized");

  const reinjectIfMissing = () => {
    const exists = document.getElementById("recorder-panel-root");
    if (!exists) {
      console.warn("⚠️ Panel missing after route change. Reinserting...");
      initializeRecorderPanel();
    }
  };
  const target = document.body;
  if (target instanceof Node) {
    const mo = new MutationObserver(reinjectIfMissing);
    mo.observe(document.body, { childList: true, subtree: true });
  } else {
    console.warn(
      "⚠️ DOM observer not initialized: document.body not available."
    );
  }
  const wrap = (fn) => {
    return function (...args) {
      const result = fn.apply(this, args);
      setTimeout(reinjectIfMissing, 50);
      return result;
    };
  };

  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);
  window.addEventListener("popstate", () => {
    console.log("🔁 Detected popstate route change");
    setTimeout(reinjectIfMissing, 50);
  });
};

window.__bootRecorderUI = () => {
  // If this is the top frame AND it contains a frameset, do NOT inject UI here
  // if (
  //   window === window.top &&
  //   document.documentElement &&
  //   document.documentElement.tagName.toLowerCase() === "frameset"
  // ) {
  //   console.warn("⚠️ Skipping panel injection in <frameset> document.");
  //   return;
  // }

  // // If we're in an iframe/frame but NOT the first one, skip (optional)
  // if (window !== window.top) {
  //   const isFirstFrame = window.parent.frames[0] === window;
  //   if (!isFirstFrame) {
  //     console.warn("❌ Skipping panel in non-primary frame.");
  //     return;
  //   }
  // }

  const tryBoot = () => {
    if (window.__recorderStore) {
      initializeRecorderPanel();
      observeDOMAndRoute();
      // window.__setupDomObserver();
    } else {
      console.warn("⏳ Waiting for __recorderStore...");
      setTimeout(tryBoot, 50);
    }
  };

  tryBoot(); // Don't delay – we’re already injected via script tag

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    requestIdleCallback(tryBoot);
  } else {
    document.addEventListener("DOMContentLoaded", tryBoot);
  }
};

// ✅ Auto-run it on main page
window.__bootRecorderUI();
