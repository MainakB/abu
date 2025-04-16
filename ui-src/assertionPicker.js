(() => {
  const initAssertPicker = () => {
    if (!document.body || !window.getSelectors) {
      requestIdleCallback(initAssertPicker);
      return;
    }

    if (!window.__recorderStore) return;

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
      const mode = window.__recorderStore.getMode();
      if (!["text", "value", "visibility"].includes(mode)) return;

      const el = e.target;
      if (!el || !(el instanceof Element)) return;
      if (
        el.closest("#recorder-panel-root") ||
        el.closest("#floating-assert-dock-root")
      )
        return;

      hoverTarget = el;
      const rect = el.getBoundingClientRect();
      assertBox.style.left = `${rect.left + window.scrollX}px`;
      assertBox.style.top = `${rect.top + window.scrollY}px`;
      assertBox.style.width = `${rect.width}px`;
      assertBox.style.height = `${rect.height}px`;
      assertBox.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      const mode = window.__recorderStore.getMode();
      if (!["text", "value", "visibility"].includes(mode)) return;
      if (!(e.target instanceof Element)) return;
      if (
        e.target.closest("#floating-assert-dock-root") ||
        e.target.closest("#recorder-panel-root")
      )
        return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const el = hoverTarget;
      if (!el || typeof window.getSelectors !== "function") return;

      const { selectors, attributes } = window.getSelectors(el);
      const tagName = el.tagName.toLowerCase();
      const text = el.innerText?.trim() || "";

      if (mode === "visibility") {
        const step = {
          action: "assert",
          assertion: "toBeVisible",
          tagName,
          selectors,
          attributes,
          text,
        };
        window.__recorderStore.addAction(step);
        // window.__recorderStore.setMode("record");
      } else {
        window.showFloatingAssert(mode, el, selectors, attributes);
      }

      assertBox.style.display = "none";
      hoverTarget = null;
    });

    ["mousedown", "mouseup", "pointerdown", "pointerup", "touchstart"].forEach(
      (evt) => {
        document.addEventListener(
          evt,
          (e) => {
            const mode = window.__recorderStore?.getMode?.();
            if (["text", "value", "visibility"].includes(mode)) {
              if (!(e.target instanceof Element)) return;
              if (
                e.target.closest("#floating-assert-dock-root") ||
                e.target.closest("#recorder-panel-root")
              ) {
                return;
              }

              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
            }
          },
          true // 🛑 Important: useCapture = true to intercept early
        );
      }
    );
  };

  requestIdleCallback(initAssertPicker);
})();
