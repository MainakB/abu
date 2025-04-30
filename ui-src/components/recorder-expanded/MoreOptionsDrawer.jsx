import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function MoreOptionsDrawer({
  isOpen,
  onClose,
  expanded, // This will now be controlled by the parent
  onToggleSection,
  onMenuSelection,
  getClassName,
  currentMode,
  onMenuSelectionLaunchDock,
  onMenuSelectionMonoStep,
}) {
  if (!isOpen) return null;

  const getNonElementDockView = (modeVal, icon, label) => (
    <li
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handler()}
      className={getClassName(currentMode, modeVal)}
      onClick={async () => onMenuSelectionLaunchDock(modeVal)}
    >
      <span className="icon">{icon}</span> {label}
    </li>
  );

  const getNonElementMonoStep = (modeVal, icon, label) => (
    <li
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handler()}
      className={getClassName(currentMode, modeVal)}
      onClick={async () => onMenuSelectionMonoStep(modeVal)}
    >
      <span className="icon">{icon}</span> {label}
    </li>
  );

  const getAssertDock = (modeVal, label, useLaunch = false) => (
    <li
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handler()}
      className={getClassName(currentMode, modeVal)}
      onClick={() =>
        useLaunch
          ? onMenuSelectionLaunchDock(modeVal)
          : onMenuSelection(modeVal)
      }
    >
      ✓ {label}
    </li>
  );

  const elementBasedAssertionItems = [
    [ASSERTIONMODES.ATTRIBUTEVALUE, "Assert Attribute Value"],
    [ASSERTIONMODES.NETPAYLOAD, "Assert Network Payload"],
    [ASSERTIONMODES.NETREQUEST, "Assert Network Request URL"],
    [ASSERTIONMODES.PRSENECE, "Assert Element Present"],
    [ASSERTIONMODES.ENABLED, "Assert Element Enabled"],

    [ASSERTIONMODES.RADIOSTATE, "Assert Radio State"],
    [ASSERTIONMODES.CHECKBOXSTATE, "Assert Checkbox State"],
    [ASSERTIONMODES.DROPDOWNSELECTED, "Assert Dropdown Selected"],
    [ASSERTIONMODES.DROPDOWNCOUNTIS, "Assert Dropdown Count"],
    [ASSERTIONMODES.DROPDOWNCONTAINS, "Assert Dropdown Contains"],
    [ASSERTIONMODES.DROPDOWNVALUESARE, "Assert Dropdown Values"],
    [ASSERTIONMODES.DROPDOWNINALPHABETICORDER, "Assert Dropdown Ordering"],
    [ASSERTIONMODES.DROPDOWNDUPLICATECOUNT, "Assert Dropdown Duplicate Count"],
  ];

  const nonElementBasedAssertionItems = [
    [ASSERTIONMODES.ASSERTCOOKIEVALUE, "Assert Cookie Value"],
    [ASSERTIONMODES.ASSERTCURRENTURL, "Assert Current Url"],
    [ASSERTIONMODES.ASSERTTEXTINPAGESOURCE, "Assert Text In Page Source"],
    //
    [ASSERTIONMODES.ASSERTTEXTINPDF, "Assert Text Present In PDF"],
    [ASSERTIONMODES.ASSERTPDFCOMPARISON, "Assert Two PDFs Are Equal"],
    [ASSERTIONMODES.ASSERTTEXTIMAGESINPDF, "Compare Text And Images In PDFs"],
    [ASSERTIONMODES.ASSERTCPDPDF, "Compare Two PDFs For CPD From GCP"],
  ];

  return (
    <div className="drawer">
      <div className="drawer-content">
        <div className="drawer-section">
          <div
            className="drawer-title"
            onClick={() => onToggleSection("assertions")}
          >
            Assertions {expanded.assertions ? "▲" : "▼"}
          </div>
          {expanded.assertions && (
            <ul className="drawer-list">
              {elementBasedAssertionItems.map(([mode, label]) =>
                getAssertDock(mode, label)
              )}
              {/* <li className="drawer-divider" /> */}
              {nonElementBasedAssertionItems.map(([mode, label]) =>
                getAssertDock(mode, label, true)
              )}
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
              {getNonElementDockView(
                ASSERTIONMODES.ADDREUSESTEP,
                "♻️",
                "Add Reuse Step"
              )}
              {getNonElementMonoStep(
                ASSERTIONMODES.PAGERELOAD,
                "🔄",
                "Page Reload"
              )}
              {getNonElementDockView(
                ASSERTIONMODES.ADDCOOKIES,
                "🍪",
                "Add Cookies"
              )}
              {getNonElementDockView(
                ASSERTIONMODES.DELETECOOKIES,
                "🗑️",
                "Delete Cookies"
              )}
              {getNonElementMonoStep(
                ASSERTIONMODES.TAKESCREENSHOT,
                "📷",
                "Take Screenshot"
              )}

              <li>
                <span className="icon">⏱</span> Wait For Element To Be Present
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
