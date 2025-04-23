import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";

function getOwnText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent.trim())
    .join(" ")
    .trim();
}

function getHeader(type) {
  const base = "Assert Element Is";
  if (type === ASSERTIONMODES.VISIBILITY) return `${base} Visible`;
  if (type === ASSERTIONMODES.ENABLED) return `${base} Enabled`;
  if (type === ASSERTIONMODES.DISABLED) return `${base} Disabled`;
  if (type === ASSERTIONMODES.PRSENECE) return `${base} Present`;
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
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{getHeader(mode)}</strong>
        </div>
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
