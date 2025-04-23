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

  // const mapData = (arg) => {
  //   //   TEXT: "toHaveText",
  //   // VALUE: "toHaveValue",
  //   // ATTRIBUTEVALUE: "attrValue",

  //   // ATTRIBUTEVALUEEQUALS: "isAttrValueEquals",
  //   // ATTRIBUTEVALUECONTAINS: "isAttrValueContains",
  //   // NOTATTRIBUTEVALUEEQUALS: "isNotAttrValueEquals",
  //   // NOTATTRIBUTEVALUECONTAINS: "isNotAttrValueContains",

  //   // CHECKBOXCHECKED: "isCheckBoxChecked",
  //   // CHECKBOXNOTCHECKED: "isCheckBoxNotChecked",
  //   // RADIOCHECKED: "isRadioChecked",
  //   // RADIONOTCHECKED: "isRadioNotChecked",

  //   // DROPDOWNSELECTED: "dropdownSelected",
  //   // DROPDOWNNOTSELECTED: "dropdownNotSelected",
  //   // DROPDOWNCOUNTIS: "dropdownCountIs",
  //   // DROPDOWNCOUNTISNOT: "dropdownCountIsNot",

  //   // DROPDOWNVALUESARE: "dropdownValuesAre",
  //   // DROPDOWNINALPHABETICORDER: "dropdownInAlphabeticOrder",
  //   // DROPDOWNDUPLICATECOUNT: "dropdownDuplicateCount",
  //   // DROPDOWNCONTAINS: "dropdownContains",

  //   // NETPAYLOAD: "toHaveNetPayload",
  //   // NETREQUEST: "toHaveValue",
  //   // VISIBILITY: "isVisible",
  //   // ENABLED: "isEnabled",
  //   // DISABLED: "isDisabled",
  //   // PRSENECE: "isPresent",
  //   // ADDCOOKIES: "addCookies",
  //   // DELETECOOKIES: "deleteCookies",
  //   // TAKESCREENSHOT: "takeScreenshot",
  //   // PAGERELOAD: "pageReload",
  //   let actionType = arg.action;
  //   if (arg.action === "assert") {
  //     actionType = arg.assertion;
  //   }

  //   if (actionType === window.__FUNCTIONMAPPER.NAVIGATE) {
  //     return { step: `Given url "${arg.url}"` };
  //   }

  //   if (actionType === window.__FUNCTIONMAPPER.SWITCHTOWINDOW) {
  //     return {
  //       step: `And switchWindow("${
  //         arg.attributes.url || arg.attributes.title
  //       }")`,
  //     };
  //   }

  //   if (actionType === window.__FUNCTIONMAPPER.CLICK) {
  //     return {
  //       step: `And click("${arg.url}")`,
  //       locator: constructLocators(arg),
  //     };
  //   }
  //   return arg;
  // };

  // const getLocObject = (keyName, value) => {
  //   return {
  //     locatorType: keyName,
  //     locatorValue: value,
  //   };
  // };

  // const constructLocators = (arg) => {
  //   const arg = arg.selectors;
  //   const attr = arg.attributes;
  //   const tagname = arg.tagName;

  //   const keys = Object.keys(arg);
  //   const locator = [];

  //   for (let key of keys) {
  //     if (
  //       (key === "id" ||
  //         key === "name" ||
  //         key === "xpath" ||
  //         key === "css" ||
  //         key === "className") &&
  //       arg[key] &&
  //       arg[key] !== null &&
  //       arg[key] !== ""
  //     ) {
  //       locList.push(getLocObject(key, arg[key]));
  //     } else if (
  //       key === "href" &&
  //       arg[key] &&
  //       arg[key] !== null &&
  //       arg[key] !== ""
  //     ) {
  //       locList.push(getLocObject("linkeText", arg[key]));
  //     } else if (
  //       arg[key] !== "" &&
  //       key !== "iframes" &&
  //       key !== "iframeDepth"
  //     ) {
  //       locList.push(
  //         getLocObject("xpath", `//${tagname}[@${key}=${arg[key]}]`)
  //       );
  //     }
  //   }

  //   const result = {
  //     [`locator_${window.__locatorIndex}`]: {
  //       poParentObject: "__fileName",
  //       description: "Please add a description",
  //       locator,
  //     },
  //   };
  //   window.__locatorIndex = window.__locatorIndex + 1;
  //   return result;
  // };

  const syncRecorderState = () => {
    try {
      let isPaused = window.__recorderStore.getMode() === "pause";
      window.__syncRecorderStatusOnInternalSwitchTab();
    } catch (err) {}
  };

  // window.__locatorIndex = 1;

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
  }) => {
    if (
      action === "addCookies" ||
      action === "deleteCookies" ||
      action === "takeScreenshot" ||
      action === "pageReload"
    ) {
      return {
        action,
        ...(cookies ? { cookies } : {}),
      };
    }
    const { selectors, attributes } = window.__getSelectors(el);

    const result = {
      action,
      ...(assertion ? { assertion } : {}),
      ...(expected !== undefined ? { expected } : {}),
      tagName: el.tagName.toLowerCase(),
      selectors,
      ...(attributeAssertPropName ? { attributeAssertPropName } : {}),
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
      text: text || el.innerText?.trim() || "",
      selectOptionIndex,
      ...(selectOptionTag ? { selectOptionTag } : {}),
      isSoftAssert,
    };
    return result;
    // return mapData(result);
  };

  window.__recordAction = async (data) => {
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
    console.log(
      ' sessionStorage.getItem("tabId"): ',
      sessionStorage.getItem("tabId")
    );
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
