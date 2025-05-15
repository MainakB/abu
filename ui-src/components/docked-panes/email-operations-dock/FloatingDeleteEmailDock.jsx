import React, { useState, useEffect, useCallback } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmDeleteEmailFromServer } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import VarName from "../variable-name/VarName.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

export default function FloatingDeleteEmailDock({ mode, onCancel }) {
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");
  const [emailConfig, setEmailConfig] = useState({
    serverId: "",
    subject: "",
    sentFrom: "",
    sentTo: "",
    receivedBefore: "",
  });
  const [deleteAllEmails, setDeleteAllEmails] = useState(false);

  useModeSocket(onCancel);

  const handleCancel = () => {
    setVarName("");
    setVarNameError("");
    setEmailConfig({
      serverId: "",
      subject: "",
      sentFrom: "",
      sentTo: "",
      receivedBefore: "",
    });
    setDeleteAllEmails(false);
    onCancel();
  };

  const handleConfirm = useCallback(() => {
    if (!emailConfig.serverId.trim() || !emailConfig.subject.trim()) {
      return;
    }

    onConfirmDeleteEmailFromServer({
      varName: varName.trim(),
      serverId: emailConfig.serverId.trim(),
      subject: emailConfig.subject.trim(),
      sentFrom: emailConfig.sentFrom.trim() || null,
      sentTo: emailConfig.sentTo.trim() || null,
      receivedBefore: emailConfig.receivedBefore.trim() || null,
      deleteAllEmails,
      onCancel: handleCancel,
    });
  }, [varName, emailConfig, onCancel]);

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Delete Email(s) From Server</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <VarName
          varName={varName}
          setVarName={setVarName}
          varNameError={varNameError}
          setVarNameError={setVarNameError}
        />
      </div>
      <div className="assert-attributes-container">
        <div className="assert-attribute-row">
          <input
            type="text"
            className="cookie-input"
            value={emailConfig.subject}
            onChange={(e) =>
              setEmailConfig((prev) => ({ ...prev, subject: e.target.value }))
            }
            placeholder="* Enter email subject name..."
          />
        </div>
        <div className="assert-attribute-row">
          <input
            type="text"
            className="cookie-input"
            value={emailConfig.serverId}
            onChange={(e) =>
              setEmailConfig((prev) => ({
                ...prev,
                serverId: e.target.value,
              }))
            }
            placeholder="* Enter mail server ID.."
          />

          <input
            type="text"
            className="cookie-input"
            value={emailConfig.receivedBefore}
            onChange={(e) =>
              setEmailConfig((prev) => ({
                ...prev,
                receivedBefore: e.target.value,
              }))
            }
            placeholder="In days,age of the email..."
          />
        </div>
        <div className="assert-attribute-row">
          <input
            type="text"
            className="cookie-input"
            value={emailConfig.sentFrom}
            onChange={(e) =>
              setEmailConfig((prev) => ({
                ...prev,
                sentFrom: e.target.value,
              }))
            }
            placeholder="Enter sender email ID..."
          />

          <input
            type="text"
            className="cookie-input"
            value={emailConfig.sentTo}
            onChange={(e) =>
              setEmailConfig((prev) => ({ ...prev, sentTo: e.target.value }))
            }
            placeholder="Enter receiver email ID..."
          />
        </div>
      </div>

      <ConfirmCancelFooter
        onCancel={onCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        deleteAllEmails={deleteAllEmails}
        setDeleteAllEmails={setDeleteAllEmails}
        disabled={
          !varName.trim() ||
          !!varNameError ||
          !emailConfig.serverId.trim() ||
          !emailConfig.subject.trim() ||
          (emailConfig.receivedBefore &&
            !/^\d+$/.test(emailConfig.receivedBefore.trim()))
        }
      />
    </div>
  );
}
