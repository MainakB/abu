import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";

export default function PdfAssertionsList({
  onToggleSection,
  expanded,
  getAssertDock,
}) {
  const nonElementBasedPDFAssertionItems = [
    [ASSERTIONMODES.ASSERTTEXTINPDF, "Assert Text Present In PDF"],
    [ASSERTIONMODES.ASSERTPDFCOMPARISON, "Assert Two PDFs Are Equal"],
    [ASSERTIONMODES.ASSERTTEXTIMAGESINPDF, "Compare Text And Images In PDFs"],
    [ASSERTIONMODES.ASSERTCPDPDF, "Compare Two PDFs For CPD From GCP"],
  ];

  return (
    <div className="drawer-section">
      <div
        className="drawer-title"
        onClick={() => onToggleSection("pdfAssertions")}
      >
        PDF Assertions {expanded.pdfAssertions ? "▲" : "►"}
      </div>
      {expanded.pdfAssertions && (
        <ul className="drawer-list">
          {nonElementBasedPDFAssertionItems.map(([mode, label]) =>
            getAssertDock(mode, label, true)
          )}
        </ul>
      )}
    </div>
  );
}
