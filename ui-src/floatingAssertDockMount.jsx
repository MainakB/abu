import React from "react";
import ReactDOM from "react-dom/client";
import FloatingAssertDock from "./components/FloatingAssertDock";

let floatingAssertRoot = null;

window.showFloatingAssert = (mode, el) => {
  let rootEl = document.getElementById("floating-assert-dock-root");

  if (!rootEl) {
    rootEl = document.createElement("div");
    rootEl.id = "floating-assert-dock-root";
    document.body.appendChild(rootEl);
    floatingAssertRoot = ReactDOM.createRoot(rootEl);
  }

  const closeDock = () => {
    if (floatingAssertRoot) {
      floatingAssertRoot.unmount();
      floatingAssertRoot = null;
    }
    document.getElementById("floating-assert-dock-root")?.remove();
  };

  floatingAssertRoot.render(
    <FloatingAssertDock
      mode={mode}
      el={el}
      onCancel={async () => {
        closeDock();
        await window.__recorderStore.setMode("record");
      }}
      onConfirm={async (expected) => {
        await window.__recordAction(
          window.__buildData({
            action: "assert",
            assertion: mode === "text" ? "toHaveText" : "toHaveValue",
            expected,
            el,
          })
        );
        closeDock();
        await window.__recorderStore.setMode("record");
      }}
    />
  );
};
