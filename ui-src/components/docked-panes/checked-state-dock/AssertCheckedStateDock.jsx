import React, { useState, useEffect } from "react";

export default function AssertCheckedStateDock({
  el,
  //   initialCheckedState = false, // true if checked, false if not
  onConfirm,
  onCancel,
  label, // descriptive label like "Checkbox" or "Radio Button"
}) {
  const [isChecked, setIsChecked] = useState(el.checked);
  const [softAssert, setSoftAssert] = useState(false);

  const handleConfirm = (isSoftAssert, elValue) => {
    onConfirm(
      {
        type: label,
        isChecked,
      },
      softAssert,
      elValue
    );
  };

  if (label.toLowerCase() === "radio" && el.tagName !== "input") {
    const isPrecedingSiblingInput =
      el.previousElementSibling &&
      el.previousElementSibling.tagName &&
      el.previousElementSibling.tagName.toLowerCase() === "input";

    let isNextSiblingInput = false;
    if (!isPrecedingSiblingInput) {
      isNextSiblingInput =
        el.nextElementSibling &&
        el.nextElementSibling.tagName &&
        el.nextElementSibling.tagName.toLowerCase() === "input";
    }

    if (isPrecedingSiblingInput) {
      el = el.previousElementSibling;
    } else if (isNextSiblingInput) {
      el = el.nextElementSibling;
    }
  }

  return (
    <div
      id="floating-assert-attribute-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Assert {label} state</strong>
        </div>

        <div className="assert-attributes-container">
          {el && el.type && el.type === label.toLowerCase() ? (
            <div className="assert-attribute-row">
              <label className="assert-checkbox-container" style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="assert-checked-state"
                  checked={isChecked === true}
                  onChange={() => setIsChecked(true)}
                />
                <span style={{ marginLeft: "6px" }}>Is Checked</span>
              </label>
              <label className="assert-checkbox-container" style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="assert-checked-state"
                  checked={isChecked === false}
                  onChange={() => setIsChecked(false)}
                />
                <span style={{ marginLeft: "6px" }}>Is Not Checked</span>
              </label>
            </div>
          ) : (
            <div className="assert-attribute-row">
              <span>Element trying to assert is not a {label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="docked-pane-footer-confirm-cancel">
        <div className="docked-pane-footer-assert-container">
          <input
            type="checkbox"
            checked={softAssert}
            onChange={() => setSoftAssert((prev) => !prev)}
          />
          <label>Soft Assert</label>
        </div>
        <div className="docked-pane-footer-buttons">
          <button
            className="docked-pane-footer-cancel-button"
            onClick={onCancel}
          >
            ❌
          </button>
          <button
            className="docked-pane-footer-confirm-button"
            onClick={() => {
              handleConfirm(softAssert, el);
              // onConfirm(expected, softAssert);
              setSoftAssert(false);
            }}
            disabled={
              el && el.type && el.type === label.toLowerCase() ? false : true
            }
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
