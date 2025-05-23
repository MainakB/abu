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
  addResponseAssertion,
  enableAddResponseAssertion,
  disableAddResponseAssertion,
  handleSetAddResponseAssertion,
  isVarReasssign,
  setIsVarReasssign,
  deleteAllEmails,
  setDeleteAllEmails,
  addDbAssertion,
  enableAddDbAssertion,
  disableAddDbAssertion,
  handleSetAddDbAssertion,
  isSpaced,
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

  const classNameValue = isSpaced
    ? "docked-pane-footer-confirm-cancel-spaced"
    : "docked-pane-footer-confirm-cancel";

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
      <div className={classNameValue}>
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

        {typeof addResponseAssertion !== "undefined" &&
          typeof handleSetAddResponseAssertion !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="respassert-checkbox"
                type="checkbox"
                checked={addResponseAssertion}
                onChange={handleSetAddResponseAssertion}
                disabled={
                  !enableAddResponseAssertion || disableAddResponseAssertion
                }
              ></input>
              <label htmlFor="respassert-checkbox">
                Add Response Assertions
                <span
                  className="info-tooltip-icon"
                  title="Fires the API request and fetches response data for assertions"
                >
                  ⓘ
                </span>
              </label>
            </div>
          )}

        {typeof addDbAssertion !== "undefined" &&
          typeof handleSetAddDbAssertion !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="respassert-checkbox"
                type="checkbox"
                checked={addDbAssertion}
                onChange={handleSetAddDbAssertion}
                disabled={!enableAddDbAssertion || disableAddDbAssertion}
              ></input>
              <label htmlFor="respassert-checkbox">
                Add DB Assertions
                <span
                  className="info-tooltip-icon"
                  title="Fires the API request and fetches response data for assertions"
                >
                  ⓘ
                </span>
              </label>
            </div>
          )}

        {typeof isVarReasssign !== "undefined" &&
          typeof setIsVarReasssign !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="varreassign-checkbox"
                type="checkbox"
                checked={isVarReasssign}
                // onChange={() => setIsVarReasssign((prev) => !prev)}
                onChange={setIsVarReasssign}
              ></input>
              <label htmlFor="varreassign-checkbox">
                Reassign an existing variable
                <span
                  className="info-tooltip-icon"
                  title="Reassign some value to an existing variable"
                >
                  ⓘ
                </span>
              </label>
            </div>
          )}

        {typeof deleteAllEmails !== "undefined" &&
          typeof setDeleteAllEmails !== "undefined" && (
            <div className="docked-pane-footer-assert-container">
              <input
                id="dlt-emails-checkbox"
                type="checkbox"
                checked={deleteAllEmails}
                onChange={() => setDeleteAllEmails((prev) => !prev)}
              ></input>
              <label htmlFor="dlt-emails-checkbox">Delete All Emails</label>
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
