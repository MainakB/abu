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
      if (label?.innerText?.trim()) return label.innerText.trim();
    }

    // 2. Check if element is nested inside a <label>
    let parent = el.closest("label");
    if (parent?.innerText?.trim()) {
      return parent.innerText.trim();
    }

    // 3. Look for aria-labelledby reference
    const ariaLabelledBy = el.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(/\s+/);
      const labelTexts = ids
        .map((id) => document.getElementById(id)?.innerText?.trim())
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
    dbType,
    dbHostName,
    dbUserName,
    dbPassword,
    dbPortNum,
    dbQuery,
    elementIndex,
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
      ...buildOptionalField("dbType", dbType),
      ...buildOptionalField("dbHostName", dbHostName),
      ...buildOptionalField("dbUserName", dbUserName),
      ...buildOptionalField("dbPassword", dbPassword),
      ...buildOptionalField("dbPortNum", dbPortNum),
      ...buildOptionalField("dbQuery", dbQuery),

      ...buildOptionalField(
        "elementIndex",
        elementIndex !== undefined && elementIndex !== null
          ? elementIndex
          : null
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

  const getIframeLocators = (iframesAttr) => {
    const tagName = iframesAttr.tagName || "*";
    const selectors = { xpath: [] };

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

  function isVisible(el) {
    if (!el) return false;

    const style = getComputedStyle(el);

    return (
      style &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0 &&
      el.getClientRects().length > 0
    );
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
      (el) => isVisible(el) && el.innerText?.trim().toLowerCase() === targetText
    );

    if (matches.length === 1 && isHumanReadable(attributes.associatedLabel)) {
      return { associatedLabel: attributes.associatedLabel };
    }

    return null;
  }

  window.__searchElIndex = (target, tagType, attributes) => {
    try {
      if (!target || !tagType || !attributes)
        return { index: -1, refinedAttributes: {} };

      const refinedAttributes = getAllUniqueHumanReadableAttributes(
        attributes,
        tagType
      );
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
        index: -1,
        refinedAttributes: attributes,
      };
    }
  };

  // function isVisible(el) {
  //   if (!el) return false;

  //   const style = getComputedStyle(el);

  //   return (
  //     style &&
  //     style.display !== "none" &&
  //     style.visibility !== "hidden" &&
  //     style.opacity !== "0" &&
  //     el.offsetWidth > 0 &&
  //     el.offsetHeight > 0 &&
  //     el.getClientRects().length > 0
  //   );
  // }

  // function isAttributeUnique(attrName, attrValue, tagName = "*") {
  //   if (!attrValue) return null;

  //   const selector = `${tagName}[${CSS.escape(attrName)}="${attrValue}"]`;
  //   const matches = Array.from(document.querySelectorAll(selector)).filter(
  //     isVisible
  //   );

  //   return matches.length === 1 ? matches[0] : null;
  // }

  // function getFirstUniqueAttribute(attributes, tagName) {
  //   const priorityAttrs = [
  //     "aria-label",
  //     "placeholder",
  //     "title",
  //     "aria-describedby",
  //     "name",
  //   ];

  //   for (const attr of priorityAttrs) {
  //     if (
  //       attributes[attr] &&
  //       isAttributeUnique(attr, attributes[attr], tagName)
  //     ) {
  //       return attr;
  //     }
  //   }

  //   return null;
  // }

  // function getVisibleIndex(target, tagType = "input") {
  //   const visibleElements = Array.from(
  //     document.querySelectorAll(tagType)
  //   ).filter(isVisible);
  //   return visibleElements.indexOf(target);
  // }

  // function refineAttributes(attributes, uniqueAttrName, isByLabel = false) {
  //   const refined = {};
  //   const key = uniqueAttrName || (isByLabel ? "associatedLabel" : null);

  //   if (key && isHumanReadable(attributes[key])) {
  //     refined[key] = attributes[key];
  //   }

  //   return refined;
  // }

  // function isHumanReadable(value) {
  //   if (!value || typeof value !== "string") return false;

  //   const trimmed = value.trim();

  //   // Reject if mostly kebab-case, snake_case, or camelCase-like
  //   const classPattern = /^[-_a-z0-9]+$/i;
  //   const wordCount = trimmed.split(/\s+/).length;
  //   const uuidPattern =
  //     /^[a-f0-9]{8}-?[a-f0-9]{4,}-?[a-f0-9]{4,}-?[a-f0-9]{4,}-?[a-f0-9]{12}$/i;

  //   // return !classPattern.test(trimmed) || wordCount > 1;
  //   return (
  //     !classPattern.test(trimmed) &&
  //     !uuidPattern.test(trimmed) &&
  //     (wordCount > 1 || /^[A-Za-z]+$/.test(trimmed))
  //   );
  // }

  // window.__searchElIndex = (target, tagType, attributes) => {
  //   if (!target || !tagType || !attributes)
  //     return { index: -1, refinedAttributes: {} };

  //   const uniqueAttr = getFirstUniqueAttribute(attributes, tagType);

  //   let isMatchByAssociatedLabel = false;
  //   if (attributes.associatedLabel?.trim()) {
  //     const targetText = attributes.associatedLabel.trim().toLowerCase();
  //     const matches = Array.from(document.querySelectorAll(tagType)).filter(
  //       (el) =>
  //         isVisible(el) && el.innerText?.trim().toLowerCase() === targetText
  //     );
  //     isMatchByAssociatedLabel = matches.length === 1;
  //   }

  //   if (
  //     (uniqueAttr && isHumanReadable(attributes[uniqueAttr])) ||
  //     (isMatchByAssociatedLabel && isHumanReadable(attributes.associatedLabel))
  //   ) {
  //     return {
  //       elIndex: -1,
  //       refinedAttributes: refineAttributes(
  //         attributes,
  //         uniqueAttr,
  //         isMatchByAssociatedLabel
  //       ),
  //     };
  //   }

  //   const index = getVisibleIndex(target, tagType);
  //   return {
  //     elIndex: index,
  //     refinedAttributes: attributes,
  //   };
  // };
  // window.__searchElIndex = (target, tagType, attributes) => {
  //   console.log("selectors: ", selectors);
  //   if (
  //     attributes &&
  //     (attributes?.placeholder ||
  //       attributes?.associatedLabel ||
  //       attributes?.title ||
  //       attributes?.["aria-describedby"] ||
  //       attributes?.["aria-label"] ||
  //       attributes?.name)
  //   ) {
  //     const uniqueAttr =
  //       (attributes?.["aria-label"] &&
  //         isAttributeUnique("aria-label", attributes["aria-label"], tagType)) ||
  //       (attributes?.placeholder &&
  //         isAttributeUnique("placeholder", attributes.placeholder, tagType)) ||
  //       (attributes?.title &&
  //         isAttributeUnique("title", attributes.title, tagType)) ||
  //       (attributes?.["aria-describedby"] &&
  //         isAttributeUnique(
  //           "aria-describedby",
  //           attributes["aria-describedby"],
  //           tagType
  //         )) ||
  //       (attributes?.name &&
  //         isAttributeUnique("name", attributes.name, tagType)) ||
  //       null;

  //     let isMatchByAssociatedLabel = false;
  //     if (
  //       attributes?.associatedLabel &&
  //       attributes?.associatedLabel.trim() !== ""
  //     ) {
  //       const targetText = attributes?.associatedLabel.trim().toLowerCase();
  //       const matches = Array.from(document.querySelectorAll(tagType)).filter(
  //         (el) =>
  //           isVisible(el) && el.innerText?.trim().toLowerCase() === targetText
  //       );
  //       isMatchByAssociatedLabel = matches.length === 1;
  //     }

  //     if (uniqueAttr || isMatchByAssociatedLabel) return -1;
  //   }

  //   const visibleInputs = Array.from(document.querySelectorAll(tagType)).filter(
  //     isVisible
  //   );

  //   const index = visibleInputs.indexOf(target);
  //   return index;
  // };
})();
