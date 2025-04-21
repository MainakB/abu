(() => {
  const getAssociatedLabel = (el) => {
    if (!el.id) return null;
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    return labelEl?.innerText?.trim() || null;
  };

  const getCheckboxStatus = (el) => {
    if (!el) return null;
    try {
      return el.checked;
    } catch (err) {
      return null;
    }
  };

  const getCheckboxIndex = (el) => {
    if (!el) return -1;
    try {
      const idx = Array.from(el.parentElement.childNodes)
        .filter((v) => v.type === "checkbox")
        .findIndex((node) => node.isSameNode(el));
      return idx >= 0 ? idx + 1 : idx;
    } catch (err) {
      return -1;
    }
  };

  window.__buildData = ({
    action,
    assertion,
    expected,
    el,
    e,
    value = null,
    text = null,
    selectOptionIndex = null,
    isSoftAssert = false,
    cookies,
  }) => {
    if (action === "addCookies" || action === "deleteCookies") {
      return {
        action,
        cookies,
      };
    }
    const { selectors, attributes } = window.__getSelectors(el);
    return {
      action,
      ...(assertion ? { assertion } : {}),
      ...(expected ? { expected } : {}),
      tagName: el.tagName.toLowerCase(),
      selectors,
      attributes: {
        ...(attributes || {}),
        associatedLabel: getAssociatedLabel(el),
        ...(attributes.type &&
        attributes.type === "checkbox" &&
        getCheckboxStatus(el) !== null
          ? {
              checked: getCheckboxStatus(el),
              checkboxIndex: getCheckboxIndex(el),
            }
          : {}),
      },
      position: e ? { x: e.pageX, y: e.pageY } : null,
      value,
      text,
      selectOptionIndex,
      isSoftAssert,
    };
  };

  window.__recordAction = async (data) => {
    await fetch("http://localhost:3111/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("✅ Step added:", data);
  };

  const syncRecorderState = async () => {
    try {
      let isPaused = window.__recorderStore.getMode() === "pause";
      await window.__syncRecorderStatusOnInternalSwitchTab();
    } catch (err) {}
  };

  window.__isPaused = async () => {
    await syncRecorderState();
    const mode = window.__recorderStore?.getMode?.() || "record";
    return mode === "pause";
  };

  window.__maybeRecordTabSwitch = async (calledFrom, temp) => {
    const isPaused = await window.__isPaused();
    if (isPaused) return;
    const isInitialPage = localStorage.getItem("isInitialPage") === "true";
    const activeTabId = localStorage.getItem("activeTabId");
    const thisTabId = sessionStorage.getItem("tabId");
    if (isInitialPage || activeTabId === thisTabId) return;

    const title = sessionStorage.getItem("title");
    const url = sessionStorage.getItem("url");

    const now = Date.now();
    const key = `${calledFrom}-${thisTabId}`;

    await fetch("http://localhost:3111/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "switchToWindow",
        tabId: thisTabId,
        attributes: {
          eventKey: key,
          url: url || "",
          title: title || "",
        },
        timestamp: Date.now(),
      }),
    });

    localStorage.setItem("activeTabId", thisTabId);
  };

  window.__setupDomObserver = () => {
    const target = document.documentElement;
    if (!target) {
      console.warn(
        "❗ document.documentElement not ready for MutationObserver. Retrying..."
      );
      setTimeout(setupDomObserver, 100); // Retry after 100ms
      return;
    }

    const observer = new MutationObserver(() => {
      const exists = document.getElementById("recorder-panel-root");
      if (!exists) {
        console.warn("⚠️ Recorder panel missing. Reinjecting...");
        initializeRecorderPanel();
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  };
})();
