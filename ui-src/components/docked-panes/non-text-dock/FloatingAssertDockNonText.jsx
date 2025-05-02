import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";

import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

function getOwnText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent.trim())
    .join(" ")
    .trim();
}

function getHeader(type) {
  const base = "Assert Element Is";
  if (type === ASSERTIONMODES.VISIBILITY) return `${base} Visible`;
  if (type === ASSERTIONMODES.ENABLED) return `${base} Enabled`;
  if (type === ASSERTIONMODES.PRSENECE) return `${base} Present`;
}
export default function FloatingAssertDockNonText({
  el,
  mode,
  onConfirm,
  onCancel,
}) {
  const [softAssert, setSoftAssert] = useState(false);
  const [isNegative, setIsNegative] = useState(false);
  const [locatorName, setLocatorName] = useState("");

  useEffect(() => {
    if (!el) return;
  }, [el, mode]);

  const handleCancel = () => {
    setSoftAssert(false);
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(softAssert, isNegative, locatorName, mode);
    setSoftAssert(false);
  };

  return (
    <div
      id="floating-assert-dock-root-container"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{getHeader(mode)}</strong>
        </div>
      </div>
      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        isNegative={isNegative}
        setIsNegative={setIsNegative}
      />
    </div>
  );
}
