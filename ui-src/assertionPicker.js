(() => {
  const initAssertPicker = () => {
    if (!document.documentElement || !window.__getSelectors) {
      requestIdleCallback(initAssertPicker);
      return;
    }

    if (!window.__recorderStore) return;
    const assertionModes = window.__ASSERTIONMODES;
    const assertionNames = window.__ASSERTIONNAMES;
    const nonDockAsserts = window.__NONDOCKASSERTIONNAMES;

    const assertBox = document.createElement("div");
    assertBox.style.position = "absolute";
    assertBox.style.border = "2px dashed #f00";
    assertBox.style.background = "rgba(255, 0, 0, 0.08)";
    assertBox.style.pointerEvents = "none";
    assertBox.style.zIndex = "999998";
    assertBox.style.display = "none";
    document.documentElement.appendChild(assertBox);

    let hoverTarget = null;

    document.addEventListener("mousemove", (e) => {
      if (window.__isPaused()) return;
      const mode = window.__recorderStore.getMode();

      if (!Object.values(assertionModes).includes(mode)) return;

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

    document.addEventListener("mouseout", (e) => {
      const mode = window.__recorderStore.getMode();

      if (Object.values(assertionModes).includes(mode)) {
        assertBox.style.display = "none";
      }
    });

    // An sync click listener to guardrail the next click listener which is async.
    // Because of being async the preventdefault does not run on time and hence we
    // have a sync click listener before to apply preventdefault and flags.
    document.addEventListener(
      "click",
      (e) => {
        const mode = window.__recorderStore.getMode();

        if (!Object.values(assertionModes).includes(mode)) return;
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
      (e) => {
        if (window.__isPaused()) return;
        const mode = window.__recorderStore.getMode();

        if (!Object.values(assertionModes).includes(mode)) return;
        if (!(e.target instanceof Element)) return;
        if (
          e.target.closest("#floating-assert-dock-root") ||
          e.target.closest("#recorder-panel-root")
        )
          return;

        if (
          mode === assertionModes.ADDCOOKIES ||
          mode === assertionModes.DELETECOOKIES ||
          mode === assertionModes.TAKESCREENSHOT ||
          mode === assertionModes.ADDREUSESTEP ||
          mode === assertionModes.PAGERELOAD ||
          mode === assertionModes.ASSERTCURRENTURL ||
          mode === assertionModes.ASSERTCOOKIEVALUE ||
          mode === assertionModes.ASSERTTEXTINPAGESOURCE ||
          mode === assertionModes.ASSERTTEXTINPDF ||
          mode === assertionModes.ASSERTPDFCOMPARISON ||
          mode === assertionModes.ASSERTTEXTIMAGESINPDF ||
          mode === assertionModes.ASSERTCPDPDF
        ) {
          assertBox.style.display = "none";
          hoverTarget = null;
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const el = hoverTarget;
        if (!el || typeof window.__getSelectors !== "function") return;
        window.__maybeRecordTabSwitch?.(`assert-click`);

        window.showFloatingAssert(mode, el, e, mode);

        assertBox.style.display = "none";
        hoverTarget = null;

        // For docked assert mode, do not reset from click listener,
        // as this will be done from docked pane on confirm/cancel
        // if (!["text", "value"].includes(mode)) {
        if (!Object.values(nonDockAsserts).includes(mode)) {
          window.__recorderStore.setMode("record");
        }
      },
      true
    );

    ["pointerdown", "pointerup", "touchstart"].forEach((evt) => {
      document.addEventListener(
        evt,
        (e) => {
          if (window.__isPaused()) return;
          const mode = window.__recorderStore?.getMode?.();
          if (Object.values(assertionModes).includes(mode)) {
            if (!(e.target instanceof Element)) return;
            if (
              e.target.closest("#floating-assert-dock-root") ||
              e.target.closest("#recorder-panel-root")
            ) {
              return;
            }
            window.__maybeRecordTabSwitch?.(`assert-${evt}`);
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
