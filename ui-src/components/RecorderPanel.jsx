import React, { useState, useEffect, useRef } from "react";

export default function RecorderPanel() {
  const panelRef = useRef(null);
  const [recording, setRecording] = useState(true);
  const [steps, setSteps] = useState([]);
  const [mode, setMode] = useState(window.__recorderStore.getMode());

  useEffect(() => {
    const unsubscribe = window.__recorderStore.subscribeToActions((updated) => {
      const withIds = updated.map((step, i) => ({
        ...step,
        _id: step._id || i,
        selectors: {
          all: Array.isArray(step.selectors)
            ? step.selectors
            : Object.entries(step.selectors || {}).map(([type, value]) => ({
                type,
                value,
              })),
          preferred: step.selectors?.preferred || null,
        },
      }));
      setSteps(withIds);
    });

    const unsubMode = window.__recorderStore.subscribeToMode(setMode);
    return () => {
      unsubscribe();
      unsubMode();
    };
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

  const stop = () => {
    window.stopRecording();
  };

  const toggleMode = (nextMode) => {
    const isSame = mode === nextMode;
    const newMode = isSame ? "record" : nextMode;
    window.__recorderStore.setMode(newMode);
    const evt = new MouseEvent("mousemove", { bubbles: true });
    document.dispatchEvent(evt);
  };

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
        className={mode === "inspect" ? "active" : ""}
        onClick={() => toggleMode("inspect")}
      >
        🖱️
      </button>
      <button
        title="Assert visibility"
        className={mode === "visibility" ? "active" : ""}
        onClick={() => toggleMode("visibility")}
        // onMouseDown={(e) => e.preventDefault()}
      >
        👁️
      </button>
      <button
        title="Assert text"
        className={mode === "text" ? "active" : ""}
        onClick={() => toggleMode("text")}
      >
        🆎
      </button>
      <button
        title="Assert value"
        className={mode === "value" ? "active" : ""}
        onClick={() => toggleMode("value")}
        // onMouseDown={(e) => e.preventDefault()}
      >
        📝
      </button>

      <button
        title="More assertions"
        onClick={() => alert("More coming soon!")}
      >
        ⋮
      </button>
    </div>
  );
}
