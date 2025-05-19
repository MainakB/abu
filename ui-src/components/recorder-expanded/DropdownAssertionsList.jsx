import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function DropdownAssertionsList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const dropdownAssertionItems = [
    [ASSERTIONMODES.DROPDOWNSELECTED, "Assert Dropdown Selected"],
    [ASSERTIONMODES.DROPDOWNCOUNTIS, "Assert Dropdown Count"],
    [ASSERTIONMODES.DROPDOWNCONTAINS, "Assert Dropdown Contains"],
    [
      ASSERTIONMODES.DROPDOWNOPTIONSBYPARTIALTEXT,
      "Assert Dropdown Contains By Partial Text",
    ],
    [ASSERTIONMODES.DROPDOWNVALUESARE, "Assert Dropdown Values"],
    [ASSERTIONMODES.DROPDOWNINALPHABETICORDER, "Assert Dropdown Ordering"],
    [ASSERTIONMODES.DROPDOWNDUPLICATECOUNT, "Assert Dropdown Duplicate Count"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("dropdownAssertions")}
      >
        Dropdown Assertions {expanded.dropdownAssertions ? "▲" : "►"}
      </div>
      {expanded.dropdownAssertions && (
        <ul className="drawer-list">
          {dropdownAssertionItems.map(([mode, label]) =>
            getAssertDock(mode, label, false)
          )}
        </ul>
      )}
    </div>
  );
}
