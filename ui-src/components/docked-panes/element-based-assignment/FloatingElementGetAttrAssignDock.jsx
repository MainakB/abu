import React, { useState, useRef, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import {
  onConfirmGetAttrValAssignment,
  getElementAttributes,
} from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";
import VarName from "../variable-name/VarName.jsx";
import { useModeSocket } from "../../../hooks/useModeSocket.js";

export default function FloatingElementGetAttrAssignDock({
  el,
  e,
  textValue,
  mode,
  onCancel,
}) {
  const [locatorName, setLocatorName] = useState("");
  const [varName, setVarName] = useState("");
  const [varNameError, setVarNameError] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [selectedAttrIndex, setSelectedAttrIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useModeSocket(onCancel);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const attrObj = await getElementAttributes(el);
        const processed = Object.entries(attrObj).map(([name, value]) => ({
          name,
          value,
        }));
        setAttributes(processed);
        setSelectedAttrIndex(processed.length > 0 ? 0 : null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [el]);

  const updateAttribute = (index, field, value) => {
    setAttributeStates((prevAttributes) =>
      prevAttributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    );
  };

  const handleConfirm = () => {
    if (!varName.trim() || selectedAttrIndex === null) return;

    const selectedAttr = attributes[selectedAttrIndex];
    const selectedAssertions = {
      attributeName: selectedAttr.name,
      value: selectedAttr.value,
    };

    onConfirmGetAttrValAssignment({
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
      // id="floating-assert-dock-root-container"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Get Element Attribute</strong>
        </div>
      </div>
      {loading && <div className="assert-loading">Loading attributes...</div>}
      {error && <div className="assert-error">Error: {error}</div>}
      {!loading && !error && attributes.length === 0 && (
        <div className="assert-empty">No attributes found</div>
      )}
      <div className="pdf-text-container">
        <VarName
          varName={varName}
          setVarName={setVarName}
          varNameError={varNameError}
          setVarNameError={setVarNameError}
        />
        {/* Attribute Selector */}
        {attributes.length > 0 && selectedAttrIndex !== null && (
          <div className="locator-name-container">
            <label>Select Attribute</label>
            <select
              className="cookie-input"
              value={selectedAttrIndex}
              onChange={(e) => setSelectedAttrIndex(Number(e.target.value))}
            >
              {attributes.map((attr, index) => (
                <option key={index} value={index}>
                  {attr.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Attribute Value Display */}
        {selectedAttrIndex !== null && (
          <div className="locator-name-container">
            <label>Attribute Value (Read Only)</label>
            <input
              type="text"
              className="cookie-input"
              value={attributes[selectedAttrIndex].value}
              readOnly
              disabled
            />
          </div>
        )}
      </div>
      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        onCancel={onCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={
          varName.trim() === "" || !!varNameError || selectedAttrIndex === null
        }
      />
    </div>
  );
}
