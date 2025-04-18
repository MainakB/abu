if (!window.__recorderStore) {
  const MODE_KEY = "recorderMode";
  const listeners = [];
  const actionListeners = [];
  const actions = [];
  let mode = "record";

  const socket = new WebSocket("ws://localhost:8787");

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "mode") {
        mode = data.mode;
        localStorage.setItem(MODE_KEY, mode);
        listeners.forEach((fn) => fn(mode));
      }
    } catch {}
  });

  window.__recorderStore = {
    getMode: () => mode,
    setMode: async (newMode, callToggle = true) => {
      mode = newMode;
      callToggle && (await window.__toggleRecording());
      // localStorage.setItem(MODE_KEY, newMode);
      socket.readyState === WebSocket.OPEN &&
        socket.send(JSON.stringify({ type: "mode", mode: newMode }));
      listeners.forEach((fn) => fn(newMode));
    },
    subscribeToMode: (fn) => {
      listeners.push(fn);
      fn(mode);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },

    // ACTIONS PUB-SUB
    actions,
    addAction: (action) => {
      actions.push(action);
      actionListeners.forEach((fn) => fn([...actions]));

      // 🟢 New: Send to local server for persistence
      try {
        fetch("http://localhost:3111/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });
      } catch (err) {
        console.warn("⚠️ Failed to sync action with server:", err);
      }
    },

    subscribeToActions: (fn) => {
      actionListeners.push(fn);
      return () => {
        const idx = actionListeners.indexOf(fn);
        if (idx !== -1) actionListeners.splice(idx, 1);
      };
    },

    updateSelector: (stepId, newPreferred) => {
      const index = actions.findIndex((step) => step._id === stepId);
      if (index === -1) return;

      actions[index] = {
        ...actions[index],
        selectors: {
          ...actions[index].selectors,
          preferred: newPreferred,
        },
      };

      actionListeners.forEach((fn) => fn([...actions]));
    },
  };

  console.log("✅ recorderStore (WebSocket version) initialized");
}
