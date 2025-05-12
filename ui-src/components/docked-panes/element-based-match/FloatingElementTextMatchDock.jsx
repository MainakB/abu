import React, { useState, useEffect, useRef } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmElemMatch } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

const getLabel = (mode) => {
  if (mode === ASSERTIONMODES.ISENABLED) return "Match Is Enabled";
  if (mode === ASSERTIONMODES.ISPRESENT) return "Match Is Element Present";
  if (mode === ASSERTIONMODES.ISELEMENTCLICKABLE)
    return "Match Is Element Clickable";
  if (mode === ASSERTIONMODES.ISDISPLAYED) return "Match Is Element Displayed";
  if (mode === ASSERTIONMODES.GETTEXT) return "Match Element Text";
  if (mode === ASSERTIONMODES.GETVALUE) return "Match Element Value";
  if (mode === ASSERTIONMODES.GETINNERHTML) return "Match Inner HTML";
  return "";
};

const getTextAreaData = (el, mode, textvalue) => {
  if (mode === ASSERTIONMODES.ISENABLED) return el.enabled || "";
  if (mode === ASSERTIONMODES.ISPRESENT) return true;
  if (mode === ASSERTIONMODES.ISELEMENTCLICKABLE) return true;
  if (mode === ASSERTIONMODES.ISDISPLAYED) return true;
  if (mode === ASSERTIONMODES.GETTEXT) return textvalue;
  if (mode === ASSERTIONMODES.GETVALUE) return textvalue;
  if (mode === ASSERTIONMODES.GETINNERHTML) return el.innerHTML?.trim() || "";
  return "";
};

const getAltMode = (mode, startsWith, endsWith) => {
  if (mode === ASSERTIONMODES.ISENABLED)
    return ASSERTIONMODES.MATCHISENABLEDEQUALS;
  if (mode === ASSERTIONMODES.ISPRESENT)
    return ASSERTIONMODES.MATCHISPRESENTEQUALS;
  if (mode === ASSERTIONMODES.ISELEMENTCLICKABLE)
    return ASSERTIONMODES.MATCHISELEMENTCLICKABLEEQUALS;
  if (mode === ASSERTIONMODES.ISDISPLAYED)
    return ASSERTIONMODES.MATCHISDISPLAYEDEQUALS;
  if (mode === ASSERTIONMODES.GETTEXT) {
    if (startsWith) return ASSERTIONMODES.MATCHGETTEXTSTARTSWITH;
    else if (endsWith) return ASSERTIONMODES.MATCHGETTEXTENDSWITH;
    else return ASSERTIONMODES.MATCHGETTEXTEQUALS;
  }
  if (mode === ASSERTIONMODES.GETVALUE) {
    if (startsWith) return ASSERTIONMODES.MATCHGETVALUESTARTSWITH;
    else if (endsWith) return ASSERTIONMODES.MATCHGETVALUEENDSWITH;
    return ASSERTIONMODES.MATCHGETVALUEEQUALS;
  }
  if (mode === ASSERTIONMODES.GETINNERHTML) {
    if (startsWith) return ASSERTIONMODES.MATCHGETINNERHTMLSTARTSWITH;
    else if (endsWith) return ASSERTIONMODES.MATCHGETINNERHTMLENDSWITH;
    else if (endsWith) return ASSERTIONMODES.MATCHGETINNERHTMLEQUALS;
  }
  return mode;
};

export default function FloatingElementTextMatchDock({
  el,
  e,
  textValue,
  mode,
  onCancel,
  tabbed,
}) {
  const expectedInputRef = useRef(null);
  const [expected, setExpected] = useState(
    getTextAreaData(el, mode, textValue)
  );
  const [isNegative, setIsNegative] = useState(false);
  const [softAssert, setSoftAssert] = useState(false);
  const [exactMatch, setExactMatch] = useState(true);
  const [startsWith, setStartsWith] = useState(false);
  const [endsWith, setEndsWith] = useState(false);
  const [locatorName, setLocatorName] = useState("");

  useModeSocket(onCancel);

  useEffect(() => {
    expectedInputRef.current.focus();
  }, []);

  const handleVarNameChange = (e) => {
    const expectedValue = e.target.value;
    setExpected(expectedValue);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleConfirm = () => {
    if (!expected.trim()) return;
    onConfirmElemMatch({
      expected,
      softAssert,
      locatorName,
      onCancel,
      el,
      e,
      textValue,
      mode: getAltMode(mode, startsWith, endsWith),
      isNegative,
      exactMatch,
    });
  };



  return (
    <div
      id={tabbed ? "floating-tab-list-dock" : "floating-cookie-list-dock"}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>{getLabel(mode)}</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <div className="locator-name-container">
          <label>Expected Value (Required)</label>
          <textarea
            ref={expectedInputRef}
            className="assert-pdf-text-textarea"
            value={expected}
            onChange={handleVarNameChange}
          />
        </div>
      </div>
      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={expected === ""}
        isNegative={isNegative}
        setIsNegative={setIsNegative}
        {...(mode === ASSERTIONMODES.GETTEXT ||
        mode === ASSERTIONMODES.GETVALUE ||
        mode === ASSERTIONMODES.GETINNERHTML
          ? {
              exactMatch,
              setExactMatch,
              startsWith,
              setStartsWith,
              endsWith,
              setEndsWith,
            }
          : {})}
      />
    </div>
  );
}
