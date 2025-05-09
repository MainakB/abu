import React, { useState, useRef, useEffect, useMemo } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmRadioCheckboxAssignment } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

const getLabel = (mode) => {
  if (mode === ASSERTIONMODES.ISCHECKBOXSELECTED) return "Is Checkbox Selected";
  if (mode === ASSERTIONMODES.ISRADIOBUTTONSELECTED)
    return "Is Radio Button Selected";
  return "";
};

export default function FloatingElementCheckboxRadioAssignDock({
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

  const isInvalidTag = useMemo(() => {
    if (!el || !el.tagName) return true;
    return el.tagName.toLowerCase() !== "input";
  }, [el]);

  const handleConfirm = () => {
    if (!varName.trim()) return;

    onConfirmRadioCheckboxAssignment({
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

  return (
    <div
      id={!isInvalidTag ? "assert-dock-textarea" : "floating-cookie-list-dock"}
      // id="floating-assert-dock-root-container"
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
          {isInvalidTag ? (
            <span className="invalid-tag-error">
              * Element is not an input tag. Use get value or attribute instead.
            </span>
          ) : (
            <>
              <label>Variable Name (Required)</label>

              <input
                ref={varNameInputRef}
                type="text"
                className="cookie-input"
                value={varName}
                onChange={(e) => setVarName(e.target.value)}
                placeholder="Enter variable name.."
              />
            </>
          )}
        </div>
      </div>

      <ConfirmCancelFooter
        // locatorName={locatorName}
        // setLocatorName={setLocatorName}
        // isNegative={isNegative}
        // setIsNegative={setIsNegative}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={varName === "" || isInvalidTag}
        {...(!isInvalidTag
          ? { isNegative, setIsNegative, locatorName, setLocatorName }
          : {})}
      />
    </div>
  );
}
