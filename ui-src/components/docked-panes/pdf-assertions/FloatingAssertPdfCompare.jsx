import React, { useState, useEffect, useRef } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

export default function FloatingAssertPdfCompare({
  type,
  onConfirm,
  onCancel,
}) {
  const basePdfInputRef = useRef(null);
  const refPdfInputRef = useRef(null);
  const refPdfPageInputRef = useRef(null);

  const [basePdf, setBasePdf] = useState("");
  const [refPdf, setRefPdf] = useState("");
  const [pageRange, setPageRange] = useState("");
  const [softAssert, setSoftAssert] = useState(false);

  useEffect(() => {
    if (basePdfInputRef.current) {
      basePdfInputRef.current.focus();
    }
    if (refPdfInputRef.current) {
      refPdfInputRef.current.focus();
    }
    if (refPdfPageInputRef.current) {
      refPdfPageInputRef.current.focus();
    }
  }, []);

  const closeDockReset = () => {
    setBasePdf("");
    setRefPdf("");
    setPageRange("");
  };

  const handleCancel = () => {
    closeDockReset();
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(basePdf, refPdf, pageRange, softAssert, type);
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
          <label>Base PDF Name (Required)</label>

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
          <label>Reference PDF Name (Required)</label>

          <input
            ref={refPdfInputRef}
            type="text"
            className="cookie-input"
            value={refPdf}
            onChange={(e) => setRefPdf(e.target.value)}
            placeholder="Enter reference PDF name.."
          />
        </div>
        <div className="locator-name-container">
          <label>Page Range To Compare (Optional)</label>

          <input
            ref={refPdfPageInputRef}
            type="text"
            className="cookie-input"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="Comma separated page numbers..."
          />
        </div>
      </div>
      <ConfirmCancelFooter
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={basePdf === "" || refPdf === ""}
      />
    </div>
  );
}
