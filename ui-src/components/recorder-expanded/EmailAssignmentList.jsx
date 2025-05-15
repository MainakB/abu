import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function EmailAssignmentList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const elementAssignmentItems = [
    [ASSERTIONMODES.GETEMAIL, "Fetch Email From Server"],
    [ASSERTIONMODES.DELETEEMAIL, "Delete Email(s) In Server"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("emailAssignments")}
      >
        Email Operations {expanded.emailAssignments ? "▲" : "►"}
      </div>
      {expanded.emailAssignments && (
        <ul className="drawer-list">
          {elementAssignmentItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
