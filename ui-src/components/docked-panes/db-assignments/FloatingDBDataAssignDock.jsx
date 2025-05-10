import React, { useState, useEffect, useCallback } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import { onConfirmDbAction } from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import VarName from "../variable-name/VarName.jsx";

const DB_ACTIONS = [
  { key: ASSERTIONMODES.GETDBVALUE, value: "Get Single DB Value" },
  { key: ASSERTIONMODES.GETDBROW, value: "Get DB Row" },
  { key: ASSERTIONMODES.GETDBROWS, value: "Get DB Rows" },
  { key: ASSERTIONMODES.RUNDBQUERY, value: "Run DB Query" },
];

const DB_TYPES = ["POSTGRES", "MYSQL", "MSSQL", "DB2"];

export default function FloatingDBDataAssignDock({ mode, onCancel }) {
  const [selectedActnIndex, setSelectedActnIndex] = useState(0);
  const [selectedDbTypeIndex, setSelectedDbTypeIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");

  const [dbConfig, setDbConfig] = useState({
    host: "",
    user: "",
    password: "",
    port: "",
    query: "",
  });

  useModeSocket(onCancel);

  const handleConfirm = useCallback(() => {
    if (
      !varName.trim() ||
      !dbConfig.host.trim() ||
      !dbConfig.port.trim() ||
      !dbConfig.user.trim() ||
      !dbConfig.password.trim() ||
      !dbConfig.query.trim()
    ) {
      return;
    }

    onConfirmDbAction({
      dbAction: DB_ACTIONS[selectedActnIndex].key,
      dbType: DB_TYPES[selectedDbTypeIndex],
      varName: varName.trim(),
      hostName: dbConfig.host.trim(),
      userName: dbConfig.user.trim(),
      password: dbConfig.password.trim(),
      portNum: dbConfig.port.trim(),
      query: dbConfig.query.trim(),
      onCancel,
    });
  }, [varName, dbConfig, selectedActnIndex, selectedDbTypeIndex, onCancel]);

  return (
    <div
      id="floating-cookie-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Fetch Data From Database</strong>
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
        <div className="db-action-types-container">
          <div>
            <label className="assert-checkbox-container">
              Select DB Action Type
            </label>
          </div>
          <div className="db-action-types-wrapper">
            {DB_ACTIONS.map((actn, index) => (
              <label
                key={`${actn.key}_${index}`}
                className="assert-checkbox-container"
              >
                <input
                  type="radio"
                  name="attributeSelect"
                  className="db-action-type-radio"
                  checked={selectedActnIndex === index}
                  onChange={() => setSelectedActnIndex(index)}
                />
                {actn.value}
              </label>
            ))}
          </div>
        </div>
        <div className="assert-attribute-row">
          <div className="locator-name-container">
            <select
              className="cookie-input"
              value={selectedDbTypeIndex}
              onChange={(e) => setSelectedDbTypeIndex(Number(e.target.value))}
            >
              {DB_TYPES.map((dbType, index) => (
                <option key={index} value={index}>
                  {dbType}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            className="assert-input assert-attribute-name"
            value={dbConfig.host}
            onChange={(e) =>
              setDbConfig((prev) => ({ ...prev, host: e.target.value }))
            }
            placeholder="Enter host name.."
          />
          <input
            type="text"
            className="assert-input assert-attribute-name"
            value={dbConfig.user}
            onChange={(e) =>
              setDbConfig((prev) => ({ ...prev, user: e.target.value }))
            }
            placeholder="Enter user name..."
          />
          <div
            className="password-input-wrapper"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              className="assert-input assert-attribute-name"
              value={dbConfig.password}
              onChange={(e) =>
                setDbConfig((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Enter password..."
              style={{
                // width: "100%",
                paddingRight: "30px", // leave room for the icon
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle-eye"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🕶️" : "👁️"}
            </button>
          </div>

          <input
            type="text"
            className="assert-input assert-attribute-name"
            value={dbConfig.port}
            onChange={(e) =>
              setDbConfig((prev) => ({ ...prev, port: e.target.value }))
            }
            placeholder="Enter port number..."
          />
        </div>
        <div className="assert-attribute-row">
          <textarea
            className="assert-pdf-text-textarea"
            value={dbConfig.query}
            onChange={(e) =>
              setDbConfig((prev) => ({ ...prev, query: e.target.value }))
            }
            placeholder="Enter DB query to run.."
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
          !dbConfig.host.trim() ||
          !dbConfig.port.trim() ||
          !dbConfig.user.trim() ||
          !dbConfig.password.trim() ||
          !dbConfig.query.trim()
        }
      />
    </div>
  );
}
