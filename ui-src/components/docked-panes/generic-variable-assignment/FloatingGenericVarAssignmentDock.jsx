import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmGenericVarAssignment } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import VarName from "../variable-name/VarName.jsx";
import ExistingVarNamesList from "../variable-name/ExistingVarNamesList.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

export default function FloatingGenericVarAssignmentDock({ onCancel }) {
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [existingVarNames, setExistingVarNames] = useState([]);
  const [isVarReasssign, setIsVarReasssign] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState("");

  useModeSocket(onCancel);

  const handleSetIsVarReasssign = () => {
    const next = !isVarReasssign;
    if (next) {
      setTextAreaValue("");
      setVarName("");
    } else {
      setSelectedVarIndex(0);
      setTextAreaValue("");
    }
    setIsVarReasssign(next);
  };

  const handleCancel = () => {
    setVarName("");
    setVarNameError("");
    setSelectedVarIndex(0);
    setExistingVarNames([]);
    setIsVarReasssign(false);
    setTextAreaValue("");
    onCancel();
  };

  const handleConfirm = () => {
    if (!isVarReasssign && !varName.trim()) return;
    let varNameToUse = varName;
    if (isVarReasssign) {
      const selectedVarName = existingVarNames[selectedVarIndex];
      varNameToUse = selectedVarName;
    }
    const paylaod = {
      varName: varNameToUse,
      value: textAreaValue,
      onCancel: handleCancel,
      isVarReasssign,
    };

    onConfirmGenericVarAssignment(paylaod);
  };

  const getLabel = (reAssign) => {
    return reAssign ? "Reassign To Variable" : "Assign To Variable";
  };

  // let wrapperClassName = "floating-cookie-list-dock";

  return (
    <div
      id="floating-tab-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{getLabel(isVarReasssign)}</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        {isVarReasssign ? (
          <ExistingVarNamesList
            selectedVarIndex={selectedVarIndex}
            setSelectedVarIndex={setSelectedVarIndex}
            existingVarNames={existingVarNames}
            setExistingVarNames={setExistingVarNames}
          />
        ) : (
          <VarName
            varName={varName}
            setVarName={setVarName}
            varNameError={varNameError}
            setVarNameError={setVarNameError}
          />
        )}

        <div className="locator-name-container">
          <label>Assignment Value (Required)</label>
          <textarea
            className="assert-pdf-text-textarea"
            value={textAreaValue}
            onChange={(e) => setTextAreaValue(e.target.value)}
          />
        </div>
      </div>
      <ConfirmCancelFooter
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        isVarReasssign={isVarReasssign}
        setIsVarReasssign={handleSetIsVarReasssign}
        disableAutoFocus={true}
        disabled={
          (!isVarReasssign && (varName === "" || textAreaValue === "")) ||
          (isVarReasssign && textAreaValue === "") ||
          !!varNameError
        }
      />
    </div>
  );
}
