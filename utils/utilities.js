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

  // const getAssociatedLabel = (el) => {
  //   if (!el.id) return null;
  //   const labelEl = document.querySelector(`label[for="${el.id}"]`);
  //   return labelEl?.innerText?.trim() || null;
  // };

  function getAssociatedLabel(el) {
    if (!el) return null;

    // 1. Look for <label for="...">
    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label?.innerText?.trim())
        return window.__getTextValueOfEl(el) || label.innerText.trim();
    }

    // 2. Check if element is nested inside a <label>
    let parent = el.closest("label");
    if (parent?.innerText?.trim()) {
      return window.__getTextValueOfEl(parent) || parent.innerText.trim();
    }

    // 3. Look for aria-labelledby reference
    const ariaLabelledBy = el.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(/\s+/);
      const labelTexts = ids
        .map((id) => {
          const elm = document.getElementById(id);
          return window.__getTextValueOfEl(elm) || elm?.innerText?.trim();
        })
        .filter(Boolean);
      if (labelTexts.length) return labelTexts.join(" ");
    }

    return null;
  }

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

  // Monitor viewport changes
  function setupEmulationMonitoring() {
    let lastDetection = detectEmulationMode();

    const checkForChanges = () => {
      const currentDetection = detectEmulationMode();

      if (currentDetection.isEmulated !== lastDetection.isEmulated) {
        // Adjust your test recorder behavior
        handleEmulationChange(currentDetection);
      }

      lastDetection = currentDetection;
    };

    // Monitor resize events
    window.addEventListener("resize", checkForChanges);

    // Initial check
    checkForChanges();
  }

  window.__detectEmulationMode = () => {
    const detection = {
      isEmulated: false,
      method: null,
      deviceType: null,
      confidence: 0,
    };

    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = window.devicePixelRatio;

    // Check for mobile viewport sizes
    const mobileIndicators = [];

    // 1. Check viewport width
    if (width <= 480) {
      mobileIndicators.push("narrow-viewport");
      detection.deviceType = "mobile";
    }

    // 2. Check for common mobile aspect ratios
    const aspectRatio = height / width;
    if (aspectRatio > 1.5) {
      // Typical mobile portrait
      mobileIndicators.push("mobile-aspect-ratio");
    }

    // 3. Check for exact iPhone dimensions
    const exactMatches = checkExactDeviceDimensions(width, height);
    if (exactMatches.length > 0) {
      mobileIndicators.push("exact-device-match");
      detection.deviceType = exactMatches[0];
      detection.confidence += 0.5;
    }

    // 4. Check if it's an unusual desktop size (likely emulated)
    if (width < 1024 && window.screen.width > width + 200) {
      mobileIndicators.push("constrained-in-larger-screen");
      detection.confidence += 0.3;
    }

    // 5. Check CSS media queries
    if (window.matchMedia("(hover: none)").matches) {
      mobileIndicators.push("hover-none");
      detection.confidence += 0.1;
    }

    if (window.matchMedia("(pointer: coarse)").matches) {
      mobileIndicators.push("coarse-pointer");
      detection.confidence += 0.2;
    }

    detection.isEmulated =
      mobileIndicators.length >= 2 || detection.confidence > 0.5;
    detection.indicators = mobileIndicators;

    return detection;
  };

  function checkExactDeviceDimensions(width, height) {
    const devices = [
      { name: "iPhone SE", width: 375, height: 667 },
      { name: "iPhone XR", width: 414, height: 896 },
      { name: "iPhone 12", width: 390, height: 844 },
      { name: "iPhone 12 Pro Max", width: 428, height: 926 },
      { name: "iPhone 14 Pro Max", width: 430, height: 932 },
      { name: "Pixel 7", width: 412, height: 915 },
      { name: "iPad Mini", width: 768, height: 1024 },
      { name: "iPad Air", width: 820, height: 1180 },
      { name: "iPad Pro", width: 1024, height: 1366 },
      { name: "Galaxy S8+", width: 360, height: 740 },
      { name: "Galaxy S20", width: 360, height: 800 },
      { name: "Galaxy S20 Ultra", width: 412, height: 915 },
      { name: "Galaxy A51/71", width: 412, height: 914 },
      { name: "Surface Pro 7", width: 912, height: 1368 },
      { name: "Surface Duo", width: 540, height: 720 },
      { name: "Galaxy Z Fold 5", width: 344, height: 882 },
      { name: "Asus Zenbook Fold", width: 853, height: 1280 },
      { name: "Next Hub", width: 1024, height: 600 },
      { name: "Next Hub Max", width: 1280, height: 800 },
      { name: "BlackBerry Z30", width: 360, height: 640 },
      { name: "BlackBerry Playbook", width: 600, height: 1024 },
    ];

    return devices
      .filter(
        (device) =>
          Math.abs(width - device.width) <= 5 &&
          Math.abs(height - device.height) <= 50
      )
      .map((device) => device.name);
  }

  window.__getTextValueOfEl = (el) => {
    if (el && el.childNodes)
      return Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join(" ")
        .trim();
    return null;
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
    fileName,
    expectedAttribute,
    dbType,
    dbHostName,
    dbUserName,
    dbPassword,
    dbPortNum,
    dbQuery,
    elementIndex,
    httpStatus,
    httpMethod,
    httpPayload,
    httpHeaders,
    httpHeader,
    httpPath,
    httpUrl,
    isReassignVar,

    emailServerId,
    emailSubject,
    emailSentFrom,
    emailSentTo,
    emailFilter,
    emailReceivedBefore,
    isFileUpload,
    fileNames,
  }) => {
    const isEmulatedMeta = window.__detectEmulationMode();
    const isMobileDevice = isEmulatedMeta.confidence > 0.5;

    let selectors = null;
    let attributes = null;

    let elIndexValue = -1;
    if (e && el && el.tagName) {
      // && el.tagName.toLowerCase() !== "input"
      const { elIndex } = window.__searchElIndexByOccurence(
        e.target,
        el.tagName.toLowerCase()
      );
      elIndexValue = elIndex;
    }

    if (el) {
      ({ selectors, attributes } = window.__getSelectors(el, elIndexValue));
    }
    const browserUrl = window.location.href;

    const result = {
      action,
      isMobileDevice,
      ...buildOptionalField("browserUrl", browserUrl),
      ...buildOptionalField("cookies", cookies),
      ...buildOptionalField("locatorName", locatorName),
      ...buildOptionalField("assertion", assertion),
      ...buildOptionalField("expected", expected),
      ...buildOptionalField("selectors", preComputedSelectors || selectors),
      ...buildOptionalField("attributeAssertPropName", attributeAssertPropName),
      ...buildOptionalField("value", value),
      ...buildOptionalField(
        "text",
        text ||
          window.__getTextValueOfEl(el) ||
          el?.innerText?.trim() ||
          el?.getAttribute("value") ||
          ""
      ),
      ...buildOptionalField("keyPressed", keyPressed),
      ...buildOptionalField("cookieName", cookieName),
      ...buildOptionalField("basePdfFileName", basePdfFileName),
      ...buildOptionalField("referencePdfFileName", referencePdfFileName),
      ...buildOptionalField("pdfComparisonPages", pdfComparisonPages),
      ...buildOptionalField("varName", varName),
      ...buildOptionalField("fileName", fileName),
      ...buildOptionalField("expectedAttribute", expectedAttribute),
      ...buildOptionalField("dbType", dbType),
      ...buildOptionalField("dbHostName", dbHostName),
      ...buildOptionalField("dbUserName", dbUserName),
      ...buildOptionalField("dbPassword", dbPassword),
      ...buildOptionalField("dbPortNum", dbPortNum),
      ...buildOptionalField("dbQuery", dbQuery),
      ...buildOptionalField("isReassignVar", isReassignVar),
      ...buildOptionalField("httpStatus", httpStatus),
      ...buildOptionalField("httpMethod", httpMethod),
      ...buildOptionalField("httpPayload", httpPayload),
      ...buildOptionalField("httpHeaders", httpHeaders),
      ...buildOptionalField("httpHeader", httpHeader),
      ...buildOptionalField("httpPath", httpPath),
      ...buildOptionalField("httpUrl", httpUrl),
      ...buildOptionalField("isFileUpload", isFileUpload),
      ...buildOptionalField("fileNames", fileNames),

      ...buildOptionalField("emailServerId", emailServerId),
      ...buildOptionalField("emailSubject", emailSubject),
      ...buildOptionalField("emailSentFrom", emailSentFrom),
      ...buildOptionalField("emailSentTo", emailSentTo),
      ...buildOptionalField("emailFilter", emailFilter),
      ...buildOptionalField("emailReceivedBefore", emailReceivedBefore),

      ...buildOptionalField(
        "elementIndex",
        elementIndex !== undefined && elementIndex !== null
          ? elementIndex
          : elIndexValue
      ),

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

  const getIframeLocators = (iframesAttr, depth) => {
    const tagName = iframesAttr.tagName || "*";
    const selectors = {
      xpath: [],
      iframes: [iframesAttr],
      iframeDepth: depth + 1,
    };

    const attributes = ["id", "title", "className", "name", "src"];

    for (const attr of attributes) {
      const value = iframesAttr[attr];
      if (value) {
        const attrName = attr === "className" ? "class" : attr;
        selectors.xpath.push(`.//${tagName}[@${attrName}='${value}']`);
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
    // console.log("✅ Step added:", data);
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
    // console.log("✅ Step added:", data);
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
      const iframeLocs = getIframeLocators(iframes[i], i);
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
    // console.log("✅ Step added:", data);
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

  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;

    // 🔒 Basic attribute-level checks
    if (
      el.hasAttribute("hidden") ||
      el.getAttribute("aria-hidden") === "true" ||
      el.getAttribute("tabindex") === "-1" ||
      // el.className.includes("sr-only") || // common hiding class
      el.style.display === "none"
    ) {
      return false;
    }

    // 💡 Computed styles
    const style = window.getComputedStyle(el);
    if (
      (style && style.display === "none") ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }

    // 📏 Geometric check
    if (
      el.offsetWidth <= 0 ||
      el.offsetHeight <= 0 ||
      el.getClientRects().length === 0
    ) {
      return false;
    }

    // 🧭 Check parent chain
    let parent = el;
    while ((parent = parent.parentElement)) {
      const ps = isVisible(parent);
      if (!ps) return false;
      // const ps = window.getComputedStyle(parent);
      // if (
      //   ps.display === "none" ||
      //   ps.visibility === "hidden" ||
      //   ps.opacity === "0"
      // ) {
      //   return false;
      // }
    }

    return true;
  }

  function isAttributeUnique(attrName, attrValue, tagName = "*") {
    if (!attrValue) return null;

    const selector = `${tagName}[${CSS.escape(attrName)}="${attrValue}"]`;
    const matches = Array.from(document.querySelectorAll(selector)).filter(
      isVisible
    );

    return matches.length === 1 ? matches[0] : null;
  }

  function getVisibleIndex(target, tagType = "input") {
    const visibleElements = Array.from(
      document.querySelectorAll(tagType)
    ).filter(isVisible);
    return visibleElements.indexOf(target);
  }

  function isHumanReadable(value) {
    if (!value || typeof value !== "string") return false;

    const trimmed = value.trim();

    const classPattern = /^[-_a-z0-9]+$/;
    const wordCount = trimmed.split(/\s+/).length;
    const uuidPattern =
      /^[a-f0-9]{8}-?[a-f0-9]{4,}-?[a-f0-9]{4,}-?[a-f0-9]{4,}-?[a-f0-9]{12}$/i;

    return (
      !classPattern.test(trimmed) &&
      !uuidPattern.test(trimmed) &&
      (wordCount > 1 || /^[A-Za-z]+$/.test(trimmed))
    );
  }

  function getAllUniqueHumanReadableAttributes(attributes, tagName) {
    const refined = {};

    const priorityAttrs = [
      "aria-label",
      "placeholder",
      "title",
      "aria-describedby",
      "name",
    ];

    for (const attr of priorityAttrs) {
      const value = attributes[attr];
      if (
        value &&
        isAttributeUnique(attr, value, tagName) &&
        isHumanReadable(value)
      ) {
        refined[attr] = value;
      }
    }

    return refined;
  }

  function getAssociatedLabelMatch(attributes, tagName) {
    if (!attributes.associatedLabel?.trim()) return null;

    const targetText = attributes.associatedLabel.trim().toLowerCase();
    const matches = Array.from(document.querySelectorAll(tagName)).filter(
      (el) =>
        isVisible(el) &&
        (
          window.__getTextValueOfEl(el) || el.innerText?.trim()
        ).toLowerCase() === targetText
    );

    if (matches.length === 1 && isHumanReadable(attributes.associatedLabel)) {
      return { associatedLabel: attributes.associatedLabel };
    }

    return null;
  }

  const isTextUniqueWithinSelector = (cssSelector, targetText) => {
    const candidates = Array.from(document.querySelectorAll(cssSelector));
    const normalized = (s) => s.replace(/\s+/g, " ").trim();

    const matches = candidates.filter(
      (el) => normalized(el.textContent) === normalized(targetText)
    );
    // return {
    //   count: matches.length,
    //   isUnique: matches.length === 1,
    //   elements: matches,
    // };
    return matches.length === 1;
  };

  window.__searchElIndex = (target, tagType, buildData) => {
    const attributes = buildData.attributes;
    let isTextUnique = false;
    if (buildData?.selectors?.css && buildData.text?.trim()) {
      isTextUnique = isTextUniqueWithinSelector(
        buildData.selectors.css,
        buildData.text
      );
    }

    try {
      if (!target || !tagType || !attributes)
        return { elIndex: -1, refinedAttributes: {} };

      const refinedAttributes = getAllUniqueHumanReadableAttributes(
        attributes,
        tagType
      );

      if (isTextUnique)
        return {
          elIndex: -1,
          refinedAttributes,
        };

      const labelMatch = getAssociatedLabelMatch(attributes, tagType);

      if (Object.keys(refinedAttributes).length || labelMatch) {
        return {
          elIndex: -1,
          refinedAttributes: { ...refinedAttributes, ...labelMatch },
        };
      }

      const index = getVisibleIndex(target, tagType);
      return {
        elIndex: index,
        refinedAttributes: attributes,
      };
    } catch (err) {
      console.error("__searchElIndex failed:", err);
      return {
        elIndex: -1,
        refinedAttributes: attributes,
      };
    }
  };

  window.__searchElIndexByOccurence = (target, tagType) => {
    try {
      if (!target || !tagType) return { elIndex: -1 };
      const index = getVisibleIndex(target, tagType);
      return {
        elIndex: index,
      };
    } catch (err) {
      console.error("__searchElIndexByOccurence failed:", err);
      return {
        elIndex: -1,
      };
    }
  };
})();
