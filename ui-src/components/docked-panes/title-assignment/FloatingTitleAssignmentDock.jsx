import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmPageTitleAssignment } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import VarName from "../variable-name/VarName.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

const getTextAreaData = async () => {
  let title = "";
  try {
    title = await window.__getPageTitle();
  } catch {}
  return title;
};

export default function FloatingTitleAssignmentDock({
  mode,
  onCancel,
  tabbed,
  overrideConfirmCancelFlexEnd,
}) {
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");
  const [pageTitle, setPageTitle] = useState("");

  useModeSocket(onCancel);

  useEffect(() => {
    const fetchTitle = async () => {
      const result = await getTextAreaData();

      setPageTitle(result?.trim() || "");
    };
    fetchTitle();
  }, []);

  const handleCancel = () => {
    onCancel();
  };

  const handleConfirm = () => {
    if (!varName.trim()) return;
    onConfirmPageTitleAssignment({
      varName,
      onCancel,
    });
  };

  return (
    <div
      // id={tabbed ? "floating-tab-list-dock" : "floating-cookie-list-dock"}
      id="floating-tab-list-dock-justifyend"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Get Page Title</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <VarName
          varName={varName}
          setVarName={setVarName}
          varNameError={varNameError}
          setVarNameError={setVarNameError}
        />

        {pageTitle !== "" && (
          <div className="locator-name-container">
            <label>Current Page Title (Read Only)</label>
            <textarea
              className="assert-pdf-text-textarea"
              value={pageTitle}
              readOnly={true}
              disabled={true}
            />
          </div>
        )}
      </div>
      <ConfirmCancelFooter
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={varName === "" || !!varNameError}
      />
    </div>
  );
}
