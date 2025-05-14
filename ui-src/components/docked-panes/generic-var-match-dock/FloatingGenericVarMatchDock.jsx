import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmGenericVarMatch } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import ExistingVarNamesList from "../variable-name/ExistingVarNamesList.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

const getAltMode = (mode, startsWith, endsWith) => {
  if (endsWith) return ASSERTIONMODES.GENERICVARMATCHENDSWITH;
  if (startsWith) return ASSERTIONMODES.GENERICVARMATCHSTARTSWITH;
  return mode;
};

export default function FloatingGenericVarMatchDock({ onCancel, mode }) {
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [existingVarNames, setExistingVarNames] = useState([]);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [isNegative, setIsNegative] = useState(false);
  const [softAssert, setSoftAssert] = useState(false);
  const [exactMatch, setExactMatch] = useState(true);
  const [startsWith, setStartsWith] = useState(false);
  const [endsWith, setEndsWith] = useState(false);

  useModeSocket(onCancel);

  const handleCancel = () => {
    setSelectedVarIndex(0);
    setExistingVarNames([]);
    setTextAreaValue("");
    setIsNegative(false);
    setSoftAssert(false);
    setExactMatch(true);
    setStartsWith(false);
    setEndsWith(false);
    onCancel();
  };

  const handleConfirm = () => {
    const selectedVarName = existingVarNames[selectedVarIndex];

    const paylaod = {
      varName: selectedVarName,
      expected: textAreaValue,
      mode: getAltMode(mode, startsWith, endsWith),
      softAssert,
      isNegative,
      exactMatch,
      onCancel: handleCancel,
    };
    console.log("paylaod: ", paylaod);
    onConfirmGenericVarMatch(paylaod);
  };

  return (
    <div
      id="floating-tab-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Match And Soft Match</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <ExistingVarNamesList
          selectedVarIndex={selectedVarIndex}
          setSelectedVarIndex={setSelectedVarIndex}
          existingVarNames={existingVarNames}
          setExistingVarNames={setExistingVarNames}
        />

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
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={textAreaValue === ""}
        isNegative={isNegative}
        setIsNegative={setIsNegative}
        exactMatch={exactMatch}
        setExactMatch={setExactMatch}
        startsWith={startsWith}
        setStartsWith={setStartsWith}
        endsWith={endsWith}
        setEndsWith={setEndsWith}
      />
    </div>
  );
}
