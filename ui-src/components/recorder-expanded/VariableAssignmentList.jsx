import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function VariableAssignmentList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const elementAssignmentItems = [
    [ASSERTIONMODES.GETTEXT, "Get Element's Text"],
    [ASSERTIONMODES.GETINNERHTML, "Get Element's Inner HTML"],
    [ASSERTIONMODES.GETVALUE, "Get Element's Value"],
    [ASSERTIONMODES.GETATTRIBUTE, "Get Element's Attribute"],
    [ASSERTIONMODES.GETTOOLTIPTEXT, "Get Tooltip Text"],
    [ASSERTIONMODES.ISCHECKBOXSELECTED, "Is Checkbox Selected"],
    [ASSERTIONMODES.GETDROPDOWNSELECTEDOPTION, "Get Dropdown Selection"],
    [ASSERTIONMODES.GETDROPDOWNCOUNTWITHTEXT, "Get Dropdown Count With Text"],
    // [ASSERTIONMODES.GETDROPDOWNCOUNTWITHSUBTEXT, "Assert Text In Page Source"],
    [ASSERTIONMODES.ATTRIBUTEEQUALS, "Get Attribute Equality/Contains"],
    [ASSERTIONMODES.ISENABLED, "Is Element Enabled"],
    [ASSERTIONMODES.ISPRESENT, "Is Element Present"],
    [ASSERTIONMODES.ISELEMENTCLICKABLE, "Is Element Clickable"],
    [ASSERTIONMODES.ISDISPLAYED, "Is Element Displayed"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("varAssignments")}
      >
        Assignment Operations {expanded.varAssignments ? "▲" : "►"}
      </div>
      {expanded.varAssignments && (
        <ul className="drawer-list">
          {elementAssignmentItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
