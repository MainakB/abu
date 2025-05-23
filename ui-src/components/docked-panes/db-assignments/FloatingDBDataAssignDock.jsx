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
  // const [status, setStatus] = useState("");
  // const [addDbAssertion, setAddDbAssertion] = useState(false);
  // const [dbResponse, setDbResponse] = useState("");
  // const [dbResponseJson, setDbResponseJson] = useState(null);
  // const [loading, setLoading] = useState(false);

  const [dbConfig, setDbConfig] = useState({
    host: "",
    user: "",
    password: "",
    port: "",
    query: "",
    database: "",
    ssl: false,
  });

  useModeSocket(onCancel);

  const handleCancel = () => {
    setSelectedActnIndex(0);
    setSelectedDbTypeIndex(0);
    setShowPassword(false);
    setVarName("");
    setVarNameError("");
    setDbConfig({
      host: "",
      user: "",
      password: "",
      port: "",
      query: "",
      database: "",
      ssl: false,
    });
    onCancel();
  };

  const handleConfirm = useCallback(() => {
    if (
      !varName.trim() ||
      !dbConfig.host.trim() ||
      !dbConfig.port.trim() ||
      !dbConfig.user.trim() ||
      !dbConfig.password.trim() ||
      !dbConfig.database.trim() ||
      !dbConfig.query.trim()
    ) {
      return;
    }

    const connHost =
      (dbConfig.host.trim().endsWith("/")
        ? dbConfig.host.trim()
        : `${dbConfig.host.trim()}/`) +
      (dbConfig.database !== "" ? dbConfig.database.trim() : "") +
      (dbConfig.ssl ? "?ssl=true" : "");

    onConfirmDbAction({
      dbAction: DB_ACTIONS[selectedActnIndex].key,
      dbType: DB_TYPES[selectedDbTypeIndex],
      varName: varName.trim(),
      hostName: connHost,
      userName: dbConfig.user.trim(),
      password: dbConfig.password.trim(),
      portNum: dbConfig.port.trim(),
      // ssl: dbConfig.isSsl,
      // database: dbConfig.database.trim(),
      query: dbConfig.query.trim(),
      onCancel: handleCancel,
    });
  }, [varName, dbConfig, selectedActnIndex, selectedDbTypeIndex, onCancel]);

  // const handleSetAddDbAssertion = async () => {
  //   const next = !addDbAssertion;
  //   setAddDbAssertion(next);
  //   if (next) {
  //     const requestMeta = {
  //       host: dbConfig.host,
  //       user: dbConfig.user,
  //       password: dbConfig.password,
  //       port: dbConfig.port,
  //       ssl: dbConfig.isSsl,
  //       database: dbConfig.database,
  //       query: dbConfig.query,
  //     };

  //     try {
  //       setLoading(true);
  //       const response = await fetch("http://localhost:3111/api/dbproxy", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(requestMeta),
  //       });

  //       const text = await response.text();
  //       setDbResponse(text);
  //       try {
  //         const json = JSON.parse(text);
  //         let toFlatten = { ...json };

  //         if (typeof json.response === "string") {
  //           try {
  //             const parsedData = JSON.parse(json.response);
  //             toFlatten.response = parsedData; // Replace string with parsed object
  //           } catch (err) {
  //             console.error(err);
  //             // Leave it as-is if not valid JSON
  //           }
  //         }
  //         const flat = flattenJson(toFlatten);

  //         const attributes = Object.entries(flat).map(([key, val]) => ({
  //           name: key,
  //           value: String(val),
  //           checked: false,
  //           isNegative: false,
  //           isSubstringMatch: false,
  //           isSoftAssert: false,
  //         }));
  //         setDbResponseJson(attributes);
  //       } catch {
  //         setDbResponseJson(null);
  //       }
  //     } catch (err) {
  //       setDbResponse(`❌ Error: ${err.message}`);
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     setDbResponse(""); // Clear response if unchecked
  //     setDbResponseJson(null);
  //   }
  // };

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
          <input
            type="text"
            className="assert-input assert-attribute-name"
            value={dbConfig.database}
            onChange={(e) =>
              setDbConfig((prev) => ({ ...prev, database: e.target.value }))
            }
            placeholder="Enter DB name..."
          />

          <div className="docked-pane-footer-assert-container">
            <input
              id="dbSsl-checkbox"
              type="checkbox"
              checked={dbConfig.ssl}
              onChange={(e) =>
                setDbConfig((prev) => ({ ...prev, ssl: !prev.ssl }))
              }
            ></input>
            <label htmlFor="dbSsl-checkbox">
              SSL
              <span className="info-tooltip-icon" title="Is SSL Enabled">
                ⓘ
              </span>
            </label>
          </div>
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
        {/* {addDbAssertion && loading && (
          <div className="assert-loading-container">
            <div className="spinner" />
            <div className="assert-loading-label">Fetching response...</div>
          </div>
        )}
        {addDbAssertion &&
          dbResponse &&
          (dbResponseJson ? (
            <div className="assert-attributes-container">
              <div className="assert-resp-header-wrapper">
                <div>
                  <label className="cookie-input-label">DB Assertions</label>
                </div>
                <div className="assert-attributes-container-wrapper">
                  <button
                    className="assert-toggle-button-neg-pos"
                    type="button"
                    onClick={toggleSelectAll}
                  >
                    {dbResponseJson.every((resp) => resp.checked)
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              </div>

              {dbResponseJson.map((attr, index) => (
                <div key={index} className="assert-attribute-row">
                  <label className="assert-checkbox-container">
                    <input
                      type="checkbox"
                      className="assert-checkbox"
                      checked={attr.checked}
                      onChange={(e) =>
                        setDbResponseJson((prev) =>
                          prev.map((a, i) =>
                            i === index
                              ? { ...a, checked: e.target.checked }
                              : a
                          )
                        )
                      }
                    />
                  </label>

                  <input
                    type="text"
                    className="assert-input assert-attribute-name"
                    value={attr.name}
                    readOnly
                    disabled
                    title={attr.name}
                  />

                  <button
                    className="assert-toggle-button-neg-pos"
                    title={
                      attr.isNegative ? "Assert not equals" : "Assert equals"
                    }
                    onClick={() =>
                      setDbResponseJson((prev) =>
                        prev.map((a, i) =>
                          i === index ? { ...a, isNegative: !a.isNegative } : a
                        )
                      )
                    }
                  >
                    {attr.isNegative ? "≠" : "="}
                  </button>

                  <input
                    type="text"
                    className="assert-input assert-attribute-value"
                    value={attr.value}
                    onChange={(e) =>
                      setDbResponseJson((prev) =>
                        prev.map((a, i) =>
                          i === index ? { ...a, value: e.target.value } : a
                        )
                      )
                    }
                  />

                  <button
                    className="assert-toggle-button-neg-pos"
                    title={
                      attr.isSubstringMatch ? "Substring match" : "Exact match"
                    }
                    onClick={() =>
                      setDbResponseJson((prev) =>
                        prev.map((a, i) =>
                          i === index
                            ? { ...a, isSubstringMatch: !a.isSubstringMatch }
                            : a
                        )
                      )
                    }
                  >
                    {attr.isSubstringMatch ? "contains" : "exact"}
                  </button>

                  <button
                    className="assert-toggle-button-neg-pos"
                    title={attr.isSoftAssert ? "Soft Match" : "Match"}
                    onClick={() =>
                      setDbResponseJson((prev) =>
                        prev.map((a, i) =>
                          i === index
                            ? { ...a, isSoftAssert: !a.isSoftAssert }
                            : a
                        )
                      )
                    }
                  >
                    {attr.isSoftAssert ? "sMatch" : "match"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="http-response-container">
              <label className="cookie-input-label">DB Response</label>
              <textarea
                className="assert-pdf-text-textarea"
                value={dbResponse}
                readOnly
                style={{ maxHeight: "200px", overflowY: "auto" }}
              />
            </div>
          ))} */}
      </div>

      <ConfirmCancelFooter
        // isSpaced={true}
        // addDbAssertion={addDbAssertion}
        // enableAddDbAssertion={true}
        // disableAddDbAssertion={loading}
        // handleSetAddDbAssertion={handleSetAddDbAssertion}
        onCancel={onCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={
          !varName.trim() ||
          !!varNameError ||
          !dbConfig.host.trim() ||
          !dbConfig.port.trim() ||
          !dbConfig.database.trim() ||
          !dbConfig.user.trim() ||
          !dbConfig.password.trim() ||
          !dbConfig.query.trim()
        }
      />
    </div>
  );
}
