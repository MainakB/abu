import React from "react";
import ReactDOM from "react-dom/client";
import FloatingAssertDock from "./components/FloatingAssertDock";
import FloatingAssertDockNonText from "./components/FloatingAssertDockNonText";
import { ASSERTIONMODES, ASSERTIONNAMES } from "./constants/index.js";

let floatingAssertRoot = null;

const getModeSelected = (val) => {
  if (val === ASSERTIONMODES.TEXT) return ASSERTIONNAMES.TEXT;
  if (val === ASSERTIONMODES.VALUE) return ASSERTIONNAMES.VALUE;
  if (val === ASSERTIONMODES.ATTRIBUTEVALUE)
    return ASSERTIONNAMES.ATTRIBUTEVALUE;
  if (val === ASSERTIONMODES.NETPAYLOAD) return ASSERTIONNAMES.NETPAYLOAD;
  if (val === ASSERTIONMODES.NETREQUEST) return ASSERTIONNAMES.NETREQUEST;

  if (val === ASSERTIONMODES.VISIBILITY) return ASSERTIONNAMES.VISIBILITY;
  if (val === ASSERTIONMODES.PRSENECE) return ASSERTIONNAMES.PRSENECE;
  if (val === ASSERTIONMODES.ENABLED) return ASSERTIONNAMES.ENABLED;
  if (val === ASSERTIONMODES.DISABLED) return ASSERTIONNAMES.DISABLED;
};

window.showFloatingAssert = (mode, el, e, type) => {
  if (window !== window.top) {
    if (typeof window.top.showFloatingAssert === "function") {
      window.top.showFloatingAssert(mode, el);
    }
    return;
  }

  // Top-level only from here
  const doc = document;
  let rootEl = doc.getElementById("floating-assert-dock-root");

  // 💡 If stale root exists, remove and recreate it
  if (floatingAssertRoot && !rootEl) {
    floatingAssertRoot = null; // stale ref, kill it
  }

  if (!rootEl) {
    rootEl = doc.createElement("div");
    rootEl.id = "floating-assert-dock-root";
    doc.documentElement.appendChild(rootEl);
  }

  // ✅ Re-create React root if needed
  if (!floatingAssertRoot) {
    floatingAssertRoot = ReactDOM.createRoot(rootEl);
  }

  const closeDock = () => {
    if (floatingAssertRoot) {
      floatingAssertRoot.unmount();
      floatingAssertRoot = null;
    }
    doc.getElementById("floating-assert-dock-root")?.remove();
  };
  const textValue = el.innerText?.trim() || "";

  if (type === "text") {
    floatingAssertRoot.render(
      <FloatingAssertDock
        mode={mode}
        el={el}
        onCancel={async () => {
          closeDock();
          await window.__recorderStore.setMode("record");
        }}
        onConfirm={async (expected, isSoftAssert) => {
          await window.__recordAction(
            window.__buildData({
              action: "assert",
              isSoftAssert,
              assertion: getModeSelected(mode),
              expected,
              el,
              e,
              text: textValue,
            })
          );
          closeDock();
          await window.__recorderStore.setMode("record");
        }}
      />
    );
  } else if (type === "nonText") {
    floatingAssertRoot.render(
      <FloatingAssertDockNonText
        mode={mode}
        el={el}
        onCancel={async () => {
          closeDock();
          await window.__recorderStore.setMode("record");
        }}
        // await window.__recordAction(
        //   window.__buildData({
        //     action: "assert",
        //     assertion: assertName,
        //     // "toBeVisible",
        //     el,
        //     e,
        //     text,
        //   })
        // );

        onConfirm={async (isSoftAssert) => {
          await window.__recordAction(
            window.__buildData({
              action: "assert",
              isSoftAssert,
              assertion: getModeSelected(mode),
              el,
              e,
              text: textValue,
            })
          );
          closeDock();
          await window.__recorderStore.setMode("record");
        }}
      />
    );
  }
};
