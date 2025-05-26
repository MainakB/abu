import React, { useState, useEffect, useRef } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmElemMatch } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import ExistingVarNamesList from "../variable-name/ExistingVarNamesList.jsx";
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

const getAtrValue = (el, textVal) => {
  const valAtr = el.getAttribute("value");
  if (valAtr && typeof valAtr === "string" && valAtr.trim() !== "") {
    return valAtr;
  }

  return textVal;
};

const getTextAreaData = (el, mode, textvalue) => {
  if (mode === ASSERTIONMODES.ISENABLED) return el.enabled || "";
  if (mode === ASSERTIONMODES.ISPRESENT) return true;
  if (mode === ASSERTIONMODES.ISELEMENTCLICKABLE) return true;
  if (mode === ASSERTIONMODES.ISDISPLAYED) return true;
  if (mode === ASSERTIONMODES.GETTEXT) return textvalue;
  if (mode === ASSERTIONMODES.GETVALUE) return getAtrValue(el, textvalue);
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
  const [matchByType, setMatchByType] = useState({
    byText: true,
    byVar: false,
  });
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [existingVarNames, setExistingVarNames] = useState([]);

  useModeSocket(onCancel);

  useEffect(() => {
    expectedInputRef.current.focus();
  }, []);

  const handleVarNameChange = (e) => {
    const expectedValue = e.target.value;
    setExpected(expectedValue);
  };

  const handleCancel = () => {
    setIsNegative(false);
    setSoftAssert(false);
    setExactMatch(true);
    setStartsWith(false);
    setEndsWith(false);
    setLocatorName("");
    setMatchByType({
      byText: true,
      byVar: false,
    });
    setSelectedVarIndex(0);
    setExistingVarNames([]);

    onCancel();
  };

  const handleConfirm = () => {
    if (matchByType.byText && !expected.trim()) return;
    if (
      matchByType.byVar &&
      (existingVarNames.length === 0 ||
        existingVarNames[selectedVarIndex] === undefined)
    )
      return;

    onConfirmElemMatch({
      expected: matchByType.byText
        ? expected
        : existingVarNames[selectedVarIndex],
      softAssert,
      locatorName,
      onCancel,
      el,
      e,
      textValue,
      mode: getAltMode(mode, startsWith, endsWith),
      isNegative,
      exactMatch,
      typeMatch: matchByType.byText ? "byText" : "byVar",
    });
  };

  const onRadioSelection = (type) => {
    setMatchByType({
      byText: type === "byText",
      byVar: type === "byVar",
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
        <div className="assert-attribute-row">
          <label className="assert-checkbox-container" style={{ flex: 1 }}>
            <input
              type="radio"
              name="by-text"
              checked={matchByType.byText === true}
              onChange={() => onRadioSelection("byText")}
            />
            <span style={{ marginLeft: "6px" }}>By Text</span>
          </label>
          <label className="assert-checkbox-container" style={{ flex: 1 }}>
            <input
              type="radio"
              name="by-text"
              checked={matchByType.byVar === true}
              onChange={() => onRadioSelection("byVar")}
            />
            <span style={{ marginLeft: "6px" }}>By Variable</span>
          </label>
        </div>
        {matchByType.byText ? (
          <div className="locator-name-container">
            <label>Expected Value (Required)</label>
            <textarea
              ref={expectedInputRef}
              className="assert-pdf-text-textarea"
              value={expected}
              onChange={handleVarNameChange}
            />
          </div>
        ) : (
          <ExistingVarNamesList
            selectedVarIndex={selectedVarIndex}
            setSelectedVarIndex={setSelectedVarIndex}
            existingVarNames={existingVarNames}
            setExistingVarNames={setExistingVarNames}
          />
        )}
      </div>
      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={
          (matchByType.byText &&
            typeof expected === "string" &&
            expected.trim() === "") ||
          (matchByType.byVar && !existingVarNames[selectedVarIndex])
        }
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
