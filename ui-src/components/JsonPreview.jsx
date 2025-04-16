import React from "react";
import SelectorPicker from "./SelectorPicker";

export default function JsonPreview({ steps, onSelectorChange }) {
  return (
    <div style={{ maxHeight: 200, overflowY: "auto", fontSize: "11px" }}>
      {steps.map((step, index) => (
        <div
          key={step._id || index}
          style={{
            borderBottom: "1px solid #ccc",
            paddingBottom: 8,
            marginBottom: 8,
          }}
        >
          <strong>{step.action}</strong> on <code>{step.tagName}</code>{" "}
          {step.text && <span>"{step.text}"</span>}
          <SelectorPicker step={step} onSelectorChange={onSelectorChange} />
        </div>
      ))}
    </div>
  );
}
