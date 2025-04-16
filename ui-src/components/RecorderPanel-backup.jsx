import React, { useState, useEffect, useRef } from "react";
// import "./../style.css"; // Moved to index.jsx
// import JsonPreview from "./JsonPreview"; // To be used later

export default function RecorderPanel() {
  const panelRef = useRef(null);
  const [recording, setRecording] = useState(true);
  const [steps, setSteps] = useState([]);
  // const [assertMode, setAssertMode] = useState(null);
  const [assertMode, setAssertMode] = useState(
    window.__recorderStore?.mode === "record"
      ? null
      : window.__recorderStore?.mode
  );

  useEffect(() => {
    const unsubscribe = window.__recorderStore.subscribeToMode((newMode) => {
      setAssertMode(newMode === "record" ? null : newMode);
    });
    return unsubscribe;
  }, []);

  // useEffect(() => {
  //   const unsubscribe = window.__recorderStore.subscribeToActions((updated) => {
  //     const withIds = updated.map((step, i) => ({
  //       ...step,
  //       _id: step._id || i,
  //       selectors: {
  //         all: Array.isArray(step.selectors)
  //           ? step.selectors
  //           : Object.entries(step.selectors || {}).map(([type, value]) => ({
  //               type,
  //               value,
  //             })),
  //         preferred: step.selectors?.preferred || null,
  //       },
  //     }));
  //     setSteps(withIds);
  //   });

  //   return unsubscribe;
  // }, []);

  useEffect(() => {
    const unsubscribe = window.__recorderStore.subscribeToActions(
      (updatedSteps) => {
        // Ensure _id is attached, but don't touch selector structure anymore
        const withIds = updatedSteps.map((step, i) => ({
          ...step,
          _id: step._id ?? i,
        }));

        setSteps(withIds);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const dragHandle = document.querySelector(".recorder-drag-handle");
    const panel = panelRef.current;
    if (!dragHandle || !panel) return;

    let isDragging = false;
    let offsetX = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - panel.getBoundingClientRect().left;
      panel.style.transition = "none";
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const newLeft = e.clientX - offsetX;
      panel.style.left = `${newLeft}px`;
      panel.style.transform = "none";
    };

    const onMouseUp = () => {
      isDragging = false;
      panel.style.transition = "";
    };

    dragHandle.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      dragHandle.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const toggleRecording = () => {
    window.toggleRecording();
    setRecording(!recording);
  };

  // const toggleAssertMode = () => {
  //   setAssertMode((prev) => !prev);
  //   window.__recorderMode = !assertMode ? "assert" : "record";
  // };

  const stop = () => {
    window.stopRecording();
  };

  // const setMode = (mode) => {
  //   const newMode = assertMode === mode ? null : mode;
  //   setAssertMode(newMode);
  //   window.__recorderMode = newMode ?? "record";
  //   console.log("🔁 Mode changed to:", window.__recorderMode);
  //   // ✅ Manually fire a synthetic mousemove to reset hoverTarget
  //   const evt = new MouseEvent("mousemove", { bubbles: true });
  //   document.dispatchEvent(evt);
  // };
  const setMode = (mode) => {
    const newMode = assertMode === mode ? null : mode;
    window.__recorderStore.setMode(newMode ?? "record");
    // ✅ Manually fire a synthetic mousemove to reset hoverTarget
    const evt = new MouseEvent("mousemove", { bubbles: true });
    document.dispatchEvent(evt);
  };

  // const handleSelectorChange = (stepId, selectedSelector) => {
  //   setSteps((prev) =>
  //     prev.map((step) =>
  //       step._id === stepId
  //         ? {
  //             ...step,
  //             selectors: {
  //               ...step.selectors,
  //               preferred: selectedSelector,
  //             },
  //           }
  //         : step
  //     )
  //   );

  //   // Optional: persist change to store
  //   if (window.__recorderStore) {
  //     window.__recorderStore.actions = steps;
  //   }
  // };
  const handleSelectorChange = (stepId, selectedSelector) => {
    if (window.__recorderStore?.updateSelector) {
      window.__recorderStore.updateSelector(stepId, selectedSelector);
    }
  };

  const modeActive = (mode) => assertMode === mode;

  return (
    <div className="recorder-panel" ref={panelRef}>
      <div className="recorder-drag-handle" title="Drag toolbar">
        ⠿
      </div>
      <button onClick={toggleRecording}>{recording ? "⏸" : "▶️"}</button>
      <button onClick={stop} title="Stop Recording">
        ❌
      </button>

      <button
        title="Inspect element"
        className={modeActive("inspect") ? "active" : ""}
        onClick={() => setMode("inspect")}
      >
        🖱️
      </button>
      <button
        title="Assert visibility"
        className={modeActive("visibility") ? "active" : ""}
        onClick={() => setMode("visibility")}
      >
        👁️
      </button>
      <button
        title="Assert text"
        className={modeActive("text") ? "active" : ""}
        onClick={() => setMode("text")}
      >
        🆎
      </button>
      <button
        title="Assert value"
        className={modeActive("value") ? "active" : ""}
        onClick={() => setMode("value")}
      >
        📝
      </button>

      <button
        title="More assertions"
        onClick={() => alert("More coming soon!")}
      >
        ⋮
      </button>
      {/* <button
        onClick={toggleAssertMode}
        title="Assertion Mode"
        style={{
          animation: assertMode ? "blinker 1s linear infinite" : "none",
          color: assertMode ? "#e67e22" : "inherit", // optional tint
        }}
      >
        ≡
      </button> */}
      {/* <button title="Recorded Steps" disabled style={{ fontSize: "18px" }}>
        📋
      </button>
      <JsonPreview steps={steps} onSelectorChange={handleSelectorChange} /> */}
      {/* <JsonPreview steps={steps} onSelectorChange={handleSelectorChange} /> */}
    </div>
  );
}
