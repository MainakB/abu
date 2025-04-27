import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

function getCurrentUrl() {
  try {
    return window.__pageUrl();
  } catch (err) {
    console.warn("getCurrentUrl failed:", err);
    return "";
  }
}

export default function CurrentUrlAssertDock({
  el,
  mode,
  onConfirm,
  onCancel,
}) {
  const [expected, setExpected] = useState(() => getCurrentUrl());
  const [isNegative, setIsNegative] = useState(false);
  const [softAssert, setSoftAssert] = useState(false);
  const [exactMatch, setExactMatch] = useState(true);

  const closeDockReset = () => {
    setSoftAssert(false);
    setIsNegative(false);
  };

  const handleCancel = () => {
    closeDockReset();
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(expected, softAssert);
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
          <strong>Assert Current URL</strong>
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
