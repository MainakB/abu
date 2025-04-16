// (() => {
//   const isIgnorable = (el) =>
//     !el ||
//     !(el instanceof Element) ||
//     el.closest("#recorder-panel-root") ||
//     el.closest("#floating-assert-dock-root");

//   const getAssociatedLabel = (el) => {
//     if (!el.id) return null;
//     const labelEl = document.querySelector(`label[for="${el.id}"]`);
//     return labelEl?.innerText?.trim() || null;
//   };

//   const buildData = ({ action, el, e, value = null, text = null }) => {
//     const { selectors, attributes } = window.getSelectors(el);
//     return {
//       action,
//       tagName: el.tagName.toLowerCase(),
//       selectors,
//       attributes: {
//         ...(attributes || {}),
//         associatedLabel: getAssociatedLabel(el),
//       },
//       position: { x: e.pageX, y: e.pageY },
//       value,
//       text,
//     };
//   };

//   const record = (data) => {
//     fetch("http://localhost:3111/record", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//   };

//   const addListeners = () => {
//     document.addEventListener("click", (e) => {
//       const el = e.target;
//       const mode = window.__recorderStore?.getMode?.() || "record";

//       // 🛑 Skip if in assertion mode — let assertionPicker handle it
//       if (["text", "value", "visibility"].includes(mode)) return;
//       if (isIgnorable(el)) return;

//       record(
//         buildData({
//           action: "click",
//           el,
//           e,
//           text: el.innerText?.trim() || null,
//         })
//       );
//     });

//     document.addEventListener("input", (e) => {
//       const el = e.target;
//       if (isIgnorable(el) || el.tagName.toLowerCase() === "select") return;

//       record(
//         buildData({
//           action: "input",
//           el,
//           e,
//           value: el.value,
//         })
//       );
//     });

//     document.addEventListener("change", (e) => {
//       const el = e.target;
//       if (isIgnorable(el)) return;

//       const tag = el.tagName.toLowerCase();
//       let value = null;

//       if (el.type === "checkbox" || el.type === "radio") {
//         value = el.checked;
//       } else if (tag === "select") {
//         value = el.value;
//       } else {
//         return;
//       }

//       record(
//         buildData({
//           action: "select",
//           el,
//           e,
//           value,
//         })
//       );
//     });
//   };

//   if (
//     document.readyState === "complete" ||
//     document.readyState === "interactive"
//   ) {
//     addListeners();
//   } else {
//     document.addEventListener("DOMContentLoaded", addListeners);
//   }
// })();

(() => {
  const isIgnorable = (el) =>
    !el ||
    !(el instanceof Element) ||
    el.closest("#recorder-panel-root") ||
    el.closest("#floating-assert-dock-root");

  const getAssociatedLabel = (el) => {
    if (!el.id) return null;
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    return labelEl?.innerText?.trim() || null;
  };

  const buildData = ({ action, el, e, value = null, text = null }) => {
    const { selectors, attributes } = window.getSelectors(el);
    return {
      action,
      tagName: el.tagName.toLowerCase(),
      selectors,
      attributes: {
        ...(attributes || {}),
        associatedLabel: getAssociatedLabel(el),
      },
      position: { x: e.pageX, y: e.pageY },
      value,
      text,
    };
  };

  const record = (data) => {
    fetch("http://localhost:3111/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  let currentInput = null;
  let initialValue = null;

  const addListeners = () => {
    document.addEventListener("click", (e) => {
      const el = e.target;
      const mode = window.__recorderStore?.getMode?.() || "record";

      // 🛑 Finalize any pending input before handling click
      if (currentInput && el !== currentInput) {
        const finalValue = currentInput.value;
        if (finalValue !== initialValue) {
          record(
            buildData({
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

      if (["text", "value", "visibility"].includes(mode)) return;
      if (isIgnorable(el)) return;

      record(
        buildData({
          action: "click",
          el,
          e,
          text: el.innerText?.trim() || null,
        })
      );
    });

    document.addEventListener("focusin", (e) => {
      const el = e.target;
      if (
        el instanceof HTMLInputElement &&
        !isIgnorable(el) &&
        el.type !== "checkbox" &&
        el.type !== "radio"
      ) {
        currentInput = el;
        initialValue = el.value;
      }
    });

    document.addEventListener("focusout", (e) => {
      const el = e.target;
      if (el === currentInput) {
        const finalValue = el.value;
        if (finalValue !== initialValue) {
          record(buildData({ action: "input", el, e, value: finalValue }));
        }
        currentInput = null;
        initialValue = null;
      }
    });

    document.addEventListener("change", (e) => {
      const el = e.target;
      if (isIgnorable(el)) return;

      const tag = el.tagName.toLowerCase();
      let value = null;

      if (el.type === "checkbox" || el.type === "radio") {
        value = el.checked;
      } else if (tag === "select") {
        value = el.value;
      } else {
        return;
      }

      record(
        buildData({
          action: "select",
          el,
          e,
          value,
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
