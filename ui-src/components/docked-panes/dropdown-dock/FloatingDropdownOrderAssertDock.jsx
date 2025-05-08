import React, { useState, useEffect, useMemo } from "react";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

export default function FloatingDropdownOrderAssertDock({
  el,
  onConfirm,
  onCancel,
}) {
  // const [isChecked, setIsChecked] = useState(el.checked);
  const [isChecked, setIsChecked] = useState(true);
  const [softAssert, setSoftAssert] = useState(false);
  const [locatorName, setLocatorName] = useState("");

  useModeSocket(onCancel);

  useEffect(() => {
    if (el && typeof el.checked === "boolean") {
      setIsChecked(el.checked);
    }
  }, [el]);

  const handleConfirm = () => {
    onConfirm(
      {
        isChecked,
      },
      softAssert,
      el,
      locatorName
    );
    setSoftAssert(false);
  };

  const handleCancel = () => {
    setSoftAssert(false);
    onCancel();
  };

  return (
    <div
      id="floating-assert-attribute-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Assert Dropdown Order</strong>
        </div>

        <div className="assert-attributes-container">
          <div className="assert-attribute-row">
            <label className="assert-checkbox-container" style={{ flex: 1 }}>
              <input
                type="radio"
                name="assert-checked-state"
                checked={isChecked === true}
                onChange={() => setIsChecked(true)}
              />
              <span style={{ marginLeft: "6px" }}>Ascending</span>
            </label>
            <label className="assert-checkbox-container" style={{ flex: 1 }}>
              <input
                type="radio"
                name="assert-checked-state"
                checked={isChecked === false}
                onChange={() => setIsChecked(false)}
              />
              <span style={{ marginLeft: "6px" }}>Descending</span>
            </label>
          </div>
        </div>
      </div>

      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
