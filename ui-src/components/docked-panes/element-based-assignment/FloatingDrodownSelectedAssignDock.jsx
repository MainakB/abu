import React, { useState, useEffect } from "react";
import { ASSERTIONMODES, ASSERTIONNAMES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import { onConfirmGetDropdownOptionSelected } from "../../../../utils/componentLibs.js";
import VarName from "../variable-name/VarName.jsx";

function getDropdownSelected(el) {
  try {
    const selectedOption = Array.from(el?.childNodes || []).find(
      (v) =>
        v.tagName &&
        v.tagName.toLowerCase() === "option" &&
        v.selected &&
        v.textContent
    );
    return selectedOption?.textContent.trim() || "";
  } catch (err) {
    console.warn("getDropdownSelected failed", err);
    return "";
  }
}

export default function FloatingDropdownAssertDock({
  el,
  mode,
  onCancel,
  e,
  textValue,
}) {
  const [header, setHeader] = useState("Get Selected Dropdown Option");
  const [expected, setExpected] = useState(() => {
    return getDropdownSelected(el);
  });

  const [locatorName, setLocatorName] = useState("");
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");

  useModeSocket(onCancel);

  const handleConfirm = () => {
    onConfirmGetDropdownOptionSelected({
      varName,
      locatorName,
      onCancel,
      el,
      e,
      textValue,
      mode,
    });
  };

  return (
    <div
      id="floating-cookie-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{header}</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <VarName
          varName={varName}
          setVarName={setVarName}
          varNameError={varNameError}
          setVarNameError={setVarNameError}
        />
        <div className="locator-name-container">
          <label>Text Value Retrieved (Read Only)</label>
          <textarea
            className="assert-dock-textarea"
            value={expected}
            readOnly
            disabled
          />
        </div>
      </div>

      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        onCancel={onCancel}
        onConfirm={handleConfirm}
        disabled={varName.trim() === "" || !!varNameError}
      />
    </div>
  );
}
