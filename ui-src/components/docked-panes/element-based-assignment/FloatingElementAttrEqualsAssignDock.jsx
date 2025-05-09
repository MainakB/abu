import React, { useState, useRef, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import {
  onConfirmAttrEqlValAssignment,
  getElementAttributes,
} from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

export default function FloatingElementAttrEqualsAssignDock({
  el,
  e,
  textValue,
  mode,
  onCancel,
}) {
  const varNameInputRef = useRef(null);
  const [locatorName, setLocatorName] = useState("");
  const [varName, setVarName] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrIndex, setSelectedAttrIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useModeSocket(onCancel);

  useEffect(() => {
    if (varNameInputRef.current) {
      varNameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const attributes = await getElementAttributes(el);
        // Handle both object and array formats
        let processedAttributes;
        if (Array.isArray(attributes)) {
          processedAttributes = attributes.map((attr) => {
            const [name, value] = Object.entries(attr)[0];
            return {
              name,
              value,
              // checked: shouldCheck,
              isNegative: false,
              isSubstringMatch: false,
            };
          });
        } else {
          processedAttributes = Object.entries(attributes).map(
            ([name, value]) => {
              return {
                name,
                value,
                // checked: shouldCheck,
                isNegative: false,
                isSubstringMatch: false,
              };
            }
          );
        }

        setAttributes(processedAttributes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [el]);

  const updateAttribute = (index, field, value) => {
    setAttributes((prevAttributes) =>
      prevAttributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    );
  };

  const handleConfirm = () => {
    if (
      !varName.trim() ||
      selectedAttrIndex === null ||
      !attributes[selectedAttrIndex]
    )
      return;

    const selectedAttr = attributes[selectedAttrIndex];

    const selectedAssertions = {
      attributeName: selectedAttr.name,
      value: selectedAttr.value,
      isNegative: selectedAttr.isNegative,
      isSubstringMatch: selectedAttr.isSubstringMatch,
    };

    onConfirmAttrEqlValAssignment({
      varName,
      locatorName,
      onCancel,
      el,
      e,
      textValue,
      mode,
      selectedAssertions,
    });
  };

  return (
    <div
      id="floating-cookie-list-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Is Element Attribute Equals/Contains</strong>
        </div>
      </div>
      <div className="pdf-text-container">
        <div className="locator-name-container">
          <label>Variable Name (Required)</label>
          <input
            ref={varNameInputRef}
            type="text"
            className="cookie-input"
            value={varName}
            onChange={(e) => setVarName(e.target.value)}
            placeholder="Enter variable name.."
          />
        </div>
      </div>
      {loading && <div className="assert-loading">Loading attributes...</div>}
      {error && <div className="assert-error">Error: {error}</div>}
      {!loading && !error && attributes.length === 0 && (
        <div className="assert-empty">No attributes found</div>
      )}
      {!loading && !error && attributes.length > 0 && (
        <div className="assert-attributes-container">
          {attributes.map((attr, index) => (
            <div key={index} className="assert-attribute-row">
              <label className="assert-checkbox-container">
                <input
                  type="radio"
                  name="attributeSelect"
                  className="assert-checkbox"
                  checked={selectedAttrIndex === index}
                  onChange={() => setSelectedAttrIndex(index)}
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
                title={attr.isNegative ? "Assert not equals" : "Assert equals"}
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
                readOnly
                disabled
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
            </div>
          ))}
        </div>
      )}

      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        onCancel={onCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={varName.trim() === "" || selectedAttrIndex === null}
      />
    </div>
  );
}
