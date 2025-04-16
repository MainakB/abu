// (() => {
//   // Attach listeners
//   const addListeners = () => {
//     document.addEventListener("click", (e) => {
//       console.log("📍 Click triggered on:", e.target);
//       const el = e.target;

//       // ✅ Ignore early if not an actual element
//       if (!el || !(el instanceof Element)) {
//         console.warn(
//           "🚫 1.1 Click skipped due to excluded element:",
//           el.target
//         );
//         return;
//       }

//       // ✅ Skip clicks on recorder panel or assertion dock
//       if (
//         el.closest("#recorder-panel-root") ||
//         el.closest("#floating-assert-dock-root")
//       ) {
//         console.warn(
//           "🚫 1.2 Click skipped due to excluded element:",
//           el.target
//         );
//         return;
//       }

//       const { selectors, attributes } = window.getSelectors(el);

//       let associatedLabel = null;
//       if (el.id) {
//         const labelEl = document.querySelector(`label[for="${el.id}"]`);
//         associatedLabel = labelEl?.innerText?.trim() || null;
//       }

//       const data = {
//         action: "click",
//         tagName: el.tagName.toLowerCase(),
//         selectors,
//         attributes: {
//           ...(attributes ? attributes : {}),
//           associatedLabel,
//         },
//         position: { x: e.pageX, y: e.pageY },
//         text: el.innerText?.trim() || "",
//         value: null,
//       };

//       if (window.__recorderStore?.addAction) {
//         window.__recorderStore.addAction(data);
//       } else {
//         console.warn("⚠️ __recorderStore.addAction not ready");
//       }
//     });

//     document.addEventListener("input", (e) => {
//       const el = e.target;

//       // ✅ Ignore early if not an actual element
//       if (!el || !(el instanceof Element)) {
//         console.warn(
//           "🚫 2.1 Click skipped due to excluded element:",
//           el.target
//         );
//         return;
//       }

//       // ✅ Skip clicks on recorder panel or assertion dock
//       if (
//         el.closest("#recorder-panel-root") ||
//         el.closest("#floating-assert-dock-root")
//       ) {
//         console.warn(
//           "🚫 2.2 Click skipped due to excluded element:",
//           el.target
//         );
//         return;
//       }
//       if (el.tagName.toLowerCase() === "select") return;

//       const { selectors, attributes } = window.getSelectors(el);
//       let associatedLabel = null;
//       if (el.id) {
//         const labelEl = document.querySelector(`label[for="${el.id}"]`);
//         associatedLabel = labelEl?.innerText?.trim() || null;
//       }
//       const data = {
//         action: "input",
//         tagName: el.tagName.toLowerCase(),
//         selectors,
//         attributes: {
//           ...(attributes ? attributes : {}),
//           associatedLabel,
//         },
//         position: { x: e.pageX, y: e.pageY },
//         text: null,
//         value: el.value,
//       };

//       if (window.__recorderStore?.addAction) {
//         window.__recorderStore.addAction(data);
//       } else {
//         console.warn("⚠️ __recorderStore.addAction not ready");
//       }
//     });

//     document.addEventListener("change", (e) => {
//       const el = e.target;

//       // ✅ Ignore early if not an actual element
//       if (!el || !(el instanceof Element)) {
//         console.warn(
//           "🚫 2.1 Click skipped due to excluded element:",
//           el.target
//         );
//         return;
//       }

//       // ✅ Skip clicks on recorder panel or assertion dock
//       if (
//         el.closest("#recorder-panel-root") ||
//         el.closest("#floating-assert-dock-root")
//       ) {
//         console.warn(
//           "🚫 2.2 Click skipped due to excluded element:",
//           el.target
//         );
//         return;
//       }
//       const { selectors, attributes } = window.getSelectors(el);
//       const tag = el.tagName.toLowerCase();
//       let action = "select";
//       let value;

//       if (el.type === "checkbox" || el.type === "radio") {
//         value = el.checked;
//       } else if (tag === "select") {
//         value = el.value;
//       } else {
//         return; // 👈 not a checkbox/radio/select
//       }
//       let associatedLabel = null;
//       if (el.id) {
//         const labelEl = document.querySelector(`label[for="${el.id}"]`);
//         associatedLabel = labelEl?.innerText?.trim() || null;
//       }

//       const data = {
//         action,
//         tagName: tag,
//         selectors,
//         attributes: {
//           ...(attributes ? attributes : {}),
//           associatedLabel,
//         },
//         position: { x: e.pageX, y: e.pageY },
//         text: null,
//         value,
//       };

//       if (window.__recorderStore?.addAction) {
//         window.__recorderStore.addAction(data);
//       } else {
//         console.warn("⚠️ __recorderStore.addAction not ready");
//       }
//     });

//     // document.addEventListener("mouseover", (e) => {
//     //   const el = e.target;
//     //   const { selectors, attributes } = window.getSelectors(el);

//     //   window.recordEvent({
//     //     action: "hover",
//     //     selectors,
//     //     attributes,
//     //     tagName: el.tagName.toLowerCase(),
//     //     position: { x: e.clientX, y: e.clientY },
//     //     value: null,
//     //     text: el.innerText?.trim() || "",
//     //   });
//     // });
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
    if (window.__recorderStore?.addAction) {
      window.__recorderStore.addAction(data);
    } else {
      console.warn("⚠️ __recorderStore.addAction not ready");
    }
  };

  const addListeners = () => {
    document.addEventListener("click", (e) => {
      const el = e.target;
      console.log("test-", window.__recorderStore?.getMode?.());
      const mode = window.__recorderStore?.getMode?.() || "record";

      // 🛑 Skip if in assertion mode — let assertionPicker handle it
      if (["text", "value", "visibility"].includes(mode)) return;

      if (isIgnorable(el)) return;
      console.log("📍 Click triggered on:", el);

      record(
        buildData({
          action: "click",
          el,
          e,
          text: el.innerText?.trim() || null,
        })
      );
    });

    document.addEventListener("input", (e) => {
      const el = e.target;
      if (isIgnorable(el) || el.tagName.toLowerCase() === "select") return;

      record(
        buildData({
          action: "input",
          el,
          e,
          value: el.value,
        })
      );
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
        return; // ⛔️ Not a supported change event
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
