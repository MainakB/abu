import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import { floatingAssertCurrentUrlConfirm } from "../../../../utils/componentLibs.js";

async function getCurrentUrl() {
  try {
    return window.__pageUrl();
  } catch (err) {
    console.warn("getCurrentUrl failed:", err);
    return "";
  }
}

export default function CurrentUrlAssertDock({ mode, onCancel }) {
  const [expected, setExpected] = useState("");
  const [isNegative, setIsNegative] = useState(false);
  const [softAssert, setSoftAssert] = useState(false);
  const [exactMatch, setExactMatch] = useState(true);

  useModeSocket(onCancel);

  useEffect(() => {
    async function fetchUrl() {
      const url = await getCurrentUrl();
      setExpected(url);
    }
    fetchUrl();
  }, []);

  const closeDockReset = () => {
    setSoftAssert(false);
    setIsNegative(false);
  };

  const handleCancel = () => {
    closeDockReset();
    onCancel();
  };

  const handleConfirm = () => {
    floatingAssertCurrentUrlConfirm({
      expected,
      isSoftAssert: softAssert,
      isNegative,
      exactMatch,
      mode,
      closeDock: handleCancel,
    });

    // onConfirm(expected, softAssert, isNegative, exactMatch);
    // closeDockReset();
  };

  return (
    <div
      id="floating-assert-dock-root-container"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Assert Current URL</strong>
        </div>
      </div>
      <textarea
        className="assert-dock-textarea"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
        placeholder="Enter expected value..."
      />
      <ConfirmCancelFooter
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        isNegative={isNegative}
        setIsNegative={setIsNegative}
        exactMatch={exactMatch}
        setExactMatch={setExactMatch}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={expected === ""}
      />
    </div>
  );
}
