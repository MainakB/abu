(() => {
  const initAssertPicker = () => {
    if (!document.body || !window.__getSelectors) {
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

    document.addEventListener("mousemove", async (e) => {
      if (await window.__isPaused()) return;
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
      assertBox.style.border = "2px dashed green";
    });

    // An sync click listener to guardrail the next click listener which is async.
    // Because of being async the preventdefault does not run on time and hence we
    // have a sync click listener before to apply preventdefault and flags.
    document.addEventListener(
      "click",
      (e) => {
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
        // e.stopImmediatePropagation();
      },
      true
    );

    document.addEventListener(
      "click",
      async (e) => {
        if (await window.__isPaused()) return;
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
        if (!el || typeof window.__getSelectors !== "function") return;
        await window.__maybeRecordTabSwitch?.(`assert`, "click");
        const text = el.innerText?.trim() || "";

        if (mode === "visibility") {
          await window.__recordAction(
            window.__buildData({
              action: "assert",
              assertion: "toBeVisible",
              el,
              e,
              text,
            })
          );
        } else {
          window.showFloatingAssert(mode, el);
        }

        assertBox.style.display = "none";
        hoverTarget = null;
        // For text and value mode, do not reset from click listener,
        // as this will be done from docked pane on confirm/cancel
        if (!["text", "value"].includes(mode)) {
          await window.__recorderStore.setMode("record");
        }
      },
      true
    );

    ["pointerdown", "pointerup", "touchstart"].forEach((evt) => {
      document.addEventListener(
        evt,
        async (e) => {
          if (await window.__isPaused()) return;
          const mode = window.__recorderStore?.getMode?.();
          if (["text", "value", "visibility"].includes(mode)) {
            if (!(e.target instanceof Element)) return;
            if (
              e.target.closest("#floating-assert-dock-root") ||
              e.target.closest("#recorder-panel-root")
            ) {
              return;
            }
            await window.__maybeRecordTabSwitch?.(`assert`, evt);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
        },
        true // 🛑 Important: useCapture = true to intercept early
      );
    });
  };

  requestIdleCallback(initAssertPicker);
})();
