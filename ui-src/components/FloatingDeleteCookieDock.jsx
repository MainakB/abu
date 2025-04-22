import React, { useState } from "react";

export default function FloatingDeleteCookieDock({ onConfirm, onCancel }) {
  const [names, setNames] = useState([""]);
  const [touched, setTouched] = useState([false]);
  const [deleteAll, setDeleteAll] = useState(false);

  const update = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const markTouched = (index) => {
    const updated = [...touched];
    updated[index] = true;
    setTouched(updated);
  };

  const addRow = () => {
    setNames([...names, ""]);
    setTouched([...touched, false]);
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
    if (next) {
      setNames([""]);
      setTouched([false]);
    }
    setDeleteAll(next);
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

        {!deleteAll &&
          names.map((name, index) => (
            <div key={index} className="delete-cookie-row">
              <label className="delete-cookie-input-label">
                {/* Cookie Name <span className="delete-cookie-required">*</span> */}
                <span className="label-text">
                  Cookie Name<span className="delete-cookie-required">*</span>
                </span>
                <input
                  type="text"
                  className="delete-cookie-input"
                  value={name}
                  onChange={(e) => update(index, e.target.value)}
                  onBlur={() => markTouched(index)}
                />
                {touched[index] && !name.trim() && (
                  <div className="delete-cookie-error">Name required</div>
                )}
              </label>

              <button
                className="delete-cookie-remove-button"
                onClick={() => removeRow(index)}
                disabled={names.length === 1}
                title="Remove"
              >
                🗑
              </button>
            </div>
          ))}

        {!deleteAll && (
          <div className="delete-cookie-add-button-container">
            <button
              className="delete-cookie-add-button"
              onClick={addRow}
              disabled={names.some((n) => !n.trim())}
            >
              ➕ Add Cookie Name
            </button>
          </div>
        )}
      </div>

      <div className="delete-cookie-footer">
        <button
          className="delete-cookie-cancel-button"
          onClick={() => {
            reset();
            onCancel();
          }}
        >
          ❌
        </button>
        <button
          className="delete-cookie-confirm-button"
          onClick={() => {
            onConfirm(deleteAll ? [] : names);
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
