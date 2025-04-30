export const ASSERTIONMODES = {
  TEXT: "text",
  VALUE: "value",
  VISIBILITY: "visibility",
  INVISIBILITY: "isNotVisible",
  PRSENECE: "presence",
  NOTPRESENT: "isAbsent",
  ATTRIBUTEVALUE: "attrValue",
  ASSERTCOOKIEVALUE: "assertCookieValue",
  CHECKBOXSTATE: "checkBoxState",
  RADIOSTATE: "radioState",
  DROPDOWNSELECTED: "dropdownSelected",
  DROPDOWNNOTSELECTED: "dropdownNotSelected",
  DROPDOWNCOUNTIS: "dropdownCountIs",
  DROPDOWNCOUNTISNOT: "dropdownCountIsNot",
  ASSERTCURRENTURL: "assertCurentUrl",
  ASSERTTEXTINPAGESOURCE: "assertTextInPageSource",
  ASSERTTEXTINPDF: "assertTextInPdf",
  ASSERTPDFCOMPARISON: "assertPdfComparison",
  ASSERTTEXTIMAGESINPDF: "assertTextImagesInPdf",
  ASSERTCPDPDF: "assertCpdPdf",

  DROPDOWNVALUESARE: "dropdownValuesAre",
  DROPDOWNINALPHABETICORDER: "dropdownInAlphabeticOrder",
  DROPDOWNDUPLICATECOUNT: "dropdownDuplicateCount",

  DROPDOWNCONTAINS: "dropdownContains",

  NETPAYLOAD: "networkPayload",
  NETREQUEST: "networkRequest",
  ENABLED: "enabled",
  DISABLED: "isDisabled",
  ADDCOOKIES: "addCookies",
  DELETECOOKIES: "deleteCookies",
  TAKESCREENSHOT: "takeScreenshot",
  ADDREUSESTEP: "addReuseStep",
  PAGERELOAD: "pageReload",
};

export const ASSERTIONNAMES = {
  ASSERTCOOKIEVALUEEQUALS: "assertCookieValueEquals",
  ASSERTCOOKIEVALUENOTEQUALS: "assertCookieValueNotEquals",

  ASSERTCOOKIEVALUECONTAINS: "assertCookieValueContains",
  ASSERTCOOKIEVALUENOTCONTAINS: "assertCookieValueNotContains",

  TEXT: "toHaveText",
  VALUE: "toHaveValue",
  TEXTNOTEQUALS: "toNotHaveText",
  VALUENOTEQUALS: "toNotHaveValue",

  TEXTCONTAINS: "toContainText",
  VALUECONTAINS: "toContainValue",
  TEXTNOTCONTAINS: "toNotContainText",
  VALUENOTCONTAINS: "toNotContainValue",

  ASSERTTEXTINPAGESOURCE: "assertTextInPageSource",
  ASSERTTEXTINPDF: "assertTextInPdf",
  ASSERTPDFCOMPARISON: "assertPdfComparison",
  ASSERTTEXTIMAGESINPDF: "assertTextImagesInPdf",
  ASSERTCPDPDF: "assertCpdPdf",

  ASSERTTEXTINPAGESOURCENOTEQUALS: "assertTextInPageSourceNotEquals",
  ASSERTTEXTINPAGESOURCECONTAINS: "assertTextInPageSourceContains",
  ASSERTTEXTINPAGESOURCENOTCONTAINS: "assertTextInPageSourceNotContains",

  ATTRIBUTEVALUE: "attrValue",

  ATTRIBUTEVALUEEQUALS: "isAttrValueEquals",
  ATTRIBUTEVALUECONTAINS: "isAttrValueContains",
  NOTATTRIBUTEVALUEEQUALS: "isNotAttrValueEquals",
  NOTATTRIBUTEVALUECONTAINS: "isNotAttrValueContains",

  CHECKBOXCHECKED: "isCheckBoxChecked",
  CHECKBOXNOTCHECKED: "isCheckBoxNotChecked",
  RADIOCHECKED: "isRadioChecked",
  RADIONOTCHECKED: "isRadioNotChecked",

  DROPDOWNSELECTED: "dropdownSelected",
  DROPDOWNNOTSELECTED: "dropdownNotSelected",
  DROPDOWNCOUNTIS: "dropdownCountIs",
  DROPDOWNCOUNTISNOT: "dropdownCountIsNot",

  DROPDOWNVALUESARE: "dropdownValuesAre",
  DROPDOWNINALPHABETICORDER: "dropdownInAlphabeticOrder",
  DROPDOWNDUPLICATECOUNT: "dropdownDuplicateCount",
  DROPDOWNCONTAINS: "dropdownContains",

  NETPAYLOAD: "toHaveNetPayload",
  NETREQUEST: "toHaveValue",
  VISIBILITY: "isVisible",
  INVISIBILITY: "isNotVisible",
  // INVISIBILITY: "isNotVisible",
  ENABLED: "isEnabled",
  DISABLED: "isDisabled",
  PRSENECE: "isPresent",
  NOTPRESENT: "isAbsent",
  // NOTPRESENT="isAbsent",
  ADDCOOKIES: "addCookies",
  DELETECOOKIES: "deleteCookies",
  TAKESCREENSHOT: "takeScreenshot",
  ADDREUSESTEP: "addReuseStep",
  PAGERELOAD: "pageReload",

  ASSERTCURRENTURLEQUALS: "assertCurentUrlEquals",
  ASSERTCURRENTURLCONTAINS: "assertCurentUrlContains",
  ASSERTCURRENTURLNOTEQUALS: "assertCurentUrlNotEquals",
  ASSERTCURRENTURLNOTCONTAINS: "assertCurentUrlNotContains",
};

export const FUNCTIONMAPPER = {
  ASSERTCURRENTURLEQUALS: {
    key: "assertCurentUrlEquals",
    name: "assertCurentUrlEquals",
  },
  CLICK: { key: "click", name: "click" },
  INPUT: { key: "input", name: "input" },
  TEXT: { key: "toHaveText", name: "elementTextEquals" },
  VALUE: "toHaveValue",

  ATTRIBUTEVALUEEQUALS: {
    key: "isAttrValueEquals",
    name: "assertElementEqualAttributeValue",
  },
  ATTRIBUTEVALUECONTAINS: {
    key: "isAttrValueContains",
    name: "assertElementContainsAttributeValue",
  },
  NOTATTRIBUTEVALUEEQUALS: {
    key: "isNotAttrValueEquals",
    name: "assertElementNotEqualAttributeValue",
  },
  NOTATTRIBUTEVALUECONTAINS: {
    key: "isNotAttrValueContains",
    name: "assertElementNotContainsAttributeValue",
  },

  CHECKBOXCHECKED: "isCheckBoxChecked",
  CHECKBOXNOTCHECKED: "isCheckBoxNotChecked",
  RADIOCHECKED: "isRadioChecked",
  RADIONOTCHECKED: "isRadioNotChecked",

  DROPDOWNSELECTED: {
    key: "dropdownSelected",
    name: "assertDropDownSelectedOption",
  },
  DROPDOWNNOTSELECTED: "dropdownNotSelected",
  DROPDOWNCOUNTIS: {
    key: "dropdownCountIs",
    name: "assertDropDownOptionsCount",
  },
  DROPDOWNCOUNTISNOT: "dropdownCountIsNot",

  DROPDOWNVALUESARE: "dropdownValuesAre",
  DROPDOWNINALPHABETICORDER: {
    key: "dropdownInAlphabeticOrder",
    name: "assertDropDownInAlphabeticOPrder",
  },
  DROPDOWNDUPLICATECOUNT: "dropdownDuplicateCount",
  DROPDOWNCONTAINS: {
    key: "dropdownContains",
    name: "assertValueInDropDownList",
  },

  NETPAYLOAD: "toHaveNetPayload",
  NETREQUEST: "toHaveValue",
  VISIBILITY: { key: "isVisible", name: "assertElementVisible" },
  INVISIBILITY: { key: "isNotVisible", name: "assertElementNotVisible" },
  ENABLED: "isEnabled",
  DISABLED: "isDisabled",
  PRSENECE: "isPresent",
  NOTPRESENT: "isAbsent",
  ADDCOOKIES: "addCookies",
  DELETECOOKIES: "deleteCookies",
  TAKESCREENSHOT: "takeScreenshot",
  ADDREUSESTEP: "addReuseStep",
  PAGERELOAD: "pageReload",
  NAVIGATE: { key: "navigate", name: "url" },
  SWITCHTOWINDOW: { key: "switchToWindow", name: "switchWindow" },
};

export const NONDOCKASSERTIONNAMES = {
  // VISIBILITY: "isVisible",
  // ENABLED: "isEnabled",
  // DISABLED: "isDisabled",
  // PRSENECE: "isPresent",
};
