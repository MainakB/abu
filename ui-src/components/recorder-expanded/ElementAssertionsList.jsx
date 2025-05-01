import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function ElementAssertionsList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const elmentAssertionItems = [
    [ASSERTIONMODES.ATTRIBUTEVALUE, "Assert Attribute Value"],
    [ASSERTIONMODES.PRSENECE, "Assert Element Present"],
    [ASSERTIONMODES.ENABLED, "Assert Element Enabled"],
    [ASSERTIONMODES.RADIOSTATE, "Assert Radio State"],
    [ASSERTIONMODES.CHECKBOXSTATE, "Assert Checkbox State"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("elementAssertions")}
      >
        Element Assertions {expanded.elementAssertions ? "▲" : "►"}
      </div>
      {expanded.elementAssertions && (
        <ul className="drawer-list">
          {elmentAssertionItems.map(([mode, label]) =>
            getAssertDock(mode, label, false)
          )}
        </ul>
      )}
    </div>
  );
}
