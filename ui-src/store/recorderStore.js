if (!window.__recorderStore) {
  const MODE_KEY = "recorderMode";
  const listeners = [];
  const actionListeners = [];
  const actions = [];
  let mode = "record";

  // 🔹 Track active tab ID broadcast by server
  // let activeTabId = tabId; // default to self if not received yet
  let activeTabId = null;

  const socket = new WebSocket("ws://localhost:8787");

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "mode") {
        mode = data.mode;
        localStorage.setItem(MODE_KEY, mode);
        listeners.forEach((fn) => fn(mode));
      }

      if (data.type === "set-active-tab") {
        activeTabId = data.tabId;
      }
    } catch {}
  });

  window.__recorderStore = {
    getActiveTabId: () => activeTabId,
    setActiveTabId: (currentTabId) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "set-active-tab",
            tabId: currentTabId,
          })
        );
      }
    },
    maybeUpdateActiveTabId: (tabId) => {
      if (activeTabId !== tabId) {
        window.__recorderStore.setActiveTabId(tabId);
        return true;
      }
      return false;
    },

    // //////////
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
