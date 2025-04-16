import React from "react";

export default function SelectorPicker({ step, onSelectorChange }) {
  const { selectors } = step;

  if (!selectors?.all?.length) return null;

  return (
    <div style={{ marginTop: 4 }}>
      <strong>Selector:</strong>
      {selectors.all.map((sel, i) => (
        <div key={i}>
          <label>
            <input
              type="radio"
              name={`selector-${step._id}`}
              checked={selectors.preferred?.value === sel.value}
              onChange={() => onSelectorChange(step._id, sel)}
            />
            <code>
              {sel.type}: {sel.value}
            </code>
          </label>
        </div>
      ))}
    </div>
  );
}
