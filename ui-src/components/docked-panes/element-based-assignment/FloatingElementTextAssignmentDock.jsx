import React, { useState, useRef, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmTextValAssignment } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

const shouldDisplayTextArea = (mode) => {
  if (
    mode === ASSERTIONMODES.ISENABLED ||
    mode === ASSERTIONMODES.ISPRESENT ||
    mode === ASSERTIONMODES.ISELEMENTCLICKABLE ||
    mode === ASSERTIONMODES.ISDISPLAYED
  ) {
    return false;
  }
  return true;
};

const getLabel = (mode) => {
  if (mode === ASSERTIONMODES.ISENABLED) return "Is Element Enabled";
  if (mode === ASSERTIONMODES.ISPRESENT) return "Is Element Present";
  if (mode === ASSERTIONMODES.ISELEMENTCLICKABLE) return "Is Element Clickable";
  if (mode === ASSERTIONMODES.ISDISPLAYED) return "Is Element Displayed";
  if (mode === ASSERTIONMODES.GETTEXT) return "Get Element Text";
  if (mode === ASSERTIONMODES.GETVALUE) return "Get Element Value";
  if (mode === ASSERTIONMODES.GETINNERHTML) return "Get Inner HTML";
  return "";
};

const getTextAreaData = (el, mode, textvalue) => {
  if (shouldDisplayTextArea(mode) || mode === ASSERTIONMODES.GETINNERHTML)
    return el.innerHTML?.trim() || el.outerHTML?.trim() || "";
  return textvalue;
};

export default function FloatingElementTextAssignmentDock({
  el,
  e,
  textValue,
  mode,
  onCancel,
}) {
  const varNameInputRef = useRef(null);
  const [locatorName, setLocatorName] = useState("");
  const [varName, setVarName] = useState("");
  const [isNegative, setIsNegative] = useState(false);

  useModeSocket(onCancel);

  useEffect(() => {
    if (varNameInputRef.current) {
      varNameInputRef.current.focus();
    }
  }, []);

  const handleCancel = () => {
    onCancel();
  };

  const handleConfirm = () => {
    if (!varName.trim()) return;
    onConfirmTextValAssignment({
      varName,
      locatorName,
      onCancel,
      el,
      e,
      textValue,
      mode,
      isNegative,
    });
  };

  const textAreaContent = getTextAreaData(el, mode, textValue).trim();

  return (
    <div
      id={
        mode === ASSERTIONMODES.ISPRESENT ||
        mode === ASSERTIONMODES.ISDISPLAYED ||
        mode === ASSERTIONMODES.ISELEMENTCLICKABLE ||
        mode === ASSERTIONMODES.ISENABLED
          ? "assert-dock-textarea"
          : "floating-cookie-list-dock"
      }
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{getLabel(mode)}</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <div className="locator-name-container">
          <label>Variable Name (Required)</label>

          <input
            ref={varNameInputRef}
            type="text"
            className="cookie-input"
            value={varName}
            onChange={(e) => setVarName(e.target.value)}
            placeholder="Enter variable name.."
          />
        </div>
        {textAreaContent !== "" && (
          <div className="locator-name-container">
            <label>Text Value Retrieved (Read Only)</label>
            <textarea
              className="assert-pdf-text-textarea"
              value={textAreaContent}
              readOnly={true}
              disabled={true}
            />
          </div>
        )}
      </div>
      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={varName === ""}
        {...(mode === ASSERTIONMODES.ISPRESENT ||
        mode === ASSERTIONMODES.ISDISPLAYED ||
        mode === ASSERTIONMODES.ISELEMENTCLICKABLE ||
        mode === ASSERTIONMODES.ISENABLED
          ? { isNegative, setIsNegative }
          : {})}
      />
    </div>
  );
}
