(() => {
  const ws = new WebSocket("ws://localhost:8787");
  let activeIFrame = null;
  ws.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "iframe-detected") {
        activeIFrame = data.activeIFrame;
      }
    } catch {}
  });

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

  const syncRecorderState = () => {
    try {
      let isPaused = window.__recorderStore.getMode() === "pause";
      window.__syncRecorderStatusOnInternalSwitchTab();
    } catch (err) {}
  };

  const buildOptionalField = (name, value) => {
    if (value === undefined || value === null || value === "") {
      return {}; // return empty if value not meaningful
    }
    return { [name]: value };
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
    attributeAssertPropName,
    selectOptionTag,
    locatorName,
    keyPressed,
    cookieName,
    basePdfFileName,
    referencePdfFileName,
    pdfComparisonPages,
    preComputedSelectors,
    varName,
    expectedAttribute,
  }) => {
    let selectors = null;
    let attributes = null;
    if (el) {
      ({ selectors, attributes } = window.__getSelectors(el));
    }

    const result = {
      action,
      ...buildOptionalField("cookies", cookies),
      ...buildOptionalField("locatorName", locatorName),
      ...buildOptionalField("assertion", assertion),
      ...buildOptionalField("expected", expected),
      ...buildOptionalField("selectors", preComputedSelectors || selectors),
      ...buildOptionalField("attributeAssertPropName", attributeAssertPropName),
      ...buildOptionalField("value", value),
      ...buildOptionalField("text", text || el?.innerText?.trim() || ""),
      ...buildOptionalField("keyPressed", keyPressed),
      ...buildOptionalField("cookieName", cookieName),
      ...buildOptionalField("basePdfFileName", basePdfFileName),
      ...buildOptionalField("referencePdfFileName", referencePdfFileName),
      ...buildOptionalField("pdfComparisonPages", pdfComparisonPages),
      ...buildOptionalField("varName", varName),
      ...buildOptionalField("expectedAttribute", expectedAttribute),
      ...buildOptionalField(
        "selectOptionIndex",
        selectOptionIndex !== undefined && selectOptionIndex !== null
          ? selectOptionIndex
          : null
      ),
      ...buildOptionalField("selectOptionTag", selectOptionTag),
      ...(el ? { tagName: el.tagName.toLowerCase() } : {}),
      ...(attributes
        ? {
            attributes: {
              ...attributes,
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
          }
        : {}),
      ...(e ? { position: { x: e.pageX, y: e.pageY } } : {}),
      isSoftAssert,
    };
    return result;
  };

  const getIframeLocators = (iframesAttr) => {
    const tagName = iframesAttr.tagName || "*";
    const selectors = { xpath: [] };

    const attributes = ["id", "title", "className", "name", "src"];

    for (const attr of attributes) {
      const value = iframesAttr[attr];
      if (value) {
        const attrName = attr === "className" ? "class" : attr;
        selectors.xpath.push(`.//${tagName}[@${attrName}=${value}]`);
      }
    }

    return [
      selectors,
      iframesAttr["title"] || iframesAttr["name"] || iframesAttr["src"],
    ];
  };

  const recordSwitchToDefaultFrame = async () => {
    const data = {
      action: "switchToDefaultFrame",
    };

    await fetch("http://localhost:3111/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("✅ Step added:", data);
  };

  const recordSwitchToCurrentFrame = async (selectors) => {
    const data = window.__buildData({
      action: "switchFrame",
      preComputedSelectors: selectors[0],
      ...(selectors[1] && selectors[1] !== ""
        ? { text: `iframe_${selectors[1]}` }
        : {}),
    });
    await fetch("http://localhost:3111/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("✅ Step added:", data);
  };

  const updateWsActiveIframe = (value) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "set-active-iframe",
          value,
        })
      );
    }
  };

  const checkIframeDataInSocket = async (iframes) => {
    const lastIframe = iframes[iframes.length - 1];

    if (
      activeIFrame &&
      JSON.stringify(lastIframe) === JSON.stringify(activeIFrame)
    ) {
      return; // No change
    }

    if (activeIFrame) {
      await recordSwitchToDefaultFrame(); // Reset before switching
    }

    for (let i = 0; i < iframes.length; i++) {
      const iframeLocs = getIframeLocators(iframes[i]);
      await recordSwitchToCurrentFrame(iframeLocs);

      if (i === iframes.length - 1) {
        updateWsActiveIframe(iframes[i]);
      }
    }
  };

  window.__recordAction = async (data) => {
    if (
      data.selectors &&
      data.selectors.iframes &&
      Array.isArray(data.selectors.iframes) &&
      data.selectors.iframes.length > 0
    ) {
      await checkIframeDataInSocket(data.selectors.iframes);
    } else {
      if (activeIFrame !== null) {
        // SWITCH TO parent
        await recordSwitchToDefaultFrame();
        // DELETE SOCKET IFRAME - UPDATE SOCKET FRAME WITH NULL
        updateWsActiveIframe(null);
      }
    }

    await fetch("http://localhost:3111/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("✅ Step added:", data);
  };

  window.__isPaused = () => {
    syncRecorderState();
    const mode = window.__recorderStore?.getMode?.() || "record";
    return mode === "pause";
  };

  window.__maybeRecordTabSwitch = (calledFrom) => {
    const isPaused = window.__isPaused();

    if (isPaused) return;
    const thisTabId = sessionStorage.getItem("tabId");
    const shouldSwich =
      window.__recorderStore.maybeUpdateActiveTabId(thisTabId);
    if (!shouldSwich) return;

    const title = sessionStorage.getItem("title");
    const url = sessionStorage.getItem("url");

    const key = `${calledFrom}-${thisTabId}`;

    fetch("http://localhost:3111/record", {
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
