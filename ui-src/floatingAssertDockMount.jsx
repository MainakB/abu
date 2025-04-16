// import React from "react";
// import ReactDOM from "react-dom/client";
// import FloatingAssertDock from "./components/FloatingAssertDock";

// window.showFloatingAssert = (mode, el, selectors, attributes) => {
//   let rootEl = document.getElementById("floating-assert-dock-root");

//   if (!rootEl) {
//     rootEl = document.createElement("div");
//     rootEl.id = "floating-assert-dock-root";
//     document.body.appendChild(rootEl);
//   }

//   const root = ReactDOM.createRoot(rootEl);
//   root.render(
//     <FloatingAssertDock
//       mode={mode}
//       el={el}
//       onCancel={() => {
//         root.unmount();
//         document.getElementById("floating-assert-dock-root")?.remove();
//         // window.__recorderStore.setMode("record");
//       }}
//       onConfirm={(expected) => {
//         const assertStep = {
//           action: "assert",
//           assertion: mode === "text" ? "toHaveText" : "toHaveValue",
//           expected,
//           tagName: el.tagName.toLowerCase(),
//           selectors,
//           attributes,
//         };
//         window.__recorderStore.addAction(assertStep);
//         console.log("✅ Assertion added:", assertStep);
//         root.unmount();
//         document.getElementById("floating-assert-dock-root")?.remove();
//         // window.__recorderStore.setMode("record");
//       }}
//     />
//   );
// };

import React from "react";
import ReactDOM from "react-dom/client";
import FloatingAssertDock from "./components/FloatingAssertDock";

let floatingAssertRoot = null;

window.showFloatingAssert = (mode, el, selectors, attributes) => {
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
      onCancel={closeDock}
      onConfirm={(expected) => {
        const assertStep = {
          action: "assert",
          assertion: mode === "text" ? "toHaveText" : "toHaveValue",
          expected,
          tagName: el.tagName.toLowerCase(),
          selectors,
          attributes,
        };
        window.__recorderStore.addAction(assertStep);
        console.log("✅ Assertion added:", assertStep);
        closeDock();
      }}
    />
  );
};
