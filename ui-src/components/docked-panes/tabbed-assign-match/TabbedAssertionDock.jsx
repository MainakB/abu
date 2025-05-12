import React, { useState, useRef, useLayoutEffect } from "react";

export default function TabbedAssertionDock({ tabs = [], defaultTab = null }) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.key ?? "");

  const ActiveComponent = tabs.find((tab) => tab.key === activeTab)?.component;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Floating tab selector, fixed at same spot as your old dock */}
      <div
        className="tabbed-dock-tabs-wrapper"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "static",
          minWidth: "420px",
          maxHeight: "80vh",
          left: "20px",
          zIndex: "2147483647",
          background: "var(--recorder-bg-color)",
          border: "1px solid var(--recorder-border-color)",
          borderRadius: "10px 10px 0 0",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tabbed-dock-tab-button ${
              activeTab === tab.key ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              fontWeight: "bold",
              background:
                activeTab === tab.key ? "#fff" : "var(--recorder-button-bg)",
              color: activeTab === tab.key ? "#007bff" : "inherit",
              cursor: "pointer",
              borderBottom:
                activeTab === tab.key ? "2px solid #007bff" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Let each component render its own full UI, including .floating-cookie-list-dock */}
      {ActiveComponent}
    </div>
  );
}
