import React, { useState, useRef, useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { floatingDeleteCookieDockConfirm } from "../../../../utils/componentLibs.js";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

export default function FloatingDeleteCookieDock({ onCancel }) {
  const inputRefs = useRef([]);

  const [names, setNames] = useState([""]);
  const [touched, setTouched] = useState([false]);
  const [deleteAll, setDeleteAll] = useState(false);
  useModeSocket(onCancel);
  useEffect(() => {
    if (!deleteAll && inputRefs.current.length) {
      const lastInput = inputRefs.current[inputRefs.current.length - 1];
      lastInput?.focus();
    }
  }, [names.length, deleteAll]);

  const update = (index, value) => {
    // const updated = [...names];
    // updated[index] = value;
    // setNames(updated);
    setNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const markTouched = (index) => {
    // const updated = [...touched];
    // updated[index] = true;
    // setTouched(updated);
    setTouched((prev) => prev.map((t, i) => (i === index ? true : t)));
  };

  const addRow = () => {
    setNames((prev) => [...prev, ""]);
    setTouched((prev) => [...prev, false]);
    // setNames([...names, ""]);
    // setTouched([...touched, false]);
  };

  const removeRow = (index) => {
    setNames(names.filter((_, i) => i !== index));
    setTouched(touched.filter((_, i) => i !== index));
  };

  const reset = () => {
    setNames([""]);
    setTouched([false]);
    setDeleteAll(false);
  };

  const isValid = deleteAll || (names.every((n) => n.trim()) && names.length);

  const handleDeleteAllToggle = () => {
    const next = !deleteAll;
    setDeleteAll(next);
    if (next) {
      setNames([""]);
      setTouched([false]);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = () => {
    // onConfirm(deleteAll ? [] : names);
    floatingDeleteCookieDockConfirm(
      deleteAll ? [] : names,
      onCancel,
      window.__deleteCookies
    );
    reset();
  };

  return (
    <div
      id="floating-cookie-delete-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="delete-cookie-content">
        <strong className="delete-cookie-title">Delete Cookies</strong>

        <label className="delete-all-checkbox-container">
          <input
            type="checkbox"
            className="delete-cookie-checkbox"
            checked={deleteAll}
            onChange={handleDeleteAllToggle}
          />
          <span>Delete all cookies</span>
        </label>

        <TransitionGroup key={deleteAll ? "no-inputs" : "inputs"}>
          {!deleteAll &&
            names.map((name, index) => (
              <CSSTransition
                key={index}
                timeout={300}
                classNames="delete-cookie-row"
              >
                <div key={index} className="delete-cookie-row">
                  <label className="delete-cookie-input-label">
                    {/* Cookie Name <span className="delete-cookie-required">*</span> */}
                    <span className="label-text">
                      Cookie Name
                      <span className="delete-cookie-required">*</span>
                    </span>
                    <input
                      type="text"
                      className="delete-cookie-input"
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={name}
                      onChange={(e) => update(index, e.target.value)}
                      onBlur={() => markTouched(index)}
                    />
                    {!deleteAll &&
                      touched[index] &&
                      !name.trim() &&
                      names.length > 0 && (
                        <div className="delete-cookie-error">
                          * Name required
                        </div>
                      )}
                  </label>

                  <button
                    className="delete-cookie-remove-button"
                    onClick={() => removeRow(index)}
                    disabled={names.length === 1}
                    title="Remove"
                    aria-label="Remove cookie name"
                  >
                    🗑
                  </button>
                </div>
              </CSSTransition>
            ))}
        </TransitionGroup>

        {!deleteAll && (
          <div className="delete-cookie-add-button-container">
            <button
              className="delete-cookie-add-button"
              onClick={addRow}
              disabled={names.some((n) => !n.trim())}
              aria-label="Add new cookie name"
            >
              ➕ Add Cookie Name
            </button>
          </div>
        )}
      </div>

      <ConfirmCancelFooter
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={!isValid}
      />
    </div>
  );
}
