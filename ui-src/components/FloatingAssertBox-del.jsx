import React, { useState, useEffect } from "react";

export default function FloatingAssertBox({
  x,
  y,
  el,
  mode,
  onConfirm,
  onCancel,
}) {
  const [type, setType] = useState(mode || "visible");
  const [expected, setExpected] = useState("");

  const needsExpected = type === "text" || type === "value";

  useEffect(() => {
    if (mode === "text" && el?.innerText) {
      setExpected(el.innerText.trim());
    } else if (mode === "value" && el?.value) {
      setExpected(el.value);
    }
  }, [mode, el]);

  return (
    <div
      style={{
        position: "absolute",
        top: y + 10,
        left: x + 10,
        padding: "8px",
        background: "#fff",
        border: "1px solid #ccc",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 999999,
        fontSize: "12px",
        width: "220px",
      }}
    >
      <div>
        <strong>Assert:</strong> {el.tagName.toLowerCase()}
      </div>
      <div style={{ marginTop: 4 }}>
        <label>
          Type:&nbsp;
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="visible">visible</option>
            <option value="text">text equals</option>
            <option value="value">input value</option>
          </select>
        </label>
      </div>
      {needsExpected && (
        <div style={{ marginTop: 4 }}>
          <input
            placeholder="Expected value"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
      )}
      <div style={{ marginTop: 6, textAlign: "right" }}>
        <button onClick={() => onCancel()} style={{ marginRight: 6 }}>
          ❌
        </button>
        <button
          onClick={() => onConfirm({ type, expected })}
          disabled={needsExpected && !expected}
        >
          ✅
        </button>
      </div>
    </div>
  );
}
