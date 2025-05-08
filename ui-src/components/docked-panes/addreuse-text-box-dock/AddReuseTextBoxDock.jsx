import React, { useState, useEffect, useRef } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

export default function AddReuseTextBoxDock({ onConfirm, onCancel }) {
  const inputRef = useRef(null);
  const textBoxRef = useRef(null);

  useModeSocket(onCancel);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (textBoxRef.current) {
      textBoxRef.current.focus();
    }
  }, []);

  const [expected, setExpected] = useState("");
  const [fileName, setFileName] = useState("");

  const closeDockReset = () => {
    setExpected("");
    setFileName("");
  };

  const handleCancel = () => {
    closeDockReset();
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(fileName, expected);
    closeDockReset();
  };

  const updateReuseFileName = (e) => {
    setFileName(e.target.value);
  };

  return (
    <div
      // id="floating-assert-dock-root"
      id="floating-cookie-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Add Reuse Step</strong>
        </div>
      </div>
      <div className="reuse-step-container">
        <div className="reuse-step-wrapper">
          <span className="reuse-label">Use</span>

          <input
            ref={inputRef}
            type="text"
            className="cookie-input"
            value={fileName}
            onChange={updateReuseFileName}
            placeholder="Enter reuse file name or path.."
          />
        </div>
        <textarea
          ref={textBoxRef}
          className="assert-dock-textarea"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder="Enter optional parameter values..."
        />
      </div>

      <ConfirmCancelFooter
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={fileName === ""}
      />
    </div>
  );
}
