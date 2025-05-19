import React, { useState } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import { floatingHandleHoverConfirm } from "../../../../utils/componentLibs.js";

export default function FloatingMouseHoverDock({ el, e, onCancel, textValue }) {
  const [locatorName, setLocatorName] = useState("");

  useModeSocket(onCancel);

  const handleCancel = () => {
    setLocatorName("");
    onCancel();
  };

  const handleConfirm = () => {
    floatingHandleHoverConfirm({
      locatorName,
      closeDock: handleCancel,
      textValue,
      el,
      e,
    });
  };

  return (
    <div
      id="floating-assert-dock-root-container"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Mouse Hover</strong>
        </div>
      </div>
      <textarea className="assert-dock-textarea" value={textValue} readOnly />
      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
