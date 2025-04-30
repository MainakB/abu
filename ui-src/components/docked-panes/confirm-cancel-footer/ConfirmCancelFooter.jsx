import React, { useEffect } from "react";
import LocatorName from "../locator-name/LocatorName.jsx";

export default function ConfirmCancelFooter({
  locatorName,
  setLocatorName,
  softAssert,
  setSoftAssert,
  onCancel,
  onConfirm,
  isNegative,
  setIsNegative,
  disabled,
  exactMatch,
  setExactMatch,
}) {
  const updateLocatorName = (e) => {
    setLocatorName(e.target.value);
  };

  return (
    <div>
      {typeof locatorName !== "undefined" &&
        typeof setLocatorName !== "undefined" && (
          <div className="docked-pane-locator-container">
            <LocatorName
              locatorName={locatorName}
              setLocatorName={setLocatorName}
            />
          </div>
        )}
      <div className="docked-pane-footer-confirm-cancel">
        {typeof isNegative !== "undefined" &&
          typeof setIsNegative !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="inverse-checkbox"
                type="checkbox"
                checked={isNegative}
                onChange={() => setIsNegative((prev) => !prev)}
              ></input>
              <label htmlFor="inverse-checkbox">Inverse</label>
            </div>
          )}
        {typeof exactMatch !== "undefined" &&
          typeof setExactMatch !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="exactMatch-checkbox"
                type="checkbox"
                checked={exactMatch}
                onChange={() => setExactMatch((prev) => !prev)}
              ></input>
              <label htmlFor="exactMatch-checkbox">Exact</label>
            </div>
          )}
        {typeof softAssert !== "undefined" &&
          typeof setSoftAssert !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="softassert-checkbox"
                type="checkbox"
                checked={softAssert}
                onChange={() => setSoftAssert((prev) => !prev)}
              ></input>
              <label htmlFor="softassert-checkbox">Soft Assert</label>
            </div>
          )}

        <div className="docked-pane-footer-buttons">
          <button
            className="docked-pane-footer-cancel-button"
            onClick={onCancel}
          >
            ❌
          </button>

          <button
            className="docked-pane-footer-confirm-button"
            onClick={onConfirm}
            disabled={disabled}
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
