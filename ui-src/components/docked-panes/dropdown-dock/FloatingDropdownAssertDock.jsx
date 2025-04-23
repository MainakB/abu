import React, { useState, useEffect } from "react";
import { ASSERTIONMODES, ASSERTIONNAMES } from "../../../constants/index.js";

function getDropdownCount(el) {
  try {
    return (
      Array.from(el?.childNodes || []).filter(
        (v) =>
          v.tagName &&
          v.tagName.toLowerCase() === "option" &&
          v.textContent &&
          !v.disabled
      ).length || 0
    );
  } catch (err) {
    console.warn("getDropdownCount failed", err);
    return 0;
  }
}

function isAllNumeric(arr) {
  return arr.every((val) => !isNaN(Number(val)));
}

function getDropdownOrder(el, sort) {
  try {
    const result = Array.from(el?.childNodes || [])
      .filter(
        (v) =>
          v.tagName &&
          v.tagName.toLowerCase() === "option" &&
          v.textContent &&
          !v.disabled
      )
      .map((v) => v.textContent.trim());

    if (sort) {
      if (isAllNumeric(result)) {
        return result.sort((a, b) => Number(a) - Number(b));
      } else {
        return result.sort((a, b) => a.localeCompare(b));
      }
    } else {
      return result;
    }
  } catch (err) {
    console.warn("getDropdownOrder failed", err);
    return [];
  }
}

function getDropdownSelected(el) {
  try {
    const selectedOption = Array.from(el?.childNodes || []).find(
      (v) =>
        v.tagName &&
        v.tagName.toLowerCase() === "option" &&
        v.selected &&
        v.textContent
    );
    return selectedOption?.textContent.trim() || "";
  } catch (err) {
    console.warn("getDropdownSelected failed", err);
    return "";
  }
}

function getHeader(modeValue) {
  if (modeValue === ASSERTIONMODES.DROPDOWNCONTAINS) {
    return "Assert Dropdown Contains";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNCOUNTIS) {
    return "Assert Dropdown Count";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNINALPHABETICORDER) {
    return "Assert Dropdown Order";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT) {
    return "Assert Dropdown Duplicates Count";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNSELECTED) {
    return "Assert Dropdown Selection";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNVALUESARE) {
    return "Assert Dropdown Values";
  }

  // ASSERTIONMODES.DROPDOWNCOUNTISNOT || ASSERTIONMODES.DROPDOWNNOTSELECTED
}

function getAssertionName(modeValue) {
  if (modeValue === ASSERTIONMODES.DROPDOWNCONTAINS) {
    return ASSERTIONNAMES.DROPDOWNCONTAINS;
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNCOUNT) {
    return ASSERTIONNAMES.DROPDOWNCOUNT;
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNINALPHABETICORDER) {
    return ASSERTIONNAMES.DROPDOWNINALPHABETICORDER;
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT) {
    return ASSERTIONNAMES.DROPDOWNDUPLICATECOUNT;
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNSELECTED) {
    return ASSERTIONNAMES.DROPDOWNSELECTED;
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNVALUESARE) {
    return ASSERTIONNAMES.DROPDOWNVALUESARE;
  }

  // ASSERTIONMODES.DROPDOWNCOUNTISNOT || ASSERTIONMODES.DROPDOWNNOTSELECTED
}

export default function FloatingDropdownAssertDock({
  el,
  mode,
  onConfirm,
  onCancel,
}) {
  const [header, setHeader] = useState(() => getHeader(mode));
  const [assertName, setAssertName] = useState(() => getAssertionName(mode));
  const [expected, setExpected] = useState(() => {
    if (
      mode === ASSERTIONMODES.DROPDOWNCOUNTIS ||
      mode === ASSERTIONMODES.DROPDOWNCOUNTISNOT
    )
      return getDropdownCount(el);
    if (mode === ASSERTIONMODES.DROPDOWNCONTAINS) return "";
    if (
      mode === ASSERTIONMODES.DROPDOWNINALPHABETICORDER ||
      mode === ASSERTIONMODES.DROPDOWNVALUESARE
    )
      return getDropdownOrder(
        el,
        mode === ASSERTIONMODES.DROPDOWNINALPHABETICORDER
      );
    if (
      mode === ASSERTIONMODES.DROPDOWNSELECTED ||
      mode === ASSERTIONMODES.DROPDOWNNOTSELECTED
    )
      return getDropdownSelected(el);
    if (mode === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT) return 0;
    return "";
  });

  const [softAssert, setSofAssert] = useState(false);
  const [isNegative, setIsNegative] = useState(false);

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{header}</strong>
        </div>
      </div>
      <textarea
        className="assert-dock-textarea"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
        placeholder="Enter expected value..."
      />
      <div className="docked-pane-footer-confirm-cancel">
        {mode === ASSERTIONMODES.DROPDOWNCOUNTIS ||
        mode === ASSERTIONMODES.DROPDOWNSELECTED ? (
          <div className="docked-pane-footer-assert-container">
            <input
              type="checkbox"
              checked={isNegative}
              onChange={() => setIsNegative((prev) => !prev)}
            ></input>
            <label>Inverse</label>
          </div>
        ) : (
          <></>
        )}
        <div className="docked-pane-footer-assert-container">
          <input
            type="checkbox"
            checked={softAssert}
            onChange={() => setSofAssert((prev) => !prev)}
          ></input>
          <label>Soft Assert</label>
        </div>
        <div className="docked-pane-footer-buttons">
          <button
            onClick={() => {
              setSofAssert(false);
              onCancel();
            }}
            className="docked-pane-footer-cancel-button"
          >
            ❌
          </button>
          <button
            className="docked-pane-footer-confirm-button"
            onClick={() => {
              onConfirm(expected, softAssert, isNegative, assertName, mode);
              setSofAssert(false);
            }}
            disabled={expected === ""}
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
