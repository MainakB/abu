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
        shouldUpdateInput = finalValue !== initialValue && el.type !== "file";
        if (shouldUpdateInput) {
          window.__maybeRecordTabSwitch?.("recorder-click-input");
          const buildData = window.__buildData({
            action: assertionModes.INPUT,
            el: currentInput,
            e,
            value: finalValue,
            elementIndex: -1,
          });
          const { elIndex, refinedAttributes } = window.__searchElIndex(
            e.target,
            "input",
            buildData
          );
          buildData.elementIndex = elIndex;
          buildData.attributes = { ...refinedAttributes };
          window.__recordAction(buildData);
        }
        currentInput = null;
        initialValue = null;
      }
      if (
        el.tagName &&
        el.tagName.toLowerCase() === "input" &&
        el.type === "file"
      )
        return;

      if (
        Object.values(assertionModes).includes(mode) &&
        mode !== assertionModes.AICHAT
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      if (isIgnorable(el)) return;
      if (!shouldUpdateInput) window.__maybeRecordTabSwitch?.("recorder-click");

      if (el.tagName && el.tagName.toLowerCase() === "select") return;
      const buildData = window.__buildData({
        action: assertionModes.CLICK,
        el,
        e,
        text: window.__getTextValueOfEl(el) || el.innerText?.trim() || null,
        elementIndex: -1,
      });
      const { elIndex, refinedAttributes } = window.__searchElIndex(
        e.target,
        el.tagName.toLowerCase(),
        buildData
      );
      buildData.elementIndex = elIndex;
      buildData.attributes = { ...refinedAttributes };
      window.__recordAction(buildData);
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
          const buildData = window.__buildData({
            action: assertionModes.INPUT,
            el,
            e,
            value: finalValue,
            keyPressed: "Enter",
            elementIndex: -1,
          });
          const { elIndex, refinedAttributes } = window.__searchElIndex(
            e.target,
            "input",
            buildData
          );
          buildData.elementIndex = elIndex;
          buildData.attributes = { ...refinedAttributes };
          window.__recordAction(buildData);
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
        if (finalValue !== initialValue && el.type !== "file") {
          const buildData = window.__buildData({
            action: assertionModes.INPUT,
            el,
            e,
            value: finalValue,
            elementIndex: -1,
          });
          const { elIndex, refinedAttributes } = window.__searchElIndex(
            e.target,
            "input",
            buildData
          );
          buildData.elementIndex = elIndex;
          buildData.attributes = { ...refinedAttributes };
          window.__recordAction(buildData);
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
      let selectedOption = null;
      let isFileUpload = false;
      let fileNames = [];
      if (el.type === "checkbox" || el.type === "radio") {
        value = el.checked;
      } else if (tag === "select") {
        selectedOption = el.options[el.selectedIndex];
        const selectedValue = selectedOption.value;
        const selectedText = selectedOption.textContent.trim();
        value = selectedText;
        selectOptionIndex = selectedValue;
      } else if (tag === "input" && el.type === "file") {
        const fileList = el.files;
        const fileNamesList = Array.from(fileList).map((f) => f.name);
        if (fileNamesList.length) {
          isFileUpload = true;
          fileNames = [...fileNamesList];
        }
      } else {
        return;
      }

      window.__maybeRecordTabSwitch?.("recorder-change");
      window.__recordAction(
        window.__buildData({
          action: isFileUpload
            ? assertionModes.FILEUPLOAD
            : assertionModes.SELECT,
          el,
          e,
          value,
          selectOptionIndex,
          ...(selectedOption && selectedOption.tagName
            ? { selectOptionTag: selectedOption.tagName.toLowerCase() }
            : {}),
          ...(isFileUpload ? { isFileUpload, fileNames } : {}),
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
