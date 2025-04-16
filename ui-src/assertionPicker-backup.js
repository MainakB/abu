(() => {
  const initAssertPicker = () => {
    if (!document.body || !window.getSelectors) {
      requestIdleCallback(initAssertPicker);
      return;
    }

    console.log("✅ Assertion picker initialized");

    if (!window.__recorderStore) {
      window.__recorderStore = { actions: [] };
    }

    const assertBox = document.createElement("div");
    assertBox.style.position = "absolute";
    assertBox.style.border = "2px dashed #f00";
    assertBox.style.background = "rgba(255, 0, 0, 0.08)";
    assertBox.style.pointerEvents = "none";
    assertBox.style.zIndex = "999998";
    assertBox.style.display = "none";
    document.body.appendChild(assertBox);

    let hoverTarget = null;

    document.addEventListener("mousemove", (e) => {
      // const mode = window.__recorderMode;
      const mode = window.__recorderStore.mode;
      if (!["text", "value", "visibility"].includes(mode)) return;

      const el = e.target;

      // ✅ Ignore early if not an actual element
      if (!el || !(el instanceof Element)) {
        return;
      }

      if (
        el.closest("#recorder-panel-root") ||
        el.closest("#floating-assert-dock-root")
      )
        return;

      hoverTarget = el;
      console.log("🟢 hoverTarget set to:", el.tagName);

      const rect = el.getBoundingClientRect();
      assertBox.style.left = `${rect.left + window.scrollX}px`;
      assertBox.style.top = `${rect.top + window.scrollY}px`;
      assertBox.style.width = `${rect.width}px`;
      assertBox.style.height = `${rect.height}px`;
      assertBox.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      // const mode = window.__recorderMode;
      const mode = window.__recorderStore.mode;
      console.log("🖱️ Click detected. Mode is:", mode);

      if (!["text", "value", "visibility"].includes(mode)) return;

      // ✅ Ignore early if not an actual element
      if (!(e.target instanceof Element)) return;

      // ✅ Prevent clicks inside the assertion dock from being re-captured
      if (
        e.target instanceof Element &&
        e.target.closest("#floating-assert-dock-root")
      )
        return;

      e.preventDefault();
      e.stopPropagation();

      const el = hoverTarget;
      console.log("🔍 hoverTarget at click:", el);
      if (!el || typeof window.getSelectors !== "function") return;

      const { selectors, attributes } = window.getSelectors(el);
      const tagName = el.tagName.toLowerCase();
      const text = el.innerText?.trim() || "";

      if (mode === "visibility") {
        console.log("✅ Recording visibility assertion...");
        const step = {
          action: "assert",
          assertion: "toBeVisible",
          tagName,
          selectors,
          attributes,
          text,
        };
        // window.__recorderStore.actions.push(step);
        window.__recorderStore.addAction(step);
        console.log("✅ Visibility assertion added:", step);
        // window.__recorderMode = "record";
        window.__recorderStore.setMode("record");
      } else {
        console.log("📦 Opening assertion dock...");
        window.showFloatingAssert(mode, el, selectors, attributes);
        // window.__recorderMode = "record";
        window.__recorderStore.setMode("record");
      }

      assertBox.style.display = "none";
      hoverTarget = null; // ✅ Fixes second assertion trigger
    });
  };

  requestIdleCallback(initAssertPicker);
})();
