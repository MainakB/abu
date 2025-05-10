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
  ASSERTTEXTINPDF: "ASSERTTEXTINPDF",
  ASSERTPDFCOMPARISON: "ASSERTPDFCOMPARISON",
  ASSERTTEXTIMAGESINPDF: "ASSERTTEXTIMAGESINPDF",
  ASSERTCPDPDF: "ASSERTCPDPDF",

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
  ADDREUSESTEP: "ADDREUSESTEP",
  PAGERELOAD: "pageReload",

  // Variable assignments
  GETTEXT: "GETTEXT",
  GETINNERHTML: "GETINNERHTML",
  GETVALUE: "GETVALUE",
  GETATTRIBUTE: "GETATTRIBUTE",
  GETTOOLTIPTEXT: "GETTOOLTIPTEXT",
  ISCHECKBOXSELECTED: "ISCHECKBOXSELECTED",
  ISCHECKBOXNOTSELECTED: "ISCHECKBOXNOTSELECTED",
  ISRADIOBUTTONSELECTED: "ISRADIOBUTTONSELECTED",
  ISRADIOBUTTONNOTSELECTED: "ISRADIOBUTTONNOTSELECTED",
  GETDROPDOWNSELECTEDOPTION: "GETDROPDOWNSELECTEDOPTION",
  GETDROPDOWNCOUNTWITHTEXT: "GETDROPDOWNCOUNTWITHTEXT",
  GETDROPDOWNCOUNTWITHSUBTEXT: "GETDROPDOWNCOUNTWITHSUBTEXT",
  GETCSS: "GETCSS",
  ISATTRIBUTEEQUALS: "ISATTRIBUTEEQUALS",
  ISATTRIBUTENOTEQUALS: "ISATTRIBUTENOTEQUALS",
  ISATTRIBUTECONTAINS: "ISATTRIBUTECONTAINS",
  ISATTRIBUTENOTCONTAINS: "ISATTRIBUTENOTCONTAINS",
  ISENABLED: "ISENABLED",
  ISNOTENABLED: "ISNOTENABLED",
  ISPRESENT: "ISPRESENT",
  ISNOTPRESENT: "ISNOTPRESENT",
  ISELEMENTCLICKABLE: "ISELEMENTCLICKABLE",
  ISELEMENTNOTCLICKABLE: "ISELEMENTNOTCLICKABLE",
  ISDISPLAYED: "ISDISPLAYED",
  ISNOTDISPLAYED: "ISNOTDISPLAYED",
  SINGLEVARASSIGNDBCONFIG: "SINGLEVARASSIGNDBCONFIG",
  SINGLEVARASSIGNDBQUERY: "SINGLEVARASSIGNDBQUERY",

  GETCOOKIES: "GETCOOKIES",
  GETCOOKIE: "GETCOOKIE",
  GETALERTTEXT: "GETALERTTEXT",

  PAGESOURCECONTAINS: "PAGESOURCECONTAINS",

  GETDBVALUE: "GETDBVALUE",
  GETDBROW: "GETDBROW",
  GETDBROWS: "GETDBROWS",
  RUNDBQUERY: "RUNDBQUERY",

  GETEMAIL: "GETEMAIL",
  DELETEEMAIL: "DELETEEMAIL",
  DELETEALLEMAIL: "DELETEALLEMAIL",
  GETRANDOMEMAIL: "GETRANDOMEMAIL",
  GETERANDOMNUMBERS: "GETERANDOMNUMBERS",

  READFILE: "READFILE",
  GETREQUESTURL: "GETREQUESTURL",
  GETREQUESTURLS: "GETREQUESTURLS",
  ISREQUESTURLPRESENT: "ISREQUESTURLPRESENT",
  ISREQUESTURLNOTPRESENT: "ISREQUESTURLNOTPRESENT",
  GETPAYLOADFROMNETWORKTAB: "GETPAYLOADFROMNETWORKTAB",
  GETCURRENTURL: "GETCURRENTURL",
  ISURLEQUAL: "ISURLEQUAL",
  ISURLNOTEQUAL: "ISURLNOTEQUAL",
  GETPDFTEXT: "GETPDFTEXT",
  GETPDFPAGECOUNT: "GETPDFPAGECOUNT",
  GETPDFPAGEORIENTATION: "GETPDFPAGEORIENTATION",
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
  // ADDREUSESTEP: "addReuseStep",
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
  ASSERTCURRENTURLNOTEQUALS: {
    key: "assertCurentUrlNotEquals",
    name: "assertCurentUrlNotEquals",
  },
  ASSERTCURRENTURLCONTAINS: {
    key: "assertCurentUrlContains",
    name: "assertCurentUrlContains",
  },
  ASSERTCURRENTURLNOTCONTAINS: {
    key: "assertCurentUrlNotContains",
    name: "assertCurentUrlNotContains",
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
  ADDREUSESTEP: {
    key: ASSERTIONMODES.ADDREUSESTEP,
    name: "use",
  },
  PAGERELOAD: "pageReload",
  NAVIGATE: { key: "navigate", name: "url" },
  SWITCHTOWINDOW: { key: "switchToWindow", name: "switchWindow" },
  SWITCHFRAME: { key: "switchFrame", name: "switchFrame" },
  SWITCHTODEFAULTFRAME: { key: "switchToDefaultFrame", name: "switchFrame" },
  GETATTRIBUTE: {
    key: ASSERTIONMODES.GETATTRIBUTE,
    name: "attribute",
  },
  ISATTRIBUTEEQUALS: {
    key: ASSERTIONMODES.ISATTRIBUTEEQUALS,
    name: "isAttributeEquals",
  },
  ISATTRIBUTENOTEQUALS: {
    key: ASSERTIONMODES.ISATTRIBUTENOTEQUALS,
    name: "isAttributeNotEquals",
  },
  ISATTRIBUTECONTAINS: {
    key: ASSERTIONMODES.ISATTRIBUTECONTAINS,
    name: "isAttributeContains",
  },
  ISATTRIBUTENOTCONTAINS: {
    key: ASSERTIONMODES.ISATTRIBUTENOTCONTAINS,
    name: "isAttributeNotContains",
  },

  ISENABLED: {
    key: ASSERTIONMODES.ISENABLED,
    name: "isEnabled",
  },
  ISNOTENABLED: {
    key: ASSERTIONMODES.ISNOTENABLED,
    name: "isDisabled",
  },
  ISPRESENT: {
    key: ASSERTIONMODES.ISPRESENT,
    name: "isPresent",
  },
  ISNOTPRESENT: {
    key: ASSERTIONMODES.ISNOTPRESENT,
    name: "isAbsent",
  },
  ISELEMENTCLICKABLE: {
    key: ASSERTIONMODES.ISELEMENTCLICKABLE,
    name: "isElementClickable",
  },
  ISELEMENTNOTCLICKABLE: {
    key: ASSERTIONMODES.ISELEMENTNOTCLICKABLE,
    name: "isElementNotClickable",
  },
  ISDISPLAYED: {
    key: ASSERTIONMODES.ISDISPLAYED,
    name: "isDisplayed",
  },
  ISNOTDISPLAYED: {
    key: ASSERTIONMODES.ISNOTDISPLAYED,
    name: "isNotDisplayed",
  },
  GETTEXT: {
    key: ASSERTIONMODES.GETTEXT,
    name: "text",
  },
  GETVALUE: {
    key: ASSERTIONMODES.GETVALUE,
    name: "attribute",
  },
  GETINNERHTML: {
    key: ASSERTIONMODES.GETINNERHTML,
    name: "getInnerHtml",
  },

  ISCHECKBOXSELECTED: {
    key: ASSERTIONMODES.ISCHECKBOXSELECTED,
    name: "isCheckboxSelected",
  },
  ISCHECKBOXNOTSELECTED: {
    key: ASSERTIONMODES.ISCHECKBOXNOTSELECTED,
    name: "isCheckboxNotSelected",
  },
  ISRADIOBUTTONSELECTED: {
    key: ASSERTIONMODES.ISRADIOBUTTONSELECTED,
    name: "isRadioSelected",
  },
  ISRADIOBUTTONNOTSELECTED: {
    key: ASSERTIONMODES.ISRADIOBUTTONNOTSELECTED,
    name: "isRadioNotSelected",
  },

  GETDROPDOWNSELECTEDOPTION: {
    key: ASSERTIONMODES.GETDROPDOWNSELECTEDOPTION,
    name: "getDropdownSelectedOption",
  },
  GETDROPDOWNCOUNTWITHTEXT: {
    key: ASSERTIONMODES.GETDROPDOWNCOUNTWITHTEXT,
    name: "getDropdownCountWithText",
  },
  GETDROPDOWNCOUNTWITHSUBTEXT: {
    key: ASSERTIONMODES.GETDROPDOWNCOUNTWITHSUBTEXT,
    name: "getSubTextInDropdownCount",
  },
  ASSERTPDFCOMPARISON: {
    key: ASSERTIONMODES.ASSERTPDFCOMPARISON,
    name: "assertPdfComparison",
  },
  ASSERTTEXTIMAGESINPDF: {
    key: ASSERTIONMODES.ASSERTTEXTIMAGESINPDF,
    name: "assertTextImagesInPdf",
  },
  ASSERTCPDPDF: {
    key: ASSERTIONMODES.ASSERTCPDPDF,
    name: "assertCPDPdf",
  },
  ASSERTTEXTINPDF: {
    key: ASSERTIONMODES.ASSERTTEXTINPDF,
    name: "assertTextContentOnPdf",
  },

  GETDBVALUE: {
    key: ASSERTIONMODES.GETDBVALUE,
    name: "readDbValue",
  },
  GETDBROW: {
    key: ASSERTIONMODES.GETDBROW,
    name: "readDbRow",
  },
  GETDBROWS: {
    key: ASSERTIONMODES.GETDBROWS,
    name: "readDbRows",
  },
  RUNDBQUERY: {
    key: ASSERTIONMODES.RUNDBQUERY,
    name: "runQuery",
  },

  SINGLEVARASSIGNDBCONFIG: {
    key: ASSERTIONMODES.SINGLEVARASSIGNDBCONFIG,
    name: "PLACEHOLDER",
  },
  SINGLEVARASSIGNDBQUERY: {
    key: ASSERTIONMODES.SINGLEVARASSIGNDBQUERY,
    name: "PLACEHOLDER",
  },
};

export const NONDOCKASSERTIONNAMES = {
  // VISIBILITY: "isVisible",
  // ENABLED: "isEnabled",
  // DISABLED: "isDisabled",
  // PRSENECE: "isPresent",
};
