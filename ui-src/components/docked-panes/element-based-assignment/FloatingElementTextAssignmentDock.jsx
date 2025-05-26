import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmTextValAssignment } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import VarName from "../variable-name/VarName.jsx";
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

const getTextValue = (mode, el, textVal) => {
  if (mode === ASSERTIONMODES.GETVALUE) {
    const valAtr = el.getAttribute("value");
    if (valAtr && typeof valAtr === "string" && valAtr.trim() !== "") {
      return valAtr;
    }
  }

  return textVal;
};

export default function FloatingElementTextAssignmentDock({
  el,
  e,
  textValue,
  mode,
  onCancel,
  tabbed,
  overrideConfirmCancelFlexEnd,
}) {
  const [locatorName, setLocatorName] = useState("");
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");
  const [isNegative, setIsNegative] = useState(false);
  const textAreaValue = getTextValue(mode, el, textValue);

  useModeSocket(onCancel);

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
      textAreaValue,
      mode,
      isNegative,
    });
  };

  let wrapperClassName = "floating-cookie-list-dock";
  if (tabbed) {
    if (
      overrideConfirmCancelFlexEnd &&
      !(
        mode === ASSERTIONMODES.ISPRESENT ||
        mode === ASSERTIONMODES.ISDISPLAYED ||
        mode === ASSERTIONMODES.ISELEMENTCLICKABLE ||
        mode === ASSERTIONMODES.ISENABLED
      )
    ) {
      wrapperClassName = "floating-tab-list-dock-justifyend";
    } else {
      wrapperClassName = "floating-tab-list-dock";
    }
  }

  return (
    <div
      // id={tabbed ? "floating-tab-list-dock" : "floating-cookie-list-dock"}
      id={wrapperClassName}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{getLabel(mode)}</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <VarName
          varName={varName}
          setVarName={setVarName}
          varNameError={varNameError}
          setVarNameError={setVarNameError}
        />
        {textAreaValue !== "" && (
          <div className="locator-name-container">
            <label>Text Value Retrieved (Read Only)</label>
            <textarea
              className="assert-pdf-text-textarea"
              value={textAreaValue}
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
        disabled={varName === "" || !!varNameError}
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
