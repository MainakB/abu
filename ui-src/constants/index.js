export const ASSERTIONMODES = {
  TEXT: "text",
  VALUE: "value",
  VISIBILITY: "visibility",
  PRSENECE: "presence",
  ATTRIBUTEVALUE: "attrValue",
  CHECKBOXSTATE: "checkBoxState",
  RADIOSTATE: "radioState",
  DROPDOWNSELECTED: "dropdownSelected",
  DROPDOWNNOTSELECTED: "dropdownNotSelected",
  DROPDOWNCOUNTIS: "dropdownCountIs",
  DROPDOWNCOUNTISNOT: "dropdownCountIsNot",

  DROPDOWNVALUESARE: "dropdownValuesAre",
  DROPDOWNINALPHABETICORDER: "dropdownInAlphabeticOrder",
  DROPDOWNDUPLICATECOUNT: "dropdownDuplicateCount",

  DROPDOWNCONTAINS: "dropdownContains",

  NETPAYLOAD: "networkPayload",
  NETREQUEST: "networkRequest",
  ENABLED: "enabled",
  DISABLED: "disabled",
  ADDCOOKIES: "addCookies",
  DELETECOOKIES: "deleteCookies",
  TAKESCREENSHOT: "takeScreenshot",
  PAGERELOAD: "pageReload",
};

export const ASSERTIONNAMES = {
  TEXT: "toHaveText",
  VALUE: "toHaveValue",
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
  ENABLED: "isEnabled",
  DISABLED: "isDisabled",
  PRSENECE: "isPresent",
  ADDCOOKIES: "addCookies",
  DELETECOOKIES: "deleteCookies",
  TAKESCREENSHOT: "takeScreenshot",
  PAGERELOAD: "pageReload",
};

export const FUNCTIONMAPPER = {
  CLICK: { key: "click" },
  INPUT: { key: "input" },
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
  ENABLED: "isEnabled",
  DISABLED: "isDisabled",
  PRSENECE: "isPresent",
  ADDCOOKIES: "addCookies",
  DELETECOOKIES: "deleteCookies",
  TAKESCREENSHOT: "takeScreenshot",
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
