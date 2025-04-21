import React, { useState } from "react";

const defaultCookie = () => ({
  name: "",
  value: "",
  domain: location.hostname,
  path: "/",
  httpOnly: false,
  secure: false,
  sameSite: "Strict",
  sessionOnly: true,
});

export default function FloatingCookieListDock({ onConfirm, onCancel }) {
  const [cookies, setCookies] = useState([defaultCookie()]);
  const [touched, setTouched] = useState([{ name: false, value: false }]);

  const update = (index, field, value) => {
    const updated = [...cookies];
    updated[index][field] = value;
    setCookies(updated);
  };

  const markTouched = (index, field) => {
    const updated = [...touched];
    updated[index] = { ...updated[index], [field]: true };
    setTouched(updated);
  };

  const addRow = () => {
    setCookies([...cookies, defaultCookie()]);
    setTouched([...touched, { name: false, value: false }]);
  };

  const removeRow = (index) => {
    setCookies(cookies.filter((_, i) => i !== index));
    setTouched(touched.filter((_, i) => i !== index));
  };

  const isValid = cookies.every((c) => c.name.trim() && c.value.trim());

  const reset = () => {
    setCookies([defaultCookie()]);
    setTouched([{ name: false, value: false }]);
  };

  return (
    <div
      id="floating-cookie-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="cookie-list-content">
        <strong className="cookie-list-title">Add Cookies</strong>

        {cookies.map((cookie, index) => (
          <div key={index} className="cookie-item">
            <div className="cookie-input-row">
              <label className="cookie-input-label">
                Name <span className="cookie-required">*</span>
                <input
                  type="text"
                  className="cookie-input"
                  value={cookie.name}
                  onChange={(e) => update(index, "name", e.target.value)}
                  onBlur={() => markTouched(index, "name")}
                />
                {touched[index]?.name && !cookie.name.trim() && (
                  <div className="cookie-error">Name required</div>
                )}
              </label>

              <label className="cookie-input-label">
                Value <span className="cookie-required">*</span>
                <input
                  type="text"
                  className="cookie-input"
                  value={cookie.value}
                  onChange={(e) => update(index, "value", e.target.value)}
                  onBlur={() => markTouched(index, "value")}
                />
                {touched[index]?.value && !cookie.value.trim() && (
                  <div className="cookie-error">Value required</div>
                )}
              </label>

              <button
                className="cookie-remove-button"
                onClick={() => removeRow(index)}
                disabled={cookies.length === 1}
                title="Remove"
              >
                🗑
              </button>
            </div>

            <div className="cookie-additional-fields">
              <input
                placeholder="Domain"
                className="cookie-domain-input cookie-input"
                value={cookie.domain}
                onChange={(e) => update(index, "domain", e.target.value)}
              />
              <input
                placeholder="Path"
                className="cookie-path-input cookie-input"
                value={cookie.path}
                onChange={(e) => update(index, "path", e.target.value)}
              />
            </div>

            <div className="cookie-options">
              <label>
                <input
                  type="checkbox"
                  className="cookie-checkbox"
                  checked={cookie.httpOnly}
                  onChange={(e) => update(index, "httpOnly", e.target.checked)}
                />
                HttpOnly
              </label>
              <label>
                <input
                  type="checkbox"
                  className="cookie-checkbox"
                  checked={cookie.secure}
                  onChange={(e) => update(index, "secure", e.target.checked)}
                />
                Secure
              </label>
              <label>
                SameSite
                <select
                  value={cookie.sameSite}
                  className="cookie-same-site-select"
                  onChange={(e) => update(index, "sameSite", e.target.value)}
                >
                  <option value="Strict">Strict</option>
                  <option value="Lax">Lax</option>
                  <option value="None">None</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  className="cookie-checkbox"
                  checked={cookie.sessionOnly}
                  onChange={(e) =>
                    update(index, "sessionOnly", e.target.checked)
                  }
                />
                Session
              </label>
            </div>
          </div>
        ))}

        <div className="cookie-add-button-container">
          <button className="cookie-add-button" onClick={addRow}>
            ➕ Add Cookie
          </button>
        </div>

        <div className="cookie-preview">
          <strong>Preview:</strong>
          <pre>{JSON.stringify(cookies, null, 2)}</pre>
        </div>
      </div>

      <div className="cookie-footer">
        <button
          className="cookie-cancel-button"
          onClick={() => {
            reset();
            onCancel();
          }}
        >
          ❌
        </button>
        <button
          className="cookie-confirm-button"
          onClick={() => {
            onConfirm(
              cookies.map(({ sessionOnly, ...c }) => ({
                ...c,
                ...(sessionOnly ? {} : { expires: Date.now() + 86400000 }),
              }))
            );
            reset();
          }}
          disabled={!isValid}
        >
          ✅
        </button>
      </div>
    </div>
  );
}
