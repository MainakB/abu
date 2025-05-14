import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function GenericAssertionsList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const genericAssertionItems = [
    [ASSERTIONMODES.GENERICVARMATCHEQUALS, "Generic Match"],
    [ASSERTIONMODES.ASSERTCOOKIEVALUEEQUALS, "Assert Cookie Value"],
    [ASSERTIONMODES.ASSERTCURRENTURLEQUALS, "Assert Current Url"],
    [ASSERTIONMODES.ASSERTTEXTINPAGESOURCEEQUALS, "Assert Text In Page Source"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("genericAssertions")}
      >
        More Assertions {expanded.genericAssertions ? "▲" : "►"}
      </div>
      {expanded.genericAssertions && (
        <ul className="drawer-list">
          {genericAssertionItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
