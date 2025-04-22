import React, { useState, useEffect, useRef } from "react";
import MoreOptionsDrawer from "./MoreOptionsDrawer";
import { ASSERTIONMODES } from "../constants/index.js";

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
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    assertions: false,
    actions: false,
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

    const unsubMode = window.__recorderStore.subscribeToMode((newMode) => {
      const prev = previousMode.current;

      if (
        Object.values(ASSERTIONMODES).includes(prev) &&
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      const panel = panelRef.current;
      const drawer = document.querySelector(".drawer");

      if (
        panel &&
        !panel.contains(e.target) &&
        drawer &&
        !drawer.contains(e.target)
      ) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    window.__stopRecording();
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

  const toggleModeLaunchDock = async (nextMode) => {
    const isSame = mode === nextMode;
    const newMode = isSame ? "record" : nextMode;
    await window.__recorderStore.setMode(newMode);
    const evt = new MouseEvent("mousemove", { bubbles: true });
    document.dispatchEvent(evt);
    await window.showFloatingAssert(newMode, undefined, undefined, newMode);
    setDrawerOpen(false);
  };

  const toggleModeOnMonoStep = async (nextMode) => {
    const isSame = mode === nextMode;
    const newMode = isSame ? "record" : nextMode;
    await window.__recorderStore.setMode(newMode);
    const evt = new MouseEvent("mousemove", { bubbles: true });
    document.dispatchEvent(evt);
    if (newMode === ASSERTIONMODES.TAKESCREENSHOT) {
      await Promise.all([
        window.__recordAction(
          window.__buildData({
            action: "takeScreenshot",
          })
        ),
        window.__recorderStore.setMode("record"),
      ]);
    } else if (newMode === ASSERTIONMODES.PAGERELOAD) {
      await Promise.all([
        window.__recordAction(
          window.__buildData({
            action: "pageReload",
          })
        ),
        window.__recorderStore.setMode("record"),
      ]);
      await window.__pageReload();
    }

    setDrawerOpen(false);
  };

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);
  const toggleSection = (section) => {
    setExpanded((prev) => {
      // If the clicked section is already open, just close it
      if (prev[section]) {
        return { ...prev, [section]: false };
      }

      // Otherwise, close all sections and open the clicked one
      return {
        assertions: section === "assertions",
        actions: section === "actions",
      };
    });
  };
  // const toggleSection = (section) =>
  //   setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  return (
    <div className="recorder-panel" ref={panelRef}>
      <div className="recorder-panel-inner">
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
          className={getClassNameForAssert(mode, ASSERTIONMODES.VISIBILITY)}
          onClick={async () => await toggleMode(ASSERTIONMODES.VISIBILITY)}
        >
          {tickMap.visibility ? "✅" : "👁️"}
        </button>
        <button
          title="Assert text"
          className={getClassNameForAssert(mode, ASSERTIONMODES.TEXT)}
          onClick={async () => await toggleMode(ASSERTIONMODES.TEXT)}
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

        <button title="More assertions" onClick={toggleDrawer}>
          ⋮
        </button>
        {isDrawerOpen && (
          <div className="drawer-anchor">
            <MoreOptionsDrawer
              isOpen={isDrawerOpen}
              onClose={toggleDrawer}
              expanded={expanded}
              onToggleSection={toggleSection}
              onMenuSelectionLaunchDock={toggleModeLaunchDock}
              onMenuSelection={toggleMode}
              getClassName={getClassNameForAssert}
              currentMode={mode}
              onMenuSelectionMonoStep={toggleModeOnMonoStep}
            />
          </div>
        )}
      </div>
    </div>
  );
}
