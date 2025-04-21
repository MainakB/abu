import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../constants/index.js";

export default function MoreOptionsDrawer({
  isOpen,
  onClose,
  expanded,
  onToggleSection,
  onMenuSelection,
  getClassName,
  currentMode,
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer">
      {/* <div className="drawer-header">
        <span>Advanced Panel</span>
        <button onClick={onClose}>❌</button>
      </div> */}

      <div className="drawer-section">
        <div
          className="drawer-title"
          onClick={() => onToggleSection("assertions")}
        >
          Assertions {expanded.assertions ? "▲" : "▼"}
        </div>
        {expanded.assertions && (
          <ul className="drawer-list">
            <li
              className={getClassName(
                currentMode,
                ASSERTIONMODES.ATTRIBUTEVALUE
              )}
              onClick={async () =>
                await onMenuSelection(ASSERTIONMODES.ATTRIBUTEVALUE)
              }
            >
              ✓ Assert Attribute Value
            </li>
            <li
              className={getClassName(currentMode, ASSERTIONMODES.NETPAYLOAD)}
              onClick={async () =>
                await onMenuSelection(ASSERTIONMODES.NETPAYLOAD)
              }
            >
              ✓ Assert Network Payload
            </li>
            <li
              className={getClassName(currentMode, ASSERTIONMODES.NETREQUEST)}
              onClick={async () =>
                await onMenuSelection(ASSERTIONMODES.NETREQUEST)
              }
            >
              ✓ Assert Network Request
            </li>
            <li
              className={getClassName(currentMode, ASSERTIONMODES.PRSENECE)}
              onClick={async () =>
                await onMenuSelection(ASSERTIONMODES.PRSENECE)
              }
            >
              ✓ Assert Element Present
            </li>
            <li
              className={getClassName(currentMode, ASSERTIONMODES.ENABLED)}
              onClick={async () =>
                await onMenuSelection(ASSERTIONMODES.ENABLED)
              }
            >
              ✓ Assert Element Enabled
            </li>
            <li
              className={getClassName(currentMode, ASSERTIONMODES.DISABLED)}
              onClick={async () =>
                await onMenuSelection(ASSERTIONMODES.DISABLED)
              }
            >
              ✓ Assert Element Disabled
            </li>
          </ul>
        )}
      </div>

      <div className="drawer-section">
        <div
          className="drawer-title"
          onClick={() => onToggleSection("actions")}
        >
          Actions {expanded.actions ? "▲" : "▼"}
        </div>
        {expanded.actions && (
          <ul className="drawer-list">
            <li>⏱ Wait For Element To Be Present</li>
            <li>⏱ Wait For Element To Be Visible</li>
            <li>⏱ Wait For Element To Be Clickable</li>
            <li>⏱ Wait For Element To Be Enabled</li>
            <li>⏱ Wait For Element To Be Disabled</li>
            <li>📷 Take Screenshot</li>
            <li>🌐 Wait For Network Request</li>
            <li>🍪 Add Cookies</li>
          </ul>
        )}
      </div>
    </div>
  );
}
