import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";

function getOwnText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent.trim())
    .join(" ")
    .trim();
}

export default function FloatingAssertDock({ el, mode, onConfirm, onCancel }) {
  const [expected, setExpected] = useState(() => {
    if (mode === ASSERTIONMODES.TEXT) return getOwnText(el);
    if (mode === ASSERTIONMODES.VALUE)
      return el?.value || el?.getAttribute("value") || "";
    return "";
  });

  const [softAssert, setSofAssert] = useState(false);

  useEffect(() => {
    if (!el) return;
    // if (mode === "text") {
    if (mode === ASSERTIONMODES.TEXT) {
      setExpected(el.innerText?.trim() || "");
    } else if (mode === ASSERTIONMODES.VALUE) {
      // else if (mode === "value") {
      setExpected(el.value || el.getAttribute("value") || "");
    }
  }, [el, mode]);

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>
            Assert that element
            {mode === ASSERTIONMODES.TEXT ? " text" : " value"} equals
            {/* {mode === "text" ? "text equals " : "value equals "} */}
          </strong>
        </div>
      </div>
      <textarea
        className="assert-dock-textarea"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
        placeholder="Enter expected value..."
      />
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
            onClick={() => {
              setSofAssert(false);
              onCancel();
            }}
            style={{ marginRight: 6 }}
          >
            ❌
          </button>
          <button
            onClick={() => {
              onConfirm(expected, softAssert);
              setSofAssert(false);
            }}
            disabled={!expected}
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
