if (!window.__recorderStore) {
  window.__recorderStore = {
    mode: "record",
    actions: [],
    listeners: [],
    actionListeners: [],

    /**
     * Sets the current mode and notifies subscribers.
     * @param {string} newMode - One of: "record", "text", "value", "visibility", etc.
     */
    setMode(newMode) {
      this.mode = newMode;
      this.listeners.forEach((fn) => fn(newMode));
    },

    /**
     * Subscribes to mode changes.
     * @param {function} fn - Callback invoked on every mode change.
     * @returns {function} Unsubscribe function
     */
    subscribe(fn) {
      this.listeners.push(fn);
      return () => {
        this.listeners = this.listeners.filter((f) => f !== fn);
      };
    },

    // Action Management
    addAction(action) {
      this.actions.push(action);
      this.actionListeners.forEach((fn) => fn([...this.actions]));
    },

    subscribeToActions(fn) {
      this.actionListeners.push(fn);
      return () => {
        this.actionListeners = this.actionListeners.filter((f) => f !== fn);
      };
    },

    updateSelector(stepId, newPreferred) {
      const index = this.actions.findIndex((step) => step._id === stepId);
      if (index === -1) return;

      const updated = {
        ...this.actions[index],
        selectors: {
          ...this.actions[index].selectors,
          preferred: newPreferred,
        },
      };

      this.actions[index] = updated;
      this.actionListeners.forEach((fn) => fn([...this.actions]));
    },
  };

  console.log("✅ recorderStore initialized");
}
