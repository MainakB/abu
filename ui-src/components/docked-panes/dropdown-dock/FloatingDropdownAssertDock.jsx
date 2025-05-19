import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import { recordDropdownAssert } from "../../../../utils/componentLibs.js";

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

  if (modeValue === ASSERTIONMODES.DROPDOWNOPTIONSBYPARTIALTEXT) {
    return "Assert Dropdown Contains Option By Partial Text";
  }

  if (modeValue === ASSERTIONMODES.DROPDOWNCOUNTIS) {
    return "Assert Dropdown Count";
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
}

export default function FloatingDropdownAssertDock({ el, mode, onCancel, e }) {
  const [header, setHeader] = useState(() => getHeader(mode));
  const [expected, setExpected] = useState(() => {
    if (mode === ASSERTIONMODES.DROPDOWNCOUNTIS) return getDropdownCount(el);
    if (
      mode === ASSERTIONMODES.DROPDOWNCONTAINS ||
      mode === ASSERTIONMODES.DROPDOWNOPTIONSBYPARTIALTEXT
    )
      return "";
    if (mode === ASSERTIONMODES.DROPDOWNVALUESARE)
      return getDropdownOrder(el, false);
    if (mode === ASSERTIONMODES.DROPDOWNSELECTED)
      return getDropdownSelected(el);
    if (mode === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT) return 0;
    return "";
  });

  const [softAssert, setSoftAssert] = useState(false);
  const [locatorName, setLocatorName] = useState("");
  const [isNegative, setIsNegative] = useState(false);

  useModeSocket(onCancel);

  const handleConfirm = () => {
    recordDropdownAssert({
      expected,
      isSoftAssert: softAssert,
      isNegative,
      locatorName,
      mode,
      closeDock: handleCancel,
      el,
      e,
    });
  };

  const handleCancel = () => {
    setSoftAssert(false);
    onCancel();
  };

  return (
    <div
      id="floating-assert-dock-root-container"
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

      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        {...(mode === ASSERTIONMODES.DROPDOWNCOUNTIS ||
        mode === ASSERTIONMODES.DROPDOWNCONTAINS ||
        mode === ASSERTIONMODES.DROPDOWNSELECTED
          ? { isNegative, setIsNegative }
          : {})}
        disabled={expected === ""}
      />
    </div>
  );
}
