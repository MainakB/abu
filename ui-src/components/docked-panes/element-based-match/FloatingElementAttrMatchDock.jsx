import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../../constants/index.js";
import {
  onConfirmAttrMatchValAssignment,
  getElementAttributes,
} from "../../../../utils/componentLibs.js";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

import { useModeSocket } from "../../../hooks/useModeSocket.js";

const getAltMode = () => {
  return ASSERTIONMODES.MATCHATTRIBUTEEQUALS;
};

export default function FloatingElementAttrMatchDock({
  el,
  e,
  textValue,
  mode,
  onCancel,
  tabbed,
  overrideConfirmCancelFlexEnd,
}) {
  const [locatorName, setLocatorName] = useState("");
  const [varNameError, setVarNameError] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useModeSocket(onCancel);

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
              isSoftAssert: false,
              checked: false,
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
                isSoftAssert: false,
                checked: false,
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

  const handleCancel = () => {
    setLocatorName("");
    setVarNameError("");
    setAttributes([]);
    setLoading(true);
    setError(null);
    onCancel();
  };

  const handleConfirm = () => {
    // const selectedAssertions = {
    //   attributeName: selectedAttr.name,
    //   value: selectedAttr.value,
    //   isNegative: selectedAttr.isNegative,
    //   isSubstringMatch: selectedAttr.isSubstringMatch,
    //   isSoftAssert: selectedAttr.isSoftAssert,
    // };
    const selectedAssertions = attributes
      .filter((attr) => attr.checked)
      .map((attr) => ({
        attributeName: attr.name,
        value: attr.value,
        isNegative: attr.isNegative,
        isSubstringMatch: attr.isSubstringMatch,
        isSoftAssert: attr.isSoftAssert,
        locatorName,
      }));

    onConfirmAttrMatchValAssignment({
      el,
      e,
      selectedAssertions: selectedAssertions,
      locatorName,
      closeDock: handleCancel,
      textValue,
      mode: getAltMode(),
    });
  };

  const shouldNotShowLocator = loading || error || attributes.length === 0;
  const hasCheckedItems = attributes.some((attr) => attr.checked);

  const toggleSelectAll = () => {
    const allSelected = attributes.every((attr) => attr.checked);
    setAttributes((prevAttributes) =>
      prevAttributes.map((attr) => ({
        ...attr,
        checked: !allSelected, // If all selected, unselect; otherwise select all
      }))
    );
  };

  let wrapperClassName = "floating-cookie-list-dock";
  if (tabbed && !shouldNotShowLocator) {
    if (overrideConfirmCancelFlexEnd) {
      wrapperClassName = "floating-tab-list-dock-justifyend";
    } else {
      wrapperClassName = "floating-tab-list-dock";
    }
  }

  return (
    <div
      id={wrapperClassName}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Is Element Attribute Equals/Contains</strong>
        </div>
      </div>
      {loading && <div className="assert-loading">Loading attributes...</div>}
      {error && <div className="assert-error">Error: {error}</div>}
      {!loading && !error && attributes.length === 0 && (
        <div className="assert-dock-content">
          <div className="assert-empty">No attributes found</div>
        </div>
      )}
      {!loading && !error && attributes.length > 0 && (
        <div className="assert-attributes-container">
          <div className="assert-attributes-container-wrapper">
            <button
              className="assert-toggle-button-neg-pos"
              type="button"
              onClick={toggleSelectAll}
            >
              {attributes.every((attr) => attr.checked)
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          {attributes.map((attr, index) => (
            <div key={index} className="assert-attribute-row">
              <label className="assert-checkbox-container">
                <input
                  type="checkbox"
                  name="attributeSelect"
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
              <button
                className="assert-toggle-button-neg-pos"
                title={attr.isSoftAssert ? "Soft Match" : "Match"}
                onClick={() =>
                  updateAttribute(index, "isSoftAssert", !attr.isSoftAssert)
                }
              >
                {attr.isSoftAssert ? "sMatch" : "match"}
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmCancelFooter
        // locatorName={locatorName}
        // setLocatorName={setLocatorName}
        onCancel={onCancel}
        onConfirm={handleConfirm}
        disableAutoFocus={true}
        disabled={!hasCheckedItems}
        {...(!shouldNotShowLocator ? { locatorName, setLocatorName } : {})}
      />
    </div>
  );
}
