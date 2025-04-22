import React, { useState, useEffect } from "react";
// import "./assertAttributeValueDock.css";

export default function AssertAttributeValueDock({
  getAttributes,
  el,
  mode,
  onConfirm,
  onCancel,
}) {
  // Initialize state for each attribute
  const [attributeStates, setAttributeStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [softAssert, setSofAssert] = useState(false);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const attributes = await getAttributes(el);
        // Handle both object and array formats
        let processedAttributes;
        if (Array.isArray(attributes)) {
          processedAttributes = attributes.map((attr) => {
            const [name, value] = Object.entries(attr)[0];
            return {
              name,
              value,
              checked: false,
              isNegative: false,
              isSubstringMatch: false,
            };
          });
        } else {
          processedAttributes = Object.entries(attributes).map(
            ([name, value]) => ({
              name,
              value,
              checked: false,
              isNegative: false,
              isSubstringMatch: false,
            })
          );
        }

        setAttributeStates(processedAttributes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [getAttributes]);

  const updateAttribute = (index, field, value) => {
    const updated = [...attributeStates];
    updated[index] = { ...updated[index], [field]: value };
    setAttributeStates(updated);
  };

  const hasCheckedItems = attributeStates.some((attr) => attr.checked);

  const handleConfirm = (isSoftAssert) => {
    const selectedAssertions = attributeStates
      .filter((attr) => attr.checked)
      .map((attr) => ({
        attributeName: attr.name,
        value: attr.value,
        isNegative: attr.isNegative,
        isSubstringMatch: attr.isSubstringMatch,
      }));
    onConfirm(selectedAssertions, isSoftAssert);
  };

  return (
    <div
      id="floating-assert-attribute-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Assert Attribute Value</strong>
        </div>

        {loading && <div className="assert-loading">Loading attributes...</div>}
        {error && <div className="assert-error">Error: {error}</div>}
        {!loading && !error && attributeStates.length === 0 && (
          <div className="assert-empty">No attributes found</div>
        )}
        {!loading && !error && attributeStates.length > 0 && (
          <div className="assert-attributes-container">
            {attributeStates.map((attr, index) => (
              <div key={index} className="assert-attribute-row">
                <label className="assert-checkbox-container">
                  <input
                    type="checkbox"
                    className="assert-checkbox"
                    checked={attr.checked}
                    onChange={(e) =>
                      updateAttribute(index, "checked", e.target.checked)
                    }
                  />
                </label>

                <input
                  type="text"
                  className="assert-input assert-attribute-name"
                  value={attr.name}
                  readOnly
                  disabled
                />

                <button
                  className="assert-toggle-button-neg-pos"
                  title={
                    attr.isNegative ? "Assert not equals" : "Assert equals"
                  }
                  onClick={() =>
                    updateAttribute(index, "isNegative", !attr.isNegative)
                  }
                >
                  {attr.isNegative ? "≠" : "="}
                </button>

                <input
                  type="text"
                  className="assert-input assert-attribute-value"
                  value={attr.value}
                  onChange={(e) =>
                    updateAttribute(index, "value", e.target.value)
                  }
                />
                <button
                  className="assert-toggle-button-neg-pos"
                  title={
                    attr.isSubstringMatch ? "Substring match" : "Exact match"
                  }
                  onClick={() =>
                    updateAttribute(
                      index,
                      "isSubstringMatch",
                      !attr.isSubstringMatch
                    )
                  }
                >
                  {attr.isSubstringMatch ? "contains" : "exact"}
                </button>
                {/* <label
                  className="assert-checkbox-container assert-toggle"
                  title={
                    attr.isSubstringMatch ? "Substring match" : "Equality match"
                  }
                >
                  <input
                    type="checkbox"
                    className="assert-checkbox"
                    checked={attr.isSubstringMatch}
                    onChange={(e) =>
                      updateAttribute(
                        index,
                        "isSubstringMatch",
                        e.target.checked
                      )
                    }
                  />
                  <span className="assert-toggle-label">
                    {attr.isSubstringMatch ? "contains" : "whole string"}
                  </span>
                </label> */}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="docked-pane-footer-confirm-cancel">
        <div className="docked-pane-footer-assert-container">
          <input
            type="checkbox"
            checked={softAssert}
            onChange={() => setSofAssert((prev) => !prev)}
          ></input>
          <label>Soft Assert</label>
        </div>
        <div className="docked-pane-footer-buttons">
          <button
            className="docked-pane-footer-cancel-button"
            onClick={onCancel}
          >
            ❌
          </button>
          <button
            className="docked-pane-footer-confirm-button"
            // onClick={handleConfirm}
            onClick={() => {
              handleConfirm(softAssert);
              // onConfirm(expected, softAssert);
              setSofAssert(false);
            }}
            disabled={!hasCheckedItems}
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  );
}
