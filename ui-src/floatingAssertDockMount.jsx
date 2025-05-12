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
import FloatingElementCheckboxRadioAssignDock from "./components/docked-panes/element-based-assignment/FloatingElementCheckboxRadioAssignDock.jsx";
import FloatingDrodownSelectedAssignDock from "./components/docked-panes/element-based-assignment/FloatingDrodownSelectedAssignDock.jsx";
import FloatingDBDataAssignDock from "./components/docked-panes/db-assignments/FloatingDBDataAssignDock.jsx";
import TabbedAssertionDock from "./components/docked-panes/tabbed-assign-match/TabbedAssertionDock.jsx";
import FloatingElementTextMatchDock from "./components/docked-panes/element-based-match/FloatingElementTextMatchDock.jsx";
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

  const getCookies = async () => {
    const cookies = await window.__getCookies();
    return cookies;
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

  const floatingCookieListDockConfirm = async (cookieList) => {
    window.__recordAction(
      window.__buildData({
        action: "addCookies",
        cookies: cookieList,
      })
    );
    await Promise.all([window.__addCookies(cookieList), closeDock()]);
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
    } else if (type === ASSERTIONMODES.ASSERTATTRIBUTEVALUEEQUALS) {
      floatingAssertRoot.render(
        <AssertAttributeValueDock
          mode={mode}
          el={el}
          e={e}
          onCancel={closeDock}
          textValue={textValue}
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
      type === ASSERTIONMODES.ASSERTVISIBILITY ||
      type === ASSERTIONMODES.ASSERTENABLED ||
      type === ASSERTIONMODES.ASSERTPRESENCE
    ) {
      floatingAssertRoot.render(
        <FloatingAssertDockNonText
          mode={mode}
          el={el}
          e={e}
          onCancel={closeDock}
          textValue={textValue}
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
        <FloatingDeleteCookieDock onCancel={closeDock} />
      );
    } else if (
      type === ASSERTIONMODES.DROPDOWNCONTAINS ||
      type === ASSERTIONMODES.DROPDOWNCOUNTIS ||
      type === ASSERTIONMODES.DROPDOWNCOUNTISNOT ||
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
      floatingAssertRoot.render(<AddReuseTextBoxDock onCancel={closeDock} />);
    } else if (type === ASSERTIONMODES.ASSERTTEXTINPDF) {
      floatingAssertRoot.render(
        <FloatingAssertTextInPdf onCancel={closeDock} mode={mode} />
      );
    } else if (
      type === ASSERTIONMODES.ASSERTPDFCOMPARISON ||
      type === ASSERTIONMODES.ASSERTTEXTIMAGESINPDF ||
      type === ASSERTIONMODES.ASSERTCPDPDF
    ) {
      floatingAssertRoot.render(
        <FloatingAssertPdfCompare type={type} onCancel={closeDock} />
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
        <TabbedAssertionDock
          defaultTab="assignment"
          tabs={[
            {
              key: "assignment",
              label: "Assignment",
              component: (
                <FloatingElementTextAssignmentDock
                  mode={mode}
                  el={el}
                  onCancel={closeDock}
                  e={e}
                  textValue={textValue}
                  tabbed={true}
                  overrideConfirmCancelFlexEnd={true}
                />
              ),
            },
            {
              key: "match",
              label: "Match",
              component: (
                <FloatingElementTextMatchDock
                  mode={mode}
                  el={el}
                  onCancel={closeDock}
                  e={e}
                  textValue={textValue}
                  tabbed={true}
                />
              ),
            },
          ]}
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
    } else if (
      type === ASSERTIONMODES.ISCHECKBOXSELECTED ||
      type === ASSERTIONMODES.ISRADIOBUTTONSELECTED
    ) {
      floatingAssertRoot.render(
        <FloatingElementCheckboxRadioAssignDock
          mode={mode}
          el={el}
          onCancel={closeDock}
          e={e}
          textValue={textValue}
        />
      );
    } else if (type === ASSERTIONMODES.GETDROPDOWNSELECTEDOPTION) {
      if (el && el.tagName && el.tagName.toLowerCase().includes("select")) {
        floatingAssertRoot.render(
          <FloatingDrodownSelectedAssignDock
            mode={mode}
            el={el}
            onCancel={closeDock}
            e={e}
            textValue={textValue}
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
    } else if (type === ASSERTIONMODES.GETDBVALUE) {
      floatingAssertRoot.render(
        <FloatingDBDataAssignDock mode={mode} onCancel={closeDock} />
      );
    }
  } catch (err) {
    console.error("❌ React render failed:", err);
  }
};
