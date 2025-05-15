import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function VariableAssignmentList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const elementAssignmentItems = [
    [ASSERTIONMODES.ISENABLED, "Is Element Enabled"],
    [ASSERTIONMODES.ISPRESENT, "Is Element Present"],
    [ASSERTIONMODES.ISELEMENTCLICKABLE, "Is Element Clickable"],
    [ASSERTIONMODES.ISDISPLAYED, "Is Element Displayed"],
    [ASSERTIONMODES.ISCHECKBOXSELECTED, "Is Checkbox Selected"],
    [ASSERTIONMODES.ISRADIOBUTTONSELECTED, "Is Radio Button Selected"],
    [ASSERTIONMODES.GETTEXT, "Get Element's Text"],
    [ASSERTIONMODES.GETVALUE, "Get Element's Value"],
    [ASSERTIONMODES.GETATTRIBUTE, "Get Element's Attribute"],
    [ASSERTIONMODES.ISATTRIBUTEEQUALS, "Get Attribute Equality/Contains"],

    [ASSERTIONMODES.GETDROPDOWNSELECTEDOPTION, "Get Dropdown Selection"],
    // [ASSERTIONMODES.GETDROPDOWNCOUNTWITHTEXT, "Get Dropdown Count With Text"], TO DO
    // [ASSERTIONMODES.GETTOOLTIPTEXT, "Get Tooltip Text"], TO DO
    [ASSERTIONMODES.GETINNERHTML, "Get Element's Inner HTML"],
  ];
  const nonElementAssignmentItems = [
    [ASSERTIONMODES.GETTITLE, "Get Page Title"],
    [ASSERTIONMODES.GENERICVARASSIGN, "Generic Variable Assignment"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("varAssignments")}
      >
        Assign-Match Operations {expanded.varAssignments ? "▲" : "►"}
      </div>
      {expanded.varAssignments && (
        <ul className="drawer-list">
          {elementAssignmentItems.map(([mode, label]) =>
            getAssertDock(mode, label, false)
          )}
          {/* ASSERTIONMODES.HTTP, "📡", "API Request" */}
          {nonElementAssignmentItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
