import React, { useState, useEffect, useCallback } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmGetEmailFromServer } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import VarName from "../variable-name/VarName.jsx";

export default function FloatingEmailAssignDock({ mode, onCancel }) {
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");

  const [emailConfig, setEmailConfig] = useState({
    serverId: "",
    subject: "",
    sentFrom: "",
    sentTo: "",
    filter: "",
    receivedBefore: "",
  });

  useModeSocket(onCancel);

  const handleCancel = () => {
    setVarName("");
    setVarNameError("");
    setEmailConfig({
      serverId: "",
      subject: "",
      sentFrom: "",
      sentTo: "",
      filter: "",
      receivedBefore: "",
    });
    onCancel();
  };

  const handleConfirm = useCallback(() => {
    if (
      !varName.trim() ||
      !emailConfig.serverId.trim() ||
      !emailConfig.subject.trim()
    ) {
      return;
    }

    onConfirmGetEmailFromServer({
      varName: varName.trim(),
      serverId: emailConfig.serverId.trim(),
      subject: emailConfig.subject.trim(),
      filter: emailConfig.filter.trim() || null,
      sentFrom: emailConfig.sentFrom.trim() || null,
      sentTo: emailConfig.sentTo.trim() || null,
      receivedBefore: emailConfig.receivedBefore.trim() || null,
      onCancel: handleCancel,
    });
  }, [varName, emailConfig, onCancel]);

  return (
    <div
      id="floating-cookie-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Fetch Email From Server</strong>
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
              setEmailConfig((prev) => ({ ...prev, serverId: e.target.value }))
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
              setEmailConfig((prev) => ({ ...prev, sentFrom: e.target.value }))
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
        <div className="assert-attribute-row">
          <input
            type="text"
            className="cookie-input"
            value={emailConfig.filter}
            onChange={(e) =>
              setEmailConfig((prev) => ({ ...prev, filter: e.target.value }))
            }
            placeholder="Enter any text to filter the email by..."
          />
        </div>
      </div>

      <ConfirmCancelFooter
        onCancel={onCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
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
