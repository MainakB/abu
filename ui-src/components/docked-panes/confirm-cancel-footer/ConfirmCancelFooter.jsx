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
  disableAutoFocus,
  startsWith,
  setStartsWith,
  endsWith,
  setEndsWith,
}) {
  const updateLocatorName = (e) => {
    setLocatorName(e.target.value);
  };

  const handleSetStartsWith = (e) => {
    if (setEndsWith) {
      setEndsWith(false);
    }
    if (setExactMatch) {
      setExactMatch(true);
    }
    setStartsWith((prev) => !prev);
  };

  const handleSetEndsWith = (e) => {
    if (setStartsWith) {
      setStartsWith(false);
    }
    if (setExactMatch) {
      setExactMatch(true);
    }
    setEndsWith((prev) => !prev);
  };

  const handleSetExactMatch = (e) => {
    if (setStartsWith) {
      setStartsWith(false);
    }
    if (setEndsWith) {
      setEndsWith(false);
    }
    setExactMatch((prev) => !prev);
  };

  return (
    <div>
      {typeof locatorName !== "undefined" &&
        typeof setLocatorName !== "undefined" && (
          <div className="docked-pane-locator-container">
            <LocatorName
              locatorName={locatorName}
              setLocatorName={setLocatorName}
              disableAutoFocus={disableAutoFocus || false}
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
              <label htmlFor="inverse-checkbox">
                Inverse
                <span
                  className="info-tooltip-icon"
                  title="Negates the action with a NOT"
                >
                  ⓘ
                </span>
              </label>
            </div>
          )}
        {typeof exactMatch !== "undefined" &&
          typeof setExactMatch !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="exactMatch-checkbox"
                type="checkbox"
                checked={exactMatch}
                onChange={handleSetExactMatch}
                // onChange={() => setExactMatch((prev) => !prev)}
              ></input>
              <label htmlFor="exactMatch-checkbox">
                Exact
                <span
                  className="info-tooltip-icon"
                  title="Exact or Substring match"
                >
                  ⓘ
                </span>
              </label>
            </div>
          )}

        {typeof startsWith !== "undefined" &&
          typeof setStartsWith !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="startswith-checkbox"
                type="checkbox"
                checked={startsWith}
                onChange={handleSetStartsWith}
                // onChange={() => setStartsWith((prev) => !prev)}
              ></input>
              <label htmlFor="startswith-checkbox">Starts With</label>
            </div>
          )}

        {typeof endsWith !== "undefined" &&
          typeof setEndsWith !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="endswith-checkbox"
                type="checkbox"
                checked={endsWith}
                onChange={handleSetEndsWith}
                // onChange={() => setEndsWith((prev) => !prev)}
              ></input>
              <label htmlFor="endswith-checkbox">Ends With</label>
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
