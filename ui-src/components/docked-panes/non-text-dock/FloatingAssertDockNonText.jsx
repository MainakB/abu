import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";

function getOwnText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent.trim())
    .join(" ")
    .trim();
}

export default function FloatingAssertDockNonText({
  el,
  mode,
  onConfirm,
  onCancel,
}) {
  const [softAssert, setSofAssert] = useState(false);

  useEffect(() => {
    if (!el) return;
  }, [el, mode]);

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div style={{ marginBottom: "6px" }}>
        <strong>
          Assert that element{" "}
          {mode === ASSERTIONMODES.TEXT ? "text equals " : "value equals "}
        </strong>
      </div>
      <div className="docked-pane-footer-confirm-cancel">
        <div className="docked-pane-footer-assert-container">
          <input
            type="checkbox"
            checked={softAssert}
            onChange={() => setSofAssert((prev) => !prev)}
          ></input>
          <label>Soft Assert</label>
        </div>
        <div className="docked-pane-footer-buttons">
          <button
            className="docked-pane-footer-cancel-button"
            onClick={() => {
              setSofAssert(false);
              onCancel();
            }}
            style={{ marginRight: 6 }}
          >
            ❌
          </button>
          <button
            className="docked-pane-footer-confirm-button"
            onClick={() => {
              onConfirm(softAssert);
              setSofAssert(false);
            }}
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
