(() => {
  const initializeOverlay = () => {
    if (!document.documentElement) {
      console.warn("document.documentElement not ready, retrying...");
      requestIdleCallback(initializeOverlay);
      return;
    }

    const highlightBox = document.createElement("div");
    highlightBox.style.position = "absolute";
    highlightBox.style.border = "2px solid rgba(255, 0, 0, 0.5)";
    highlightBox.style.backgroundColor = "rgba(255, 0, 0, 0.15)";
    highlightBox.style.borderRadius = "4px";
    highlightBox.style.zIndex = "999998"; // Slightly below the panel (999999)
    highlightBox.style.pointerEvents = "none";
    highlightBox.style.display = "none";
    highlightBox.style.transition = "all 0.1s ease";
    highlightBox.style.boxSizing = "border-box";

    document.documentElement.appendChild(highlightBox);

    document.addEventListener("mousemove", async (e) => {
      if (window.__isPaused()) return;
      const target = e.target;

      if (
        !target ||
        !(target instanceof Element) || // ✅ safeguard
        target === highlightBox ||
        target.closest("#recorder-panel-root") ||
        target.closest("#floating-assert-dock-root")
      ) {
        highlightBox.style.display = "none";
        return;
      }

      const rect = target.getBoundingClientRect();
      highlightBox.style.left = `${rect.left + window.scrollX}px`;
      highlightBox.style.top = `${rect.top + window.scrollY}px`;
      highlightBox.style.width = `${rect.width}px`;
      highlightBox.style.height = `${rect.height}px`;
      highlightBox.style.display = "block";
    });

    document.addEventListener("mouseout", async (e) => {
      if (window.__isPaused()) return;
      highlightBox.style.display = "none";
    });

    console.log("✅ Overlay initialized");
  };

  // Ensure overlay initializes only when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeOverlay);
  } else {
    requestIdleCallback(initializeOverlay);
  }
})();
