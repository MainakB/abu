if (!window.__recorderStore) {
  let assertMode = "record";
  const assertListeners = [];
  const actionListeners = [];
  const actions = [];

  window.__recorderStore = {
    // MODE PUB-SUB
    getMode: () => assertMode,
    setMode: (newMode) => {
      assertMode = newMode;
      assertListeners.forEach((fn) => fn(newMode));
    },
    subscribeToMode: (fn) => {
      assertListeners.push(fn);
      return () => {
        const idx = assertListeners.indexOf(fn);
        if (idx !== -1) assertListeners.splice(idx, 1);
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

  console.log("✅ recorderStore initialized");
}
