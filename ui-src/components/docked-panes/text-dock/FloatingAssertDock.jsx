import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

function getOwnText(el) {
  try {
    if (!el) return "";

    const textValue = [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();

    return textValue || el.innerText?.trim() || "";
  } catch (err) {
    console.warn("getOwnText failed:", err);
    return "";
  }
}

export default function FloatingAssertDock({ el, mode, onConfirm, onCancel }) {
  const [expected, setExpected] = useState(() => {
    if (mode === ASSERTIONMODES.TEXT) return getOwnText(el);
    if (mode === ASSERTIONMODES.VALUE)
      return el?.value || el?.getAttribute("value") || "";
    return "";
  });

  const [softAssert, setSoftAssert] = useState(false);
  const [locatorName, setLocatorName] = useState("");
  const [isNegative, setIsNegative] = useState(false);
  const [exactMatch, setExactMatch] = useState(true);

  const handleCancel = () => {
    setSoftAssert(false);
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(expected, softAssert, locatorName, exactMatch, isNegative);
    setSoftAssert(false);
  };

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>
            Assert that element
            {mode === ASSERTIONMODES.TEXT ? " text" : " value"} equals
            {/* {mode === "text" ? "text equals " : "value equals "} */}
          </strong>
        </div>
      </div>
      <textarea
        className="assert-dock-textarea"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
        placeholder="Enter expected value..."
      />
      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        isNegative={isNegative}
        setIsNegative={setIsNegative}
        exactMatch={exactMatch}
        setExactMatch={setExactMatch}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={expected === ""}
      />
    </div>
  );
}
