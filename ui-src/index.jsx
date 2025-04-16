import React from "react";
import ReactDOM from "react-dom/client";
import RecorderPanel from "./components/RecorderPanel-backup";
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

  // const root = ReactDOM.createRoot(rootEl);
  if (!root) {
    root = ReactDOM.createRoot(rootEl);
  }

  console.log("✅ React panel injected");
  root.render(<RecorderPanel />);
};

const setupDomObserver = () => {
  const target = document.body;
  if (!target) {
    console.warn(
      "❗ document.body not ready for MutationObserver. Retrying..."
    );
    setTimeout(setupDomObserver, 100); // Retry after 100ms
    return;
  }

  const observer = new MutationObserver(() => {
    const exists = document.getElementById("recorder-panel-root");
    if (!exists) {
      console.warn("⚠️ Recorder panel missing. Reinjecting...");
      initializeRecorderPanel();
    }
  });

  observer.observe(target, { childList: true, subtree: true });
};

// Ensure script runs when DOM is fully loaded
if (document.readyState === "loading") {
  // document.addEventListener("DOMContentLoaded", initializeRecorderPanel);
  document.addEventListener("DOMContentLoaded", () => {
    initializeRecorderPanel();
    setupDomObserver();
  });
} else {
  // requestIdleCallback(initializeRecorderPanel);
  requestIdleCallback(() => {
    initializeRecorderPanel();
    setupDomObserver();
  });
}
