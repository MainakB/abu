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
import FloatingApiRequestDock from "./components/docked-panes/api-request-dock/FloatingApiRequestDock.jsx";
import FloatingGenericVarAssignmentDock from "./components/docked-panes/generic-variable-assignment/FloatingGenericVarAssignmentDock.jsx";
import FloatingGenericVarMatchDock from "./components/docked-panes/generic-var-match-dock/FloatingGenericVarMatchDock.jsx";
import FloatingEmailAssignDock from "./components/docked-panes/email-operations-dock/FloatingEmailAssignDock.jsx";
import FloatingDeleteEmailDock from "./components/docked-panes/email-operations-dock/FloatingDeleteEmailDock.jsx";
import FloatingTitleAssignmentDock from "./components/docked-panes/title-assignment/FloatingTitleAssignmentDock.jsx";
import FloatingTitleMatchDock from "./components/docked-panes/title-match/FloatingTitleMatchDock.jsx";
import { ASSERTIONMODES } from "./constants/index.js";

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
      type === ASSERTIONMODES.ASSERTTEXTEQUALS ||
      type === ASSERTIONMODES.ASSERTVALUEEQUALS ||
      type === ASSERTIONMODES.ASSERTTEXTINPAGESOURCEEQUALS
    ) {
      floatingAssertRoot.render(
        <FloatingAssertDock
          mode={mode}
          el={el}
          e={e}
          textValue={textValue}
          onCancel={closeDock}
        />
      );
    } else if (type === ASSERTIONMODES.ASSERTCURRENTURLEQUALS) {
      floatingAssertRoot.render(
        <CurrentUrlAssertDock mode={mode} onCancel={closeDock} />
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
    } else if (type === ASSERTIONMODES.ASSERTCOOKIEVALUEEQUALS) {
      floatingAssertRoot.render(
        <AssertCookieValueDock mode={mode} onCancel={closeDock} />
      );
    } else if (
      type === ASSERTIONMODES.CHECKBOXSTATE ||
      type === ASSERTIONMODES.RADIOSTATE
    ) {
      floatingAssertRoot.render(
        <AssertCheckedStateDock
          mode={mode}
          el={el}
          e={e}
          onCancel={closeDock}
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
    } else if (type === ASSERTIONMODES.HTTP) {
      floatingAssertRoot.render(
        <FloatingApiRequestDock onCancel={closeDock} />
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
            e={e}
            onCancel={closeDock}
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
            e={e}
            mode={mode}
            onCancel={closeDock}
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
    } else if (type === ASSERTIONMODES.GETTITLE) {
      floatingAssertRoot.render(
        <TabbedAssertionDock
          defaultTab="assignment"
          tabs={[
            {
              key: "assignment",
              label: "Assignment",
              component: (
                <FloatingTitleAssignmentDock
                  mode={mode}
                  onCancel={closeDock}
                  tabbed={true}
                  overrideConfirmCancelFlexEnd={true}
                />
              ),
            },
            {
              key: "match",
              label: "Match",
              component: (
                <FloatingTitleMatchDock
                  mode={mode}
                  onCancel={closeDock}
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
    } else if (type === ASSERTIONMODES.GENERICVARASSIGN) {
      floatingAssertRoot.render(
        <FloatingGenericVarAssignmentDock onCancel={closeDock} />
      );
    } else if (type === ASSERTIONMODES.GENERICVARMATCHEQUALS) {
      floatingAssertRoot.render(
        <FloatingGenericVarMatchDock onCancel={closeDock} mode={mode} />
      );
    } else if (type === ASSERTIONMODES.GETEMAIL) {
      floatingAssertRoot.render(
        <FloatingEmailAssignDock onCancel={closeDock} />
      );
    } else if (type === ASSERTIONMODES.DELETEEMAIL) {
      floatingAssertRoot.render(
        <FloatingDeleteEmailDock onCancel={closeDock} />
      );
    }
  } catch (err) {
    console.error("❌ React render failed:", err);
  }
};
