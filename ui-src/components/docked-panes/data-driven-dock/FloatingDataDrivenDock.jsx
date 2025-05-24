import React, { useState, useEffect, useRef } from "react";
import VarName from "../variable-name/VarName.jsx";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import { recordDataDrivenStep } from "../../../../utils/componentLibs.js";

export default function FloatingDataDrivenDock({ mode, onCancel }) {
  const [fileName, setFileName] = useState("");
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");

  useModeSocket(onCancel);

  const closeDockReset = () => {
    setFileName("");
    setVarName("");
    setVarNameError("");
  };

  const handleCancel = () => {
    closeDockReset();
    onCancel();
  };

  const handleConfirm = async () => {
    await recordDataDrivenStep({
      varName,
      fileName,
      onCancel: handleCancel,
    });
  };

  return (
    <div
      // id="floating-assert-dock-root-container"
      id="floating-tab-list-dock-justifyend"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Upload File For Data Driven Test</strong>
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
          <label>
            File Path
            <span
              className="info-tooltip-icon"
              title="File path is only the path to the file from inside your environment in data folder. Do not use full file path. For example if file is in src/data/dev/somefolder/testdata.json, file path will be somefolder/testdata.json"
            >
              ⓘ
            </span>
          </label>
          <input
            type="text"
            className="cookie-input"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file path..."
          />
        </div>
      </div>
      <ConfirmCancelFooter
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={
          varName.trim() === "" || !!varNameError || fileName.trim() === ""
        }
      />
    </div>
  );
}
