import React, { useState, useEffect, useRef } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

export default function FloatingAssertTextInPdf({ onConfirm, onCancel }) {
  const inputRef = useRef(null);
  const textBoxRef = useRef(null);

  const [basePdf, setBasePdf] = useState("");
  const [expected, setExpected] = useState("");
  const [softAssert, setSoftAssert] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (textBoxRef.current) {
      textBoxRef.current.focus();
    }
  }, []);

  const closeDockReset = () => {
    setBasePdf("");
    setExpected("");
  };

  const handleCancel = () => {
    closeDockReset();
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(basePdf, expected, softAssert);
    closeDockReset();
  };

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Assert Text Present In PDF</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <div className="locator-name-container">
          <label>Reference PDF Name</label>
          <input
            ref={inputRef}
            type="text"
            className="cookie-input"
            // "reuse-input"
            value={basePdf}
            onChange={(e) => setBasePdf(e.target.value)}
            placeholder="Enter reference PDF name.."
          />
        </div>
        <div className="locator-name-container">
          <label>Text To Assert</label>
          <textarea
            ref={textBoxRef}
            className="assert-pdf-text-textarea"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            placeholder="Enter text value..."
          />
        </div>
      </div>
      <ConfirmCancelFooter
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={basePdf === "" || expected === ""}
      />
    </div>
  );
}
