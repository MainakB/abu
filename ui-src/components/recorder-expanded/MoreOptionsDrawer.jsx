import React, { useState, useEffect } from "react";
import PdfAssertionsList from "./PdfAssertionsList.jsx";
import ElementAssertionsList from "./ElementAssertionsList.jsx";
import DropdownAssertionsList from "./DropdownAssertionsList.jsx";
import NetworkAssertionsList from "./NetworkAssertionsList.jsx";
import GenericAssertionsList from "./GenericAssertionsList.jsx";
import VariableAssignmentList from "./VariableAssignmentList.jsx";
import DBAssignmentList from "./DBAssignmentList.jsx";
import { ASSERTIONMODES } from "../../constants/index.js";
import EmailAssignmentList from "./EmailAssignmentList.jsx";
// import AIAssistedSearch from "./AIAssistedSearch.jsx";

const ALL_OPTIONS = [
  { label: "Assert Element Visible", mode: ASSERTIONMODES.ASSERTVISIBILITY },
  { label: "Assert Element Present", mode: ASSERTIONMODES.ASSERTPRESENCE },
  {
    label: "Assert Attribute Value",
    mode: ASSERTIONMODES.ASSERTATTRIBUTEVALUEEQUALS,
  },
  { label: "Assert Text Equals", mode: ASSERTIONMODES.ASSERTTEXTEQUALS },
  { label: "Add Cookies", mode: ASSERTIONMODES.ADDCOOKIES },
  { label: "Take Screenshot", mode: ASSERTIONMODES.TAKESCREENSHOT },
  { label: "Page Reload", mode: ASSERTIONMODES.PAGERELOAD },
  { label: "API Request", mode: ASSERTIONMODES.HTTP },
  // ...and so on
];

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
      key={label}
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

  const sharedProps = {
    onToggleSection,
    expanded,
    getAssertDock,
  };

  return (
    <div className="drawer">
      <div className="drawer-content">
        <div className="drawer-section">
          {/* <AIAssistedSearch
            options={ALL_OPTIONS}
            onSelect={(mode) => {
              onMenuSelectionLaunchDock(mode); // or onMenuSelection(mode)
            }}
          /> */}
          <div
            className="drawer-title"
            onClick={() => onToggleSection("actions")}
          >
            Actions {expanded.actions ? "▲" : "►"}
          </div>
          {expanded.actions && (
            <ul className="drawer-list">
              {getNonElementDockView(ASSERTIONMODES.HTTP, "📡", "API Request")}
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
        <VariableAssignmentList {...sharedProps} />
        <DBAssignmentList {...sharedProps} />
        <EmailAssignmentList {...sharedProps} />
        <ElementAssertionsList {...sharedProps} />
        <DropdownAssertionsList {...sharedProps} />
        <GenericAssertionsList {...sharedProps} />
        <NetworkAssertionsList {...sharedProps} />
        <PdfAssertionsList {...sharedProps} />
      </div>
    </div>
  );
}
