import React, { useState, useEffect, useRef } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

export default function FloatingAssertPdfCompare({
  mode,
  onConfirm,
  onCancel,
}) {
  const basePdfInputRef = useRef(null);
  const refPdfInputRef = useRef(null);

  const [basePdf, setBasePdf] = useState("");
  const [refPdf, setRefPdf] = useState("");
  const [softAssert, setSoftAssert] = useState(false);

  useEffect(() => {
    if (basePdfInputRef.current) {
      basePdfInputRef.current.focus();
    }
    if (refPdfInputRef.current) {
      refPdfInputRef.current.focus();
    }
  }, []);

  const closeDockReset = () => {
    setBasePdf("");
    setRefPdf("");
  };

  const handleCancel = () => {
    closeDockReset();
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(fileName, expected);
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
          <label>Base PDF Name</label>

          <input
            ref={basePdfInputRef}
            type="text"
            className="cookie-input"
            value={basePdf}
            onChange={(e) => setBasePdf(e.target.value)}
            placeholder="Enter reference PDF name.."
          />
        </div>
        <div className="locator-name-container">
          <label>Reference PDF Name</label>

          <input
            ref={refPdfInputRef}
            type="text"
            className="cookie-input"
            value={refPdf}
            onChange={(e) => setRefPdf(e.target.value)}
            placeholder="Enter reference PDF name.."
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
