import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function DataDrivenTests({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const nonElementBasedDataDrivenItems = [
    [ASSERTIONMODES.DATADRIVEN, "Data Driven Test"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("dataDriven")}
      >
        Data Driven Test {expanded.dataDriven ? "▲" : "►"}
      </div>
      {expanded.dataDriven && (
        <ul className="drawer-list">
          {nonElementBasedDataDrivenItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
