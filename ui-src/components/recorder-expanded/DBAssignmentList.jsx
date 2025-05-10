import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function VariableAssignmentList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const elementAssignmentItems = [
    [ASSERTIONMODES.GETDBVALUE, "Fetch Data From Database"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("dbAssignments")}
      >
        DB Operations {expanded.dbAssignments ? "▲" : "►"}
      </div>
      {expanded.dbAssignments && (
        <ul className="drawer-list">
          {elementAssignmentItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
