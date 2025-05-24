import React, { useState, useRef, useEffect } from "react";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import {
  isValidUrl,
  recordHttpRequest,
  flattenJson,
} from "../../../../utils/componentLibs.js";

const defaultHeader = () => ({ key: "", value: "" });

export default function FloatingApiRequestDock({ onCancel }) {
  const inputRefs = useRef([]);

  const [host, setHost] = useState("");
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([]);
  const [touched, setTouched] = useState([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [addResponseAssertion, setAddResponseAssertion] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [responseJson, setResponseJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStepLoading, setSaveStepLoading] = useState(false);

  useModeSocket(onCancel);

  const updateHeader = (index, field, value) => {
    setHeaders((prev) =>
      prev.map((header, i) =>
        i === index ? { ...header, [field]: value } : header
      )
    );
  };

  const markTouched = (index, field) => {
    setTouched((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: true } : item))
    );
  };

  const addHeader = () => {
    setHeaders((prev) => [...prev, defaultHeader()]);
    setTouched((prev) => [...prev, { key: false, value: false }]);
  };

  const removeHeader = (index) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
    setTouched((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid =
    isValidUrl(host) &&
    /^\d+$/.test(status.trim()) &&
    (headers.length === 0 ||
      headers.every((h) => h.key.trim() && h.value.trim()));

  const reset = () => {
    setHost("");
    setPath("");
    setStatus("");
    setMethod("GET");
    setHeaders([]); // empty
    setTouched([]);
    setBody("");
    setAddResponseAssertion(false);
    setApiResponse("");
    setResponseJson(null);
    setLoading(false);
    setSaveStepLoading(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = async () => {
    const responseAsserts = responseJson.filter((v) => v.checked);
    setSaveStepLoading(true);
    await recordHttpRequest({
      host,
      path,
      method,
      headers,
      body,
      status,
      closeDock: handleCancel,
      responseAsserts,
    });
  };

  const toggleSelectAll = () => {
    const allSelected = responseJson.every((resp) => resp.checked);
    setResponseJson((prevResp) =>
      prevResp.map((resp) => ({
        ...resp,
        checked: !allSelected, // If all selected, unselect; otherwise select all
      }))
    );
  };

  const handleSetAddResponseAssertion = async () => {
    const next = !addResponseAssertion;
    setAddResponseAssertion(next);
    if (next) {
      const requestMeta = {
        host,
        path,
        method,
        headers,
        body,
        status,
      };

      try {
        setLoading(true);
        const response = await fetch("http://localhost:3111/api/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestMeta),
        });

        const text = await response.text();
        setApiResponse(text);
        try {
          const json = JSON.parse(text);
          let toFlatten = { ...json };

          if (typeof json.response === "string") {
            try {
              const parsedData = JSON.parse(json.response);
              toFlatten.response = parsedData; // Replace string with parsed object
            } catch (err) {
              console.error(err);
              // Leave it as-is if not valid JSON
            }
          }
          const flat = flattenJson(toFlatten);

          const attributes = Object.entries(flat).map(([key, val]) => ({
            name: key,
            value: String(val),
            checked: false,
            isNegative: false,
            isSubstringMatch: false,
            isSoftAssert: false,
          }));
          setResponseJson(attributes);
        } catch {
          setResponseJson(null);
        }
      } catch (err) {
        setApiResponse(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setApiResponse(""); // Clear response if unchecked
      setResponseJson(null);
    }
  };

  return (
    <div
      // id="floating-api-request-dock"
      id="floating-assert-attribute-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="delete-cookie-content">
        <div className="assert-dock-header">
          <strong className="delete-cookie-title">Make API Request</strong>
        </div>
        <div className="http-field-container">
          <div className="http-field-wrapper">
            <label className="cookie-input-label">Host (Required)</label>
            <input
              type="text"
              className="cookie-input"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
            {host && !isValidUrl(host) && (
              <div
                className="cookie-error"
                style={{ color: "var(--recorder-error-color) !important" }}
              >
                * Enter a valid http or https URL
              </div>
            )}
          </div>
          <div className="http-field-wrapper">
            <label className="cookie-input-label">HTTP Method</label>
            <select
              value={method}
              className="hdr-verb-select"
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          <div className="http-field-wrapper">
            <label className="cookie-input-label">Path (Optional)</label>
            <input
              type="text"
              className="cookie-input"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>

          {headers.length > 0 && (
            <div className="http-field-wrapper">
              <label className="cookie-input-label">Headers</label>
              {headers.map((header, index) => (
                <div key={index} className="http-hdr-row">
                  <input
                    type="text"
                    placeholder="Key"
                    className="cookie-input"
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    onBlur={() => markTouched(index, "key")}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    className="cookie-input"
                    value={header.value}
                    onChange={(e) =>
                      updateHeader(index, "value", e.target.value)
                    }
                    onBlur={() => markTouched(index, "value")}
                  />
                  <button
                    className="hdr-remove-button"
                    onClick={() => removeHeader(index)}
                    title="Remove Header"
                    // disabled={headers.length === 1}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cookie-add-button-container">
            <button className="cookie-add-button" onClick={addHeader}>
              ➕ Add Header
            </button>
          </div>

          {method === "POST" || method === "PUT" || method === "PATCH" ? (
            <label className="cookie-input-label">
              Body
              <textarea
                className="assert-pdf-text-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>
          ) : null}
          <div className="http-field-wrapper">
            <label className="cookie-input-label">
              Expected Status Code (Required)
            </label>
            <input
              type="text"
              className="cookie-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          {addResponseAssertion && loading && (
            <div className="assert-loading-container">
              <div className="spinner" />
              <div className="assert-loading-label">Fetching response...</div>
            </div>
          )}
          {saveStepLoading && (
            <div className="assert-loading-container">
              <div className="spinner" />
              <div className="assert-loading-label">Saving steps...</div>
            </div>
          )}
          {addResponseAssertion &&
            apiResponse &&
            (responseJson ? (
              <div className="assert-attributes-container">
                <div className="assert-resp-header-wrapper">
                  <div>
                    <label className="cookie-input-label">
                      Response Assertions
                    </label>
                  </div>
                  <div className="assert-attributes-container-wrapper">
                    <button
                      className="assert-toggle-button-neg-pos"
                      type="button"
                      onClick={toggleSelectAll}
                    >
                      {responseJson.every((resp) => resp.checked)
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                </div>

                {responseJson.map((attr, index) => (
                  <div key={index} className="assert-attribute-row">
                    <label className="assert-checkbox-container">
                      <input
                        type="checkbox"
                        className="assert-checkbox"
                        checked={attr.checked}
                        onChange={(e) =>
                          setResponseJson((prev) =>
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
                        setResponseJson((prev) =>
                          prev.map((a, i) =>
                            i === index
                              ? { ...a, isNegative: !a.isNegative }
                              : a
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
                        setResponseJson((prev) =>
                          prev.map((a, i) =>
                            i === index ? { ...a, value: e.target.value } : a
                          )
                        )
                      }
                    />

                    <button
                      className="assert-toggle-button-neg-pos"
                      title={
                        attr.isSubstringMatch
                          ? "Substring match"
                          : "Exact match"
                      }
                      onClick={() =>
                        setResponseJson((prev) =>
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
                        setResponseJson((prev) =>
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
                <label className="cookie-input-label">API Response</label>
                <textarea
                  className="assert-pdf-text-textarea"
                  value={apiResponse}
                  readOnly
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                />
              </div>
            ))}
        </div>
      </div>

      <ConfirmCancelFooter
        addResponseAssertion={addResponseAssertion}
        enableAddResponseAssertion={/^\d+$/.test(status.trim())}
        disableAddResponseAssertion={loading}
        handleSetAddResponseAssertion={handleSetAddResponseAssertion}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={!isValid || loading || saveStepLoading}
      />
    </div>
  );
}
