import React from "react";
import ReactDOM from "react-dom/client";
import FloatingAssertDock from "./components/docked-panes/text-dock/FloatingAssertDock.jsx";
import FloatingAssertDockNonText from "./components/docked-panes/non-text-dock/FloatingAssertDockNonText.jsx";
import FloatingCookieListDock from "./components/docked-panes/cookie-dock/FloatingCookieListDock.jsx";
import FloatingDeleteCookieDock from "./components/docked-panes/cookie-dock/FloatingDeleteCookieDock.jsx";
import AssertAttributeValueDock from "./components/docked-panes/attributes-dock/AssertAttributeValueDock.jsx";
import AssertCheckedStateDock from "./components/docked-panes/checked-state-dock/AssertCheckedStateDock.jsx";
import FloatingDropdownAssertDock from "./components/docked-panes/dropdown-dock/FloatingDropdownAssertDock.jsx";
import FloatingAssertDockNotSupported from "./components/docked-panes/dropdown-dock/FloatingAssertDockNotSupported.jsx";
import CurrentUrlAssertDock from "./components/docked-panes/current-url-dock/CurrentUrlAssertDock.jsx";

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
  // let rootEl = doc.getElementById("floating-assert-dock-root");

  // // 💡 If stale root exists, remove and recreate it
  // if (floatingAssertRoot && !rootEl) {
  //   floatingAssertRoot = null; // stale ref, kill it
  // }

  // if (!rootEl) {
  //   rootEl = doc.createElement("div");
  //   rootEl.id = "floating-assert-dock-root";
  //   doc.documentElement.appendChild(rootEl);
  // }

  // // ✅ Re-create React root if needed
  // if (!floatingAssertRoot) {
  //   floatingAssertRoot = ReactDOM.createRoot(rootEl);
  // }
  ensureFloatingRoot(doc);

  let textValue = "";
  if (
    el
    // !(
    //   type === ASSERTIONMODES.ADDCOOKIES ||
    //   type === ASSERTIONMODES.DELETECOOKIES ||
    //   type === ASSERTIONMODES.DELETECOOKIES
    // )
  ) {
    textValue = el.innerText?.trim() || "";
  }

  const closeDock = async () => {
    if (floatingAssertRoot) {
      floatingAssertRoot.unmount();
      floatingAssertRoot = null;
    }
    doc.getElementById("floating-assert-dock-root")?.remove();
    await window.__recorderStore.setMode("record");
  };

  const getElementAttributes = async (el) => {
    const attrList = await el.getAttributeNames();
    const attributes = {};

    for (let i = 0; i < attrList.length; i++) {
      const attr = attrList[i];
      const attrValue = await el.getAttribute(attr);
      attributes[attr] = attrValue;
    }

    return attributes;
  };

  const getRecordAttributeAssertionMode = (isNegative, isSubstringMatch) => {
    if (isNegative) {
      if (isSubstringMatch) {
        return ASSERTIONNAMES.NOTATTRIBUTEVALUECONTAINS;
      } else {
        return ASSERTIONNAMES.NOTATTRIBUTEVALUEEQUALS;
      }
    } else {
      if (isSubstringMatch) {
        return ASSERTIONNAMES.ATTRIBUTEVALUECONTAINS;
      } else {
        return ASSERTIONNAMES.ATTRIBUTEVALUEEQUALS;
      }
    }
  };

  const recordAttributesAssert = async (
    selectedAssertions,
    isSoftAssert,
    locatorName
  ) => {
    for (let i = 0; i < selectedAssertions.length; i++) {
      const attrObj = selectedAssertions[i];
      const attrMode = getRecordAttributeAssertionMode(
        attrObj.isNegative,
        attrObj.isSubstringMatch
      );
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
    // let assertName = ASSERTIONNAMES.TEXT;

    // if (mode === ASSERTIONMODES.VALUE) {
    //   assertName = ASSERTIONNAMES.VALUE;
    // }

    // let assertName = ASSERTIONNAMES.TEXT;
    // if (mode === ASSERTIONMODES.TEXT){
    //   if(exact){
    //     if(isNegative){
    //       assertName = ASSERTIONNAMES.TEXTNOTEQUALS;
    //     }
    //   } else{
    //     if(isNegative){
    //       assertName = ASSERTIONNAMES.TEXTNOTCONTAINS;
    //     }  else{
    //       assertName = ASSERTIONNAMES.TEXTCONTAINS;
    //     }
    //   }

    // } else{
    //   if(exact){
    //     if(isNegative){
    //       assertName = ASSERTIONNAMES.VALUE;
    //     } else{
    //       assertName = ASSERTIONNAMES.VALUENOTEQUALS;
    //     }
    //   } else{
    //     if(isNegative){
    //       assertName = ASSERTIONNAMES.VALUECONTAINS;
    //     }  else{
    //       assertName = ASSERTIONNAMES.VALUENOTCONTAINS;
    //     }
    //   }
    // }

    let assertName;

    const isText = mode === ASSERTIONMODES.TEXT;

    if (exact) {
      assertName = isText
        ? isNegative
          ? ASSERTIONNAMES.TEXTNOTEQUALS
          : ASSERTIONNAMES.TEXT
        : isNegative
        ? ASSERTIONNAMES.VALUENOTEQUALS
        : ASSERTIONNAMES.VALUE;
    } else {
      assertName = isText
        ? isNegative
          ? ASSERTIONNAMES.TEXTNOTCONTAINS
          : ASSERTIONNAMES.TEXTCONTAINS
        : isNegative
        ? ASSERTIONNAMES.VALUECONTAINS
        : ASSERTIONNAMES.VALUENOTCONTAINS;
    }

    // TEXT: "toHaveText",
    // VALUE: "toHaveValue",
    // TEXTNOTEQUALS: "toNotHaveText",
    // VALUENOTEQUALS: "toNotHaveValue",

    // TEXTCONTAINS: "toContainText",
    // VALUECONTAINS: "toContainValue",
    // TEXTNOTCONTAINS: "toNotContainText",
    // VALUENOTCONTAINS: "toNotContainValue",

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
    let assertionName =
      ASSERTIONNAMES[
        !exactMatch ? "ASSERTCURRENTURLCONTAINS" : "ASSERTCURRENTURLEQUALS"
      ];
    if (isNegative) {
      if (!exactMatch) {
        assertionName = ASSERTIONNAMES.ASSERTCURRENTURLNOTCONTAINS;
      } else {
        assertionName = ASSERTIONNAMES.ASSERTCURRENTURLNOTEQUALS;
      }
    }

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
    let modeVal = mode;
    if (isNegative) {
      if (mode === ASSERTIONMODES.PRSENECE) {
        modeVal = ASSERTIONNAMES.NOTPRESENT;
      } else if (mode === ASSERTIONMODES.ENABLED) {
        modeVal = ASSERTIONNAMES.DISABLED;
      } else if (mode === ASSERTIONMODES.VISIBILITY) {
        modeVal = ASSERTIONNAMES.INVISIBILITY;
      }
    }

    window.__recordAction(
      window.__buildData({
        action: "assert",
        locatorName,
        isSoftAssert,
        assertion: modeVal,
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

  if (type === ASSERTIONMODES.TEXT || type === ASSERTIONMODES.VALUE) {
    floatingAssertRoot.render(
      <FloatingAssertDock
        mode={mode}
        el={el}
        onCancel={closeDock}
        onConfirm={(expected, isSoftAssert, locatorName, exact, isNegative) =>
          floatingAssertDockOnConfirm(
            expected,
            isSoftAssert,
            locatorName,
            exact,
            isNegative
          )
        }
      />
    );
  } else if (type === ASSERTIONMODES.ASSERTCURRENTURL) {
    floatingAssertRoot.render(
      <CurrentUrlAssertDock
        mode={mode}
        onCancel={closeDock}
        onConfirm={(expected, isSoftAssert, isNegative, exactMatch) =>
          floatingAssertCurrentUrlConfirm(
            expected,
            isSoftAssert,
            isNegative,
            exactMatch
          )
        }
      />
    );
  } else if (type === ASSERTIONMODES.ATTRIBUTEVALUE) {
    floatingAssertRoot.render(
      <AssertAttributeValueDock
        getAttributes={getElementAttributes}
        mode={mode}
        el={el}
        onCancel={closeDock}
        onConfirm={(selectedAssertions, isSoftAssert, locatorName) =>
          recordAttributesAssert(selectedAssertions, isSoftAssert, locatorName)
        }
      />
    );
  } else if (
    type === ASSERTIONMODES.CHECKBOXSTATE ||
    type === ASSERTIONMODES.RADIOSTATE
  ) {
    floatingAssertRoot.render(
      <AssertCheckedStateDock
        getAttributes={getElementAttributes}
        mode={mode}
        el={el}
        onCancel={closeDock}
        onConfirm={(checkBoxState, isSoftAssert, elToUse, locatorName) =>
          recordCheckboxRadioAssert(
            checkBoxState,
            isSoftAssert,
            elToUse,
            locatorName
          )
        }
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
        onConfirm={(isSoftAssert, isNegative, locatorName) =>
          floatingAssertDockNonTextConfirm(
            isSoftAssert,
            isNegative,
            locatorName
          )
        }
      />
    );
  } else if (type === ASSERTIONMODES.ADDCOOKIES) {
    floatingAssertRoot.render(
      <FloatingCookieListDock
        onCancel={closeDock}
        onConfirm={(cookieList) => floatingCookieListDockConfirm(cookieList)}
      />
    );
  } else if (type === ASSERTIONMODES.DELETECOOKIES) {
    floatingAssertRoot.render(
      <FloatingDeleteCookieDock
        onCancel={closeDock}
        onConfirm={(cookieList) => floatingDeleteCookieDockConfirm(cookieList)}
      />
    );
  } else if (
    type === ASSERTIONMODES.DROPDOWNCONTAINS ||
    type === ASSERTIONMODES.DROPDOWNCOUNTIS ||
    type === ASSERTIONMODES.DROPDOWNCOUNTISNOT ||
    type === ASSERTIONMODES.DROPDOWNINALPHABETICORDER ||
    type === ASSERTIONMODES.DROPDOWNNOTSELECTED ||
    type === ASSERTIONMODES.DROPDOWNSELECTED ||
    type === ASSERTIONMODES.DROPDOWNVALUESARE ||
    type === ASSERTIONMODES.DROPDOWNDUPLICATECOUNT
  ) {
    if (el && el.tagName && el.tagName.toLowerCase().includes("select")) {
      floatingAssertRoot.render(
        <FloatingDropdownAssertDock
          mode={mode}
          el={el}
          onCancel={closeDock}
          onConfirm={(
            expected,
            softAssert,
            isNegative,
            assertName,
            modeVal,
            locatorName
          ) =>
            recordDropdownAssert(
              expected,
              softAssert,
              isNegative,
              assertName,
              modeVal,
              locatorName
            )
          }
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
  }
};
