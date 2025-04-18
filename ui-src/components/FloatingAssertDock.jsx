import React, { useState, useEffect } from "react";

export default function FloatingAssertDock({ el, mode, onConfirm, onCancel }) {
  const [expected, setExpected] = useState(() => {
    if (mode === "text") return el?.innerText?.trim() || "";
    if (mode === "value") return el?.value || el?.getAttribute("value") || "";
    return "";
  });

  useEffect(() => {
    if (!el) return;
    if (mode === "text") {
      setExpected(el.innerText?.trim() || "");
    } else if (mode === "value") {
      setExpected(el.value || el.getAttribute("value") || "");
    }
  }, [el, mode]);

  return (
    <div
      id="floating-assert-dock-root"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        padding: "10px",
        background: "#fff",
        border: "1px solid #ccc",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 999999,
        minWidth: "320px",
        fontSize: "14px",
      }}
    >
      <div style={{ marginBottom: "6px" }}>
        <strong>
          Assert that element{" "}
          {mode === "text" ? "text equals " : "value equals "}
        </strong>
      </div>
      <textarea
        style={{ width: "100%", minHeight: "60px" }}
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
      />
      <div style={{ marginTop: "8px", textAlign: "right" }}>
        <button onClick={onCancel} style={{ marginRight: 6 }}>
          ❌
        </button>
        <button onClick={() => onConfirm(expected)} disabled={!expected}>
          ✅
        </button>
      </div>
    </div>
  );
}
