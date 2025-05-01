import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function NetworkAssertionsList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const nonElementBasedNetworkAssertionItems = [
    [ASSERTIONMODES.NETPAYLOAD, "Assert Network Payload"],
    [ASSERTIONMODES.NETREQUEST, "Assert Network Request URL"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("networkAssertions")}
      >
        Network Assertions {expanded.networkAssertions ? "▲" : "►"}
      </div>
      {expanded.networkAssertions && (
        <ul className="drawer-list">
          {nonElementBasedNetworkAssertionItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
