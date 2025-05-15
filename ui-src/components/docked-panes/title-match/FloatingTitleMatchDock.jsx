import React, { useState, useEffect, useRef } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmPageTitleMatch } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

const getTextAreaData = async () => {
  let title = "";
  try {
    title = await window.__getPageTitle();
  } catch {}
  return title;
};

const getAltMode = (mode, startsWith, endsWith) => {
  if (startsWith) return ASSERTIONMODES.TITLESTARTSWITH;
  if (endsWith) return ASSERTIONMODES.TITLEENDSSWITH;

  return ASSERTIONMODES.TITLEEQUALS;
};

export default function FloatingTitleMatchDock({ mode, onCancel, tabbed }) {
  const expectedInputRef = useRef(null);
  const [expected, setExpected] = useState("");
  const [isNegative, setIsNegative] = useState(false);
  const [softAssert, setSoftAssert] = useState(false);
  const [exactMatch, setExactMatch] = useState(true);
  const [startsWith, setStartsWith] = useState(false);
  const [endsWith, setEndsWith] = useState(false);

  useModeSocket(onCancel);

  useEffect(() => {
    const fetchTitle = async () => {
      const result = await getTextAreaData();
      setExpected(result);
    };
    fetchTitle();
  }, []);

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
    onConfirmPageTitleMatch({
      softAssert,
      onCancel,
      mode: getAltMode(mode, startsWith, endsWith),
      isNegative,
      exactMatch,
      expected,
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
          <strong>Match Page Title</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <div className="locator-name-container">
          <label>Current Page Title (Required)</label>
          <textarea
            ref={expectedInputRef}
            className="assert-pdf-text-textarea"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
          />
        </div>
      </div>
      <ConfirmCancelFooter
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={expected === ""}
        isNegative={isNegative}
        setIsNegative={setIsNegative}
        exactMatch={exactMatch}
        setExactMatch={setExactMatch}
        startsWith={startsWith}
        setStartsWith={setStartsWith}
        endsWith={endsWith}
        setEndsWith={setEndsWith}
      />
    </div>
  );
}
