import React, { useState, useEffect, useRef } from "react";

export default function RecorderPanel() {
  const panelRef = useRef(null);
  // const [recording, setRecording] = useState(true);
  const [steps, setSteps] = useState([]);
  const [mode, setMode] = useState(window.__recorderStore.getMode());
  const [tickMap, setTickMap] = useState({
    text: false,
    value: false,
    visibility: false,
  });
  const previousMode = useRef(window.__recorderStore.getMode());

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

    // const unsubMode = window.__recorderStore.subscribeToMode(setMode);
    const unsubMode = window.__recorderStore.subscribeToMode((newMode) => {
      const prev = previousMode.current;

      if (
        ["text", "value", "visibility"].includes(prev) &&
        newMode === "record"
      ) {
        // ✅ Show tick for the previous assertion mode
        setTickMap((prevMap) => ({
          ...prevMap,
          [prev]: true,
        }));

        setTimeout(() => {
          setTickMap((prevMap) => ({
            ...prevMap,
            [prev]: false,
          }));
        }, 1000);
      }
      setMode(newMode);
      previousMode.current = newMode;
    });

    return () => {
      unsubscribe();
      unsubMode();
    };
  });

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

  const dispatchEvent = () => {
    const evt = new MouseEvent("mousemove", { bubbles: true });
    document.dispatchEvent(evt);
  };

  const toggleRecording = async () => {
    const recorderState = await window.__toggleRecording();
    await window.__recorderStore.setMode(recorderState, false);
    dispatchEvent();
  };

  const stop = () => {
    window.stopRecording();
  };

  const getClassNameForAssert = (savedMode, selecetMode) => {
    return `recorder-button${
      savedMode === selecetMode ? " active blinking" : ""
    }`;
  };

  const toggleMode = async (nextMode) => {
    const isSame = mode === nextMode;
    const newMode = isSame ? "record" : nextMode;
    await window.__recorderStore.setMode(newMode);
    const evt = new MouseEvent("mousemove", { bubbles: true });
    document.dispatchEvent(evt);
  };

  return (
    <div className="recorder-panel" ref={panelRef}>
      <div className="recorder-drag-handle" title="Drag toolbar">
        ⠿
      </div>
      <button onClick={async () => await toggleRecording()}>
        {mode === "pause" ? "▶️" : "⏸"}
        {/* {mode !== "pause" ? "⏸" : "▶️"} */}
      </button>
      <button onClick={stop} title="Stop Recording">
        ❌
      </button>

      <button
        title="Inspect element"
        className={getClassNameForAssert(mode, "inspect")}
        onClick={async () => await toggleMode("inspect")}
      >
        🖱️
      </button>
      <button
        title="Assert visibility"
        className={getClassNameForAssert(mode, "visibility")}
        onClick={async () => await toggleMode("visibility")}
      >
        {tickMap.visibility ? "✅" : "👁️"}
      </button>
      <button
        title="Assert text"
        className={getClassNameForAssert(mode, "text")}
        onClick={async () => await toggleMode("text")}
      >
        {tickMap.text ? "✅" : "🆎"}
      </button>
      <button
        title="Assert value"
        className={getClassNameForAssert(mode, "value")}
        onClick={async () => await toggleMode("value")}
      >
        {tickMap.value ? "✅" : "📝"}
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
