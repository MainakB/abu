import React, { useState } from "react";
import "./assertAttributeValueDock.css";

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

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const attributes = await getAttributes();

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

  const handleConfirm = () => {
    const selectedAssertions = attributeStates
      .filter((attr) => attr.checked)
      .map((attr) => ({
        attributeName: attr.name,
        value: attr.value,
        isNegative: attr.isNegative,
        isSubstringMatch: attr.isSubstringMatch,
      }));
    onConfirm(selectedAssertions);
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

              <input
                type="text"
                className="assert-input assert-attribute-value"
                value={attr.value}
                onChange={(e) =>
                  updateAttribute(index, "value", e.target.value)
                }
              />

              <label
                className="assert-checkbox-container assert-toggle"
                title={
                  attr.isNegative ? "Assert not contains" : "Assert contains"
                }
              >
                <input
                  type="checkbox"
                  className="assert-checkbox"
                  checked={attr.isNegative}
                  onChange={(e) =>
                    updateAttribute(index, "isNegative", e.target.checked)
                  }
                />
                <span className="assert-toggle-label">
                  {attr.isNegative ? "≠" : "="}
                </span>
              </label>

              <label
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
                    updateAttribute(index, "isSubstringMatch", e.target.checked)
                  }
                />
                <span className="assert-toggle-label">
                  {attr.isSubstringMatch ? "∈" : "=="}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="assert-dock-footer">
        <button className="assert-cancel-button" onClick={onCancel}>
          ❌
        </button>
        <button
          className="assert-confirm-button"
          onClick={handleConfirm}
          disabled={!hasCheckedItems}
        >
          ✅
        </button>
      </div>
    </div>
  );
}
