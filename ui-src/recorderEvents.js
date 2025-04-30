(() => {
  const isIgnorable = (el) =>
    !el ||
    !(el instanceof Element) ||
    el.closest("#recorder-panel-root") ||
    el.closest("#floating-assert-dock-root");

  let currentInput = null;
  let initialValue = null;
  const assertionModes = window.__ASSERTIONMODES;

  const addListeners = () => {
    document.addEventListener("click", (e) => {
      const el = e.target;
      const mode = window.__recorderStore?.getMode?.() || "record";
      let shouldUpdateInput = false;
      if (window.__isPaused()) return;
      // 🛑 Finalize any pending input before handling click
      if (currentInput && el !== currentInput) {
        const finalValue = currentInput.value;
        shouldUpdateInput = finalValue !== initialValue;
        if (shouldUpdateInput) {
          window.__maybeRecordTabSwitch?.("recorder-click-input");
          window.__recordAction(
            window.__buildData({
              action: "input",
              el: currentInput,
              e,
              value: finalValue,
            })
          );
        }
        currentInput = null;
        initialValue = null;
      }

      if (Object.values(assertionModes).includes(mode)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      if (isIgnorable(el)) return;
      if (!shouldUpdateInput) window.__maybeRecordTabSwitch?.("recorder-click");

      if (el.tagName && el.tagName.toLowerCase() === "select") return;
      window.__recordAction(
        window.__buildData({
          action: "click",
          el,
          e,
          text: el.innerText?.trim() || null,
        })
      );
    });

    document.addEventListener("focusin", (e) => {
      if (window.__isPaused()) return;
      const el = e.target;
      if (
        el instanceof HTMLInputElement &&
        !isIgnorable(el) &&
        el.type !== "checkbox" &&
        el.type !== "radio"
      ) {
        currentInput = el;
        initialValue = el.value;
        el.addEventListener("keydown", handleKeydown);
      }
    });

    function handleKeydown(e) {
      if (e.key === "Enter" && currentInput) {
        const el = currentInput;
        const finalValue = el.value;

        if (finalValue !== initialValue) {
          window.__recordAction(
            window.__buildData({
              action: "input",
              el,
              e,
              value: finalValue,
              keyPressed: "Enter",
            })
          );
        }

        currentInput.removeEventListener("keydown", handleKeydown);
        currentInput = null;
        initialValue = null;
      }
    }

    document.addEventListener("focusout", (e) => {
      if (window.__isPaused()) return;
      const el = e.target;
      if (el === currentInput) {
        const finalValue = el.value;
        if (finalValue !== initialValue) {
          window.__recordAction(
            window.__buildData({ action: "input", el, e, value: finalValue })
          );
        }
        currentInput = null;
        initialValue = null;
      }
    });

    document.addEventListener("change", (e) => {
      if (window.__isPaused()) return;
      const el = e.target;
      if (isIgnorable(el)) return;
      const tag = el.tagName.toLowerCase();
      let value = null;
      let selectOptionIndex = null;
      if (el.type === "checkbox" || el.type === "radio") {
        value = el.checked;
      } else if (tag === "select") {
        const selectedOption = el.options[el.selectedIndex];
        const selectedValue = selectedOption.value;
        const selectedText = selectedOption.textContent.trim();
        value = selectedText;
        selectOptionIndex = selectedValue;
      } else {
        return;
      }

      window.__maybeRecordTabSwitch?.("recorder-change");
      window.__recordAction(
        window.__buildData({
          action: "select",
          el,
          e,
          value,
          selectOptionIndex,
          ...(selectedOption.tagName
            ? { selectOptionTag: selectedOption.tagName.toLowerCase() }
            : {}),
        })
      );
    });
  };

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    addListeners();
  } else {
    document.addEventListener("DOMContentLoaded", addListeners);
  }
})();
