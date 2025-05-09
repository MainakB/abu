import React from "react";
import ReactDOM from "react-dom/client";
import FloatingAssertDock from "./components/docked-panes/text-dock/FloatingAssertDock.jsx";
import FloatingAssertDockNonText from "./components/docked-panes/non-text-dock/FloatingAssertDockNonText.jsx";
import FloatingCookieListDock from "./components/docked-panes/cookie-dock/FloatingCookieListDock.jsx";
import FloatingDeleteCookieDock from "./components/docked-panes/cookie-dock/FloatingDeleteCookieDock.jsx";
import AssertCookieValueDock from "./components/docked-panes/cookie-dock/AssertCookieValueDock.jsx";
import AssertAttributeValueDock from "./components/docked-panes/attributes-dock/AssertAttributeValueDock.jsx";
import AssertCheckedStateDock from "./components/docked-panes/checked-state-dock/AssertCheckedStateDock.jsx";
import FloatingDropdownAssertDock from "./components/docked-panes/dropdown-dock/FloatingDropdownAssertDock.jsx";
import FloatingDropdownOrderAssertDock from "./components/docked-panes/dropdown-dock/FloatingDropdownOrderAssertDock.jsx";

import FloatingAssertDockNotSupported from "./components/docked-panes/dropdown-dock/FloatingAssertDockNotSupported.jsx";
import CurrentUrlAssertDock from "./components/docked-panes/current-url-dock/CurrentUrlAssertDock.jsx";
import AddReuseTextBoxDock from "./components/docked-panes/addreuse-text-box-dock/AddReuseTextBoxDock.jsx";
import FloatingAssertTextInPdf from "./components/docked-panes/pdf-assertions/FloatingAssertTextInPdf.jsx";
import FloatingAssertPdfCompare from "./components/docked-panes/pdf-assertions/FloatingAssertPdfCompare.jsx";
import FloatingElementTextAssignmentDock from "./components/docked-panes/element-based-assignment/FloatingElementTextAssignmentDock.jsx";
import FloatingElementGetAttrAssignDock from "./components/docked-panes/element-based-assignment/FloatingElementGetAttrAssignDock.jsx";
import FloatingElementAttrEqualsAssignDock from "./components/docked-panes/element-based-assignment/FloatingElementAttrEqualsAssignDock.jsx";
import { ASSERTIONMODES, ASSERTIONNAMES } from "./constants/index.js";

let floatingAssertRoot = null;

const ensureFloatingRoot = (doc) => {
  let rootEl = doc.getElementById("floating-assert-dock-root");

  // 💡 If stale root exists, remove and recreate it
  if (floatingAssertRoot && !rootEl) {
    floatingAssertRoot = null; // stale ref, kill it
  }

  if (!rootEl) {
    rootEl = doc.createElement("div");
    rootEl.id = "floating-assert-dock-root";
    doc.documentElement.appendChild(rootEl);
  }

  if (!floatingAssertRoot) {
    floatingAssertRoot = ReactDOM.createRoot(rootEl);
  }
};

window.showFloatingAssert = (mode, el, e, type) => {
  if (window !== window.top) {
    if (typeof window.top.showFloatingAssert === "function") {
      window.top.showFloatingAssert(mode, el);
    }
    return;
  }

  // // Top-level only from here
  const doc = document;

  ensureFloatingRoot(doc);

  if (!floatingAssertRoot || !floatingAssertRoot._internalRoot) {
    console.error("⚠️ React root is not initialized correctly");
  }

  let textValue = "";
  if (el) {
    textValue = el.innerText?.trim() || "";
  }

  const ASSERTION_NAME_LOOKUP = {
    [ASSERTIONMODES.TEXT]: {
      exact: {
        positive: ASSERTIONNAMES.TEXT,
        negative: ASSERTIONNAMES.TEXTNOTEQUALS,
      },
      contains: {
        positive: ASSERTIONNAMES.TEXTCONTAINS,
        negative: ASSERTIONNAMES.TEXTNOTCONTAINS,
      },
    },
    [ASSERTIONMODES.VALUE]: {
      exact: {
        positive: ASSERTIONNAMES.VALUE,
        negative: ASSERTIONNAMES.VALUENOTEQUALS,
      },
      contains: {
        positive: ASSERTIONNAMES.VALUENOTCONTAINS,
        negative: ASSERTIONNAMES.VALUECONTAINS,
      },
    },
    [ASSERTIONMODES.PRSENECE]: {
      exact: {
        positive: ASSERTIONNAMES.PRSENECE,
        negative: ASSERTIONNAMES.NOTPRESENT,
      },
    },
    [ASSERTIONMODES.ENABLED]: {
      exact: {
        positive: ASSERTIONNAMES.ENABLED,
        negative: ASSERTIONNAMES.DISABLED,
      },
    },
    [ASSERTIONMODES.VISIBILITY]: {
      exact: {
        positive: ASSERTIONNAMES.VISIBILITY,
        negative: ASSERTIONNAMES.INVISIBILITY,
      },
    },

    [ASSERTIONMODES.ASSERTCURRENTURL]: {
      exact: {
        positive: ASSERTIONNAMES.ASSERTCURRENTURLEQUALS,
        negative: ASSERTIONNAMES.ASSERTCURRENTURLNOTEQUALS,
      },
      contains: {
        positive: ASSERTIONNAMES.ASSERTCURRENTURLCONTAINS,
        negative: ASSERTIONNAMES.ASSERTCURRENTURLNOTCONTAINS,
      },
    },
    [ASSERTIONMODES.ASSERTTEXTINPAGESOURCE]: {
      exact: {
        positive: ASSERTIONNAMES.ASSERTTEXTINPAGESOURCE,
        negative: ASSERTIONNAMES.ASSERTTEXTINPAGESOURCENOTEQUALS,
      },
      contains: {
        positive: ASSERTIONNAMES.ASSERTTEXTINPAGESOURCECONTAINS,
        negative: ASSERTIONNAMES.ASSERTTEXTINPAGESOURCENOTCONTAINS,
      },
    },
    [ASSERTIONMODES.ASSERTCOOKIEVALUE]: {
      exact: {
        positive: ASSERTIONNAMES.ASSERTCOOKIEVALUEEQUALS,
        negative: ASSERTIONNAMES.ASSERTCOOKIEVALUENOTEQUALS,
      },
      contains: {
        positive: ASSERTIONNAMES.ASSERTCOOKIEVALUECONTAINS,
        negative: ASSERTIONNAMES.ASSERTCOOKIEVALUENOTCONTAINS,
      },
    },

    [ASSERTIONMODES.ATTRIBUTEVALUE]: {
      exact: {
        positive: ASSERTIONNAMES.ATTRIBUTEVALUEEQUALS,
        negative: ASSERTIONNAMES.NOTATTRIBUTEVALUEEQUALS,
      },
      contains: {
        positive: ASSERTIONNAMES.ATTRIBUTEVALUECONTAINS,
        negative: ASSERTIONNAMES.NOTATTRIBUTEVALUECONTAINS,
      },
    },
    //
    [ASSERTIONMODES.ASSERTTEXTINPDF]: {
      exact: {
        positive: ASSERTIONNAMES.ASSERTTEXTINPDF,
      },
    },
    [ASSERTIONMODES.ASSERTPDFCOMPARISON]: {
      exact: {
        positive: ASSERTIONNAMES.ASSERTPDFCOMPARISON,
      },
    },
    [ASSERTIONMODES.ASSERTTEXTIMAGESINPDF]: {
      exact: {
        positive: ASSERTIONNAMES.ASSERTTEXTIMAGESINPDF,
      },
    },
    [ASSERTIONMODES.ASSERTCPDPDF]: {
      exact: {
        positive: ASSERTIONNAMES.ASSERTCPDPDF,
      },
    },
  };

  const closeDock = async () => {
    if (floatingAssertRoot) {
      floatingAssertRoot.unmount();
      floatingAssertRoot = null;
    }
    doc.getElementById("floating-assert-dock-root")?.remove();
    const currentMode = window.__recorderStore.getMode?.();
    if (currentMode !== "pause") {
      await window.__recorderStore.setMode("record", false);
    }
    // await window.__recorderStore.setMode("record", false);
  };

  // const getElementAttributes = async (el) => {
  //   const attrList = await el.getAttributeNames();
  //   const attributes = {};

  //   for (let i = 0; i < attrList.length; i++) {
  //     const attr = attrList[i];
  //     const attrValue = await el.getAttribute(attr);
  //     attributes[attr] = attrValue;
  //   }

  //   return attributes;
  // };

  const getCookies = async () => {
    const cookies = await window.__getCookies();
    return cookies;
  };

  const recordAttributesAssert = async (
    selectedAssertions = [],
    isSoftAssert,
    locatorName
  ) => {
    const assertionMapping = ASSERTION_NAME_LOOKUP[mode];

    for (let i = 0; i < selectedAssertions.length; i++) {
      const attrObj = selectedAssertions[i];
      const category = attrObj.isSubstringMatch ? "contains" : "exact";
      const polarity = attrObj.isNegative ? "negative" : "positive";
      const attrMode = assertionMapping[category][polarity];

      const locSubstring = attrObj.attributeName
        .replace(/[ -]/g, "_")
        .toLowerCase();

      window.__recordAction(
        window.__buildData({
          action: "assert",
          ...(locatorName && locatorName !== ""
            ? { locatorName: `${locatorName}_${locSubstring}` }
            : locatorName),
          isSoftAssert,
          assertion: attrMode,
          attributeAssertPropName: attrObj.attributeName,
          expected: attrObj.value,
          el,
          e,
        })
      );
    }

    await closeDock();
  };

  const recordCookiesAssert = async (selectedAssertions, isSoftAssert) => {
    const assertionMapping = ASSERTION_NAME_LOOKUP[mode];

    for (let i = 0; i < selectedAssertions.length; i++) {
      const cookieObj = selectedAssertions[i];
      const category = cookieObj.isSubstringMatch ? "contains" : "exact";
      const polarity = cookieObj.isNegative ? "negative" : "positive";
      const assertionName = assertionMapping[category][polarity];

      window.__recordAction(
        window.__buildData({
          action: "assert",
          isSoftAssert,
          assertion: assertionName,
          cookieName: cookieObj.name,
          expected: cookieObj.value,
          el,
          e,
        })
      );
    }

    await closeDock();
  };

  const recordCheckboxRadioAssert = async (
    checkBoxState,
    isSoftAssert,
    elToUse,
    locatorName
  ) => {
    const isRadio = checkBoxState.type === ASSERTIONMODES.RADIOSTATE;

    let assertName = "";
    if (isRadio) {
      if (checkBoxState.isChecked) {
        assertName = ASSERTIONNAMES.RADIOCHECKED;
      } else {
        assertName = ASSERTIONNAMES.RADIONOTCHECKED;
      }
    } else {
      if (checkBoxState.isChecked) {
        assertName = ASSERTIONNAMES.CHECKBOXCHECKED;
      } else {
        assertName = ASSERTIONNAMES.CHECKBOXNOTCHECKED;
      }
    }

    await window.__recordAction(
      window.__buildData({
        action: "assert",
        locatorName,
        isSoftAssert,
        assertion: assertName,
        expected: checkBoxState.isChecked,
        el: elToUse,
        e,
      })
    );

    await closeDock();
  };

  const recordDropdownOrderAssert = async (
    checkBoxState,
    isSoftAssert,
    elToUse,
    locatorName
  ) => {
    window.__recordAction(
      window.__buildData({
        action: "assert",
        locatorName,
        isSoftAssert,
        assertion: ASSERTIONNAMES.DROPDOWNINALPHABETICORDER,
        expected: checkBoxState.isChecked ? "asc" : "desc",
        el,
        e,
      })
    );

    await closeDock();
  };

  const recordDropdownAssert = async (
    expected,
    isSoftAssert,
    isNegative,
    assertName,
    modeVal,
    locatorName
  ) => {
    if (
      isNegative &&
      (modeVal === ASSERTIONMODES.DROPDOWNCOUNTIS ||
        modeVal === ASSERTIONMODES.DROPDOWNSELECTED)
    ) {
      assertName =
        modeVal === ASSERTIONMODES.DROPDOWNCOUNTIS
          ? ASSERTIONNAMES.DROPDOWNCOUNTISNOT
          : ASSERTIONNAMES.DROPDOWNNOTSELECTED;
    }
    window.__recordAction(
      window.__buildData({
        action: "assert",
        locatorName,
        isSoftAssert,
        assertion: assertName,
        expected,
        el,
        e,
      })
    );

    await closeDock();
  };

  const floatingAssertDockOnConfirm = async (
    expected,
    isSoftAssert,
    locatorName,
    exact,
    isNegative
  ) => {
    const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
    const category = exact ? "exact" : "contains";
    const polarity = isNegative ? "negative" : "positive";
    const assertName = assertionMapping[category][polarity];

    window.__recordAction(
      window.__buildData({
        action: "assert",
        isSoftAssert,
        locatorName,
        assertion: assertName,
        // getModeSelected(mode),
        expected,
        el,
        e,
        text: textValue,
      })
    );
    await closeDock();
  };

  const floatingAssertCurrentUrlConfirm = async (
    expected,
    isSoftAssert,
    isNegative,
    exactMatch
  ) => {
    const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
    const category = exactMatch ? "exact" : "contains";
    const polarity = isNegative ? "negative" : "positive";
    const assertionName = assertionMapping[category][polarity];

    window.__recordAction(
      window.__buildData({
        action: "assert",
        isSoftAssert,
        assertion: assertionName,
        expected,
      })
    );
    await closeDock();
  };

  const floatingAssertDockNonTextConfirm = async (
    isSoftAssert,
    isNegative,
    locatorName
  ) => {
    const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
    const category = "exact";
    const polarity = isNegative ? "negative" : "positive";
    const assertName = assertionMapping[category][polarity];

    window.__recordAction(
      window.__buildData({
        action: "assert",
        locatorName,
        isSoftAssert,
        assertion: assertName,
        el,
        e,
        text: textValue,
      })
    );
    await closeDock();
  };

  const floatingCookieListDockConfirm = async (cookieList) => {
    window.__recordAction(
      window.__buildData({
        action: "addCookies",
        cookies: cookieList,
      })
    );
    await Promise.all([window.__addCookies(cookieList), closeDock()]);
  };

  const floatingDeleteCookieDockConfirm = async (cookieList) => {
    window.__recordAction(
      window.__buildData({
        action: "deleteCookies",
        cookies: cookieList,
      })
    );
    await Promise.all([window.__deleteCookies(cookieList), closeDock()]);
  };

  const recordAddReuseStep = async (fileName, params) => {
    let expectedStep = params
      ? `use(${fileName}) ${params}`
      : `use(${fileName})`;

    window.__recordAction(
      window.__buildData({
        action: "addReuse",
        expected: expectedStep,
      })
    );
    await closeDock();
  };

  const recordTextInPdfStep = async (
    basePdfFileName,
    expected,
    isSoftAssert
  ) => {
    window.__recordAction(
      window.__buildData({
        action: "assertTextInPdf",
        basePdfFileName: basePdfFileName.endsWith(".pdf")
          ? basePdfFileName
          : `${basePdfFileName}.pdf`,
        expected,
        isSoftAssert,
      })
    );
    await closeDock();
  };

  const recordPdfCompareStep = async (
    basePdfFileNm,
    referencePdfFileNm,
    pageRng,
    isSoftAssert,
    type
  ) => {
    const assertionMapping = ASSERTION_NAME_LOOKUP[type];
    const category = "exact";
    const polarity = "positive";
    const assertName = assertionMapping[category][polarity];
    let pdfComparisonPages = [];

    if (pageRng && typeof pageRng === "string" && pageRng !== "") {
      const pgs = pageRng.trim().split(",");

      for (let p of pgs) {
        if (p === "") continue;
        if (Number.isNaN(Number(p))) {
          console.warn(
            `Received non-numeric value in page range. Page range passed ${pgs} and non-numeric value is: ${p}`
          );
          pdfComparisonPages = [];
          break;
        } else {
          pdfComparisonPages.push(Number(p));
        }
      }
    }

    let basePdfFileName = basePdfFileNm.endsWith(".pdf")
      ? basePdfFileNm
      : `${basePdfFileNm}.pdf`;

    const referencePdfFileName = referencePdfFileNm.endsWith(".pdf")
      ? referencePdfFileNm
      : `${referencePdfFileNm}.pdf`;

    window.__recordAction(
      window.__buildData({
        action: assertName,
        basePdfFileName,
        referencePdfFileName,
        pdfComparisonPages,
        isSoftAssert,
      })
    );
    await closeDock();
  };

  try {
    if (
      type === ASSERTIONMODES.TEXT ||
      type === ASSERTIONMODES.VALUE ||
      type === ASSERTIONMODES.ASSERTTEXTINPAGESOURCE
    ) {
      floatingAssertRoot.render(
        <FloatingAssertDock
          mode={mode}
          el={el}
          onCancel={closeDock}
          onConfirm={floatingAssertDockOnConfirm}
        />
      );
    } else if (type === ASSERTIONMODES.ASSERTCURRENTURL) {
      floatingAssertRoot.render(
        <CurrentUrlAssertDock
          mode={mode}
          onCancel={closeDock}
          onConfirm={floatingAssertCurrentUrlConfirm}
        />
      );
    } else if (type === ASSERTIONMODES.ATTRIBUTEVALUE) {
      floatingAssertRoot.render(
        <AssertAttributeValueDock
          // getAttributes={getElementAttributes}
          mode={mode}
          el={el}
          onCancel={closeDock}
          onConfirm={recordAttributesAssert}
        />
      );
    } else if (type === ASSERTIONMODES.ASSERTCOOKIEVALUE) {
      floatingAssertRoot.render(
        <AssertCookieValueDock
          getCookies={getCookies}
          mode={mode}
          onCancel={closeDock}
          onConfirm={recordCookiesAssert}
        />
      );
    } else if (
      type === ASSERTIONMODES.CHECKBOXSTATE ||
      type === ASSERTIONMODES.RADIOSTATE
    ) {
      floatingAssertRoot.render(
        <AssertCheckedStateDock
          // getAttributes={getElementAttributes}
          // mode={mode}
          el={el}
          onCancel={closeDock}
          onConfirm={recordCheckboxRadioAssert}
          label={type === ASSERTIONMODES.CHECKBOXSTATE ? "Checkbox" : "Radio"}
        />
      );
    } else if (
      type === ASSERTIONMODES.VISIBILITY ||
      type === ASSERTIONMODES.ENABLED ||
      type === ASSERTIONMODES.PRSENECE
    ) {
      floatingAssertRoot.render(
        <FloatingAssertDockNonText
          mode={mode}
          el={el}
          onCancel={closeDock}
          onConfirm={floatingAssertDockNonTextConfirm}
        />
      );
    } else if (type === ASSERTIONMODES.ADDCOOKIES) {
      floatingAssertRoot.render(
        <FloatingCookieListDock
          onCancel={closeDock}
          onConfirm={floatingCookieListDockConfirm}
        />
      );
    } else if (type === ASSERTIONMODES.DELETECOOKIES) {
      floatingAssertRoot.render(
        <FloatingDeleteCookieDock
          onCancel={closeDock}
          onConfirm={floatingDeleteCookieDockConfirm}
        />
      );
    } else if (
      type === ASSERTIONMODES.DROPDOWNCONTAINS ||
      type === ASSERTIONMODES.DROPDOWNCOUNTIS ||
      type === ASSERTIONMODES.DROPDOWNCOUNTISNOT ||
      // type === ASSERTIONMODES.DROPDOWNINALPHABETICORDER ||
      type === ASSERTIONMODES.DROPDOWNNOTSELECTED ||
      type === ASSERTIONMODES.DROPDOWNSELECTED ||
      type === ASSERTIONMODES.DROPDOWNVALUESARE ||
      type === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT ||
      type === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT
    ) {
      if (el && el.tagName && el.tagName.toLowerCase().includes("select")) {
        floatingAssertRoot.render(
          <FloatingDropdownAssertDock
            mode={mode}
            el={el}
            onCancel={closeDock}
            onConfirm={recordDropdownAssert}
          />
        );
      } else {
        floatingAssertRoot.render(
          <FloatingAssertDockNotSupported
            mode={mode}
            el={el}
            onCancel={closeDock}
          />
        );
      }
    } else if (type === ASSERTIONMODES.DROPDOWNINALPHABETICORDER) {
      if (el && el.tagName && el.tagName.toLowerCase().includes("select")) {
        floatingAssertRoot.render(
          <FloatingDropdownOrderAssertDock
            el={el}
            onCancel={closeDock}
            onConfirm={recordDropdownOrderAssert}
          />
        );
      } else {
        floatingAssertRoot.render(
          <FloatingAssertDockNotSupported
            mode={mode}
            el={el}
            onCancel={closeDock}
          />
        );
      }
    } else if (type === ASSERTIONMODES.ADDREUSESTEP) {
      floatingAssertRoot.render(
        <AddReuseTextBoxDock
          onCancel={closeDock}
          onConfirm={recordAddReuseStep}
          // onConfirm={(fileName, params) => recordAddReuseStep(fileName, params)}
        />
      );
    } else if (type === ASSERTIONMODES.ASSERTTEXTINPDF) {
      floatingAssertRoot.render(
        <FloatingAssertTextInPdf
          onCancel={closeDock}
          onConfirm={recordTextInPdfStep}
        />
      );
    } else if (
      type === ASSERTIONMODES.ASSERTPDFCOMPARISON ||
      type === ASSERTIONMODES.ASSERTTEXTIMAGESINPDF ||
      type === ASSERTIONMODES.ASSERTCPDPDF
    ) {
      floatingAssertRoot.render(
        <FloatingAssertPdfCompare
          type={type}
          onCancel={closeDock}
          onConfirm={recordPdfCompareStep}
        />
      );
    } else if (
      type === ASSERTIONMODES.GETTEXT ||
      type === ASSERTIONMODES.GETVALUE ||
      type === ASSERTIONMODES.ISENABLED ||
      type === ASSERTIONMODES.ISPRESENT ||
      type === ASSERTIONMODES.ISELEMENTCLICKABLE ||
      type === ASSERTIONMODES.ISDISPLAYED ||
      type === ASSERTIONMODES.GETINNERHTML
    ) {
      floatingAssertRoot.render(
        <FloatingElementTextAssignmentDock
          mode={mode}
          el={el}
          onCancel={closeDock}
          e={e}
          textValue={textValue}
        />
      );
    } else if (type === ASSERTIONMODES.GETATTRIBUTE) {
      floatingAssertRoot.render(
        <FloatingElementGetAttrAssignDock
          mode={mode}
          el={el}
          onCancel={closeDock}
          e={e}
          textValue={textValue}
        />
      );
    } else if (type === ASSERTIONMODES.ISATTRIBUTEEQUALS) {
      floatingAssertRoot.render(
        <FloatingElementAttrEqualsAssignDock
          mode={mode}
          el={el}
          onCancel={closeDock}
          e={e}
          textValue={textValue}
        />
      );
    }
  } catch (err) {
    console.error("❌ React render failed:", err);
  }
};
