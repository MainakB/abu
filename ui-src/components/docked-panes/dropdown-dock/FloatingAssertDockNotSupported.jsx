import React, { useState, useEffect } from "react";
import { ASSERTIONMODES, ASSERTIONNAMES } from "../../../constants/index.js";

function getHeader(modeValue) {
  if (modeValue === ASSERTIONMODES.DROPDOWNCONTAINS) {
    return "Assert Dropdown Contains";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNCOUNT) {
    return "Assert Dropdown Count";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNINALPHABETICORDER) {
    return "Assert Dropdown Order";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT) {
    return "Assert Dropdown Duplicates";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNSELECTED) {
    return "Assert Dropdown Selection";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNVALUESARE) {
    return "Assert Dropdown Values";
  }

  // ASSERTIONMODES.DROPDOWNCOUNTISNOT || ASSERTIONMODES.DROPDOWNNOTSELECTED
}

export default function FloatingAssertDockNotSupported({ el, mode, onCancel }) {
  const [header, setHeader] = useState(() => getHeader(mode));

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{header}</strong>
        </div>
      </div>
      <textarea
        className="assert-dock-textarea"
        value="Non <select> tag dropdown assertion is still not supported in the recorder. Check with the developer for the timeline of this feature release."
        readOnly
      />
      <div className="docked-pane-footer-confirm-cancel">
        <div className="docked-pane-footer-buttons">
          <button
            className="docked-pane-footer-cancel-button"
            onClick={onCancel}
          >
            ❌
          </button>
          {/* <button onClick={onCancel}>✅</button> */}
        </div>
      </div>
    </div>
  );
}
