import React, { useState, useRef, useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

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
  const inputRefs = useRef([]);
  const [cookies, setCookies] = useState([defaultCookie()]);
  const [touched, setTouched] = useState([{ name: false, value: false }]);
  useModeSocket(onCancel);
  useEffect(() => {
    if (inputRefs.current.length) {
      const lastInput = inputRefs.current[inputRefs.current.length - 1];
      lastInput?.focus();
    }
  }, [cookies.length]);

  const update = (index, field, value) => {
    // const updated = [...cookies];
    // updated[index][field] = value;
    // setCookies(updated);
    setCookies((prev) =>
      prev.map((cookie, i) =>
        i === index ? { ...cookie, [field]: value } : cookie
      )
    );
  };

  const markTouched = (index, field) => {
    // const updated = [...touched];
    // updated[index] = { ...updated[index], [field]: true };
    // setTouched(updated);
    setTouched((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: true } : item))
    );
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

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(
      cookies.map(({ sessionOnly, ...c }) => ({
        ...c,
        ...(sessionOnly ? {} : { expires: Date.now() + 86400000 }),
      }))
    );
    reset();
  };

  return (
    <div
      id="floating-cookie-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="cookie-list-content">
        <strong className="cookie-list-title">Add Cookies</strong>

        <TransitionGroup>
          {cookies.map((cookie, index) => (
            <CSSTransition key={index} timeout={300} classNames="cookie-item">
              <div key={index} className="cookie-item">
                <div className="cookie-input-row">
                  <label className="cookie-input-label">
                    Name <span className="cookie-required">*</span>
                    <input
                      type="text"
                      className="cookie-input"
                      value={cookie.name}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => update(index, "name", e.target.value)}
                      onBlur={() => markTouched(index, "name")}
                    />
                    {touched[index]?.name && !cookie.name.trim() && (
                      <div
                        className="cookie-error"
                        style={{
                          color: "var(--recorder-error-color) !important",
                        }}
                      >
                        * Name required
                      </div>
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
                      <div
                        className="cookie-error"
                        style={{
                          color: "var(--recorder-error-color) !important",
                        }}
                      >
                        * Value required
                      </div>
                    )}
                  </label>

                  <button
                    className="cookie-remove-button"
                    onClick={() => removeRow(index)}
                    disabled={cookies.length === 1}
                    title="Remove"
                    aria-label="Remove cookie"
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
                      onChange={(e) =>
                        update(index, "httpOnly", e.target.checked)
                      }
                    />
                    HttpOnly
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      className="cookie-checkbox"
                      checked={cookie.secure}
                      onChange={(e) =>
                        update(index, "secure", e.target.checked)
                      }
                    />
                    Secure
                  </label>
                  <label>
                    SameSite
                    <select
                      value={cookie.sameSite}
                      className="cookie-same-site-select"
                      onChange={(e) =>
                        update(index, "sameSite", e.target.value)
                      }
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
            </CSSTransition>
          ))}
        </TransitionGroup>

        <div className="cookie-add-button-container">
          <button
            className="cookie-add-button"
            onClick={addRow}
            aria-label="Add new cookie"
          >
            ➕ Add Cookie
          </button>
        </div>

        <div className="cookie-preview">
          <strong>Preview:</strong>
          <pre>{JSON.stringify(cookies, null, 2)}</pre>
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
