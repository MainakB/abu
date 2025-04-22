import React from "react";
import ReactDOM from "react-dom/client";
import FloatingAssertDock from "./components/FloatingAssertDock";
import FloatingAssertDockNonText from "./components/FloatingAssertDockNonText";
import FloatingCookieListDock from "./components/FloatingCookieListDock";
import FloatingDeleteCookieDock from "./components/FloatingDeleteCookieDock";

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
  if (val === ASSERTIONMODES.ADDCOOKIES) return ASSERTIONNAMES.ADDCOOKIES;
  if (val === ASSERTIONMODES.DELETECOOKIES) return ASSERTIONNAMES.DELETECOOKIES;
};

window.showFloatingAssert = (mode, el, e, type) => {
  console.log("Called in mode: ", mode);
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

  const closeDock = async () => {
    if (floatingAssertRoot) {
      floatingAssertRoot.unmount();
      floatingAssertRoot = null;
    }
    doc.getElementById("floating-assert-dock-root")?.remove();
    await window.__recorderStore.setMode("record");
  };
  let textValue = "";
  if (!(type === "addCookies" || type === "deleteCookies")) {
    el.innerText?.trim() || "";
  }

  console.log("Show dock for ", type);
  if (type === "text") {
    floatingAssertRoot.render(
      <FloatingAssertDock
        mode={mode}
        el={el}
        onCancel={async () => {
          await closeDock();
          // await window.__recorderStore.setMode("record");
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
          await closeDock();
          // await window.__recorderStore.setMode("record");
        }}
      />
    );
  } else if (type === "nonText") {
    floatingAssertRoot.render(
      <FloatingAssertDockNonText
        mode={mode}
        el={el}
        onCancel={async () => {
          await closeDock();
          // await window.__recorderStore.setMode("record");
        }}
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
          await closeDock();
          // await window.__recorderStore.setMode("record");
        }}
      />
    );
  } else if (type === "addCookies") {
    floatingAssertRoot.render(
      <FloatingCookieListDock
        onCancel={async () => {
          await closeDock();
        }}
        onConfirm={async (cookieList) => {
          // for (const cookie of cookieList) {
          await window.__addCookies(cookieList); // Exposed via context.exposeBinding
          await window.__recordAction(
            window.__buildData({
              action: "addCookies",
              cookies: cookieList,
            })
          );
          // }
          await closeDock();
        }}
      />
    );
  } else if (type === "deleteCookies") {
    floatingAssertRoot.render(
      <FloatingDeleteCookieDock
        onCancel={async () => {
          await closeDock();
        }}
        onConfirm={async (cookieList) => {
          await window.__deleteCookies(cookieList); // Exposed via context.exposeBinding
          await window.__recordAction(
            window.__buildData({
              action: "deleteCookies",
              cookies: cookieList,
            })
          );
          await closeDock();
        }}
      />
    );
  }
};
