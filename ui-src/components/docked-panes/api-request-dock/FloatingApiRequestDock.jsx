import React, { useState, useRef, useEffect } from "react";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";
import {
  isValidUrl,
  recordHttpRequest,
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
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = () => {
    recordHttpRequest({
      host,
      path,
      method,
      headers,
      body,
      status,
      closeDock: handleCancel,
    });
  };

  return (
    <div
      // id="floating-api-request-dock"
      id="floating-cookie-delete-dock"
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
        </div>
      </div>

      <ConfirmCancelFooter
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={!isValid}
      />
    </div>
  );
}
