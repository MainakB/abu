import { ASSERTIONMODES } from "../ui-src/constants/index.js";

const ASSERTION_NAME_LOOKUP = {
  [ASSERTIONMODES.ASSERTTEXTEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTTEXTEQUALS,
      negative: ASSERTIONMODES.ASSERTTEXTNOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.ASSERTTEXTCONTAINS,
      negative: ASSERTIONMODES.ASSERTTEXTNOTCONTAINS,
    },
  },
  [ASSERTIONMODES.ASSERTVALUEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTVALUEEQUALS,
      negative: ASSERTIONMODES.ASSERTVALUENOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.ASSERTVALUECONTAINS,
      negative: ASSERTIONMODES.ASSERTVALUENOTCONTAINS,
    },
  },
  [ASSERTIONMODES.ASSERTPRESENCE]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTPRESENCE,
      negative: ASSERTIONMODES.ASSERTABSENCE,
    },
  },
  [ASSERTIONMODES.ASSERTENABLED]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTENABLED,
      negative: ASSERTIONMODES.ASSERTDISABLED,
    },
  },
  [ASSERTIONMODES.ASSERTVISIBILITY]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTVISIBILITY,
      negative: ASSERTIONMODES.ASSERTINVISIBILITY,
    },
  },

  [ASSERTIONMODES.ASSERTCURRENTURLEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTCURRENTURLEQUALS,
      negative: ASSERTIONMODES.ASSERTCURRENTURLNOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.ASSERTCURRENTURLCONTAINS,
      negative: ASSERTIONMODES.ASSERTCURRENTURLNOTCONTAINS,
    },
  },
  [ASSERTIONMODES.ASSERTTEXTINPAGESOURCEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTTEXTINPAGESOURCEEQUALS,
      negative: ASSERTIONMODES.ASSERTTEXTINPAGESOURCENOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.ASSERTTEXTINPAGESOURCECONTAINS,
      negative: ASSERTIONMODES.ASSERTTEXTINPAGESOURCENOTCONTAINS,
    },
  },
  [ASSERTIONMODES.ASSERTCOOKIEVALUEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTCOOKIEVALUEEQUALS,
      negative: ASSERTIONMODES.ASSERTCOOKIEVALUENOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.ASSERTCOOKIEVALUECONTAINS,
      negative: ASSERTIONMODES.ASSERTCOOKIEVALUENOTCONTAINS,
    },
  },

  [ASSERTIONMODES.ASSERTATTRIBUTEVALUEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTATTRIBUTEVALUEEQUALS,
      negative: ASSERTIONMODES.ASSERTATTRIBUTEVALUENOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.ASSERTATTRIBUTEVALUECONTAINS,
      negative: ASSERTIONMODES.ASSERTATTRIBUTEVALUENOTCONTAINS,
    },
  },

  //
  [ASSERTIONMODES.ASSERTTEXTINPDF]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTTEXTINPDF,
    },
  },
  [ASSERTIONMODES.ASSERTPDFCOMPARISON]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTPDFCOMPARISON,
    },
  },
  [ASSERTIONMODES.ASSERTTEXTIMAGESINPDF]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTTEXTIMAGESINPDF,
    },
  },
  [ASSERTIONMODES.ASSERTCPDPDF]: {
    exact: {
      positive: ASSERTIONMODES.ASSERTCPDPDF,
    },
  },
  [ASSERTIONMODES.GETTEXT]: {
    exact: {
      positive: ASSERTIONMODES.GETTEXT,
    },
  },

  [ASSERTIONMODES.GETVALUE]: {
    exact: {
      positive: ASSERTIONMODES.GETVALUE,
    },
  },

  [ASSERTIONMODES.ISENABLED]: {
    exact: {
      positive: ASSERTIONMODES.ISENABLED,
      negative: ASSERTIONMODES.ISNOTENABLED,
    },
  },

  [ASSERTIONMODES.ISPRESENT]: {
    exact: {
      positive: ASSERTIONMODES.ISPRESENT,
      negative: ASSERTIONMODES.ISNOTPRESENT,
    },
  },

  [ASSERTIONMODES.ISDISPLAYED]: {
    exact: {
      positive: ASSERTIONMODES.ISDISPLAYED,
      negative: ASSERTIONMODES.ISNOTDISPLAYED,
    },
  },

  [ASSERTIONMODES.ISELEMENTCLICKABLE]: {
    exact: {
      positive: ASSERTIONMODES.ISELEMENTCLICKABLE,
      negative: ASSERTIONMODES.ISELEMENTNOTCLICKABLE,
    },
  },

  [ASSERTIONMODES.GETATTRIBUTE]: {
    exact: {
      positive: ASSERTIONMODES.GETATTRIBUTE,
    },
  },
  [ASSERTIONMODES.ISATTRIBUTEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.ISATTRIBUTEEQUALS,
      negative: ASSERTIONMODES.ISATTRIBUTENOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.ISATTRIBUTECONTAINS,
      negative: ASSERTIONMODES.ISATTRIBUTENOTCONTAINS,
    },
  },
  [ASSERTIONMODES.ISCHECKBOXSELECTED]: {
    exact: {
      positive: ASSERTIONMODES.ISCHECKBOXSELECTED,
      negative: ASSERTIONMODES.ISCHECKBOXNOTSELECTED,
    },
  },
  [ASSERTIONMODES.ISRADIOBUTTONSELECTED]: {
    exact: {
      positive: ASSERTIONMODES.ISRADIOBUTTONSELECTED,
      negative: ASSERTIONMODES.ISRADIOBUTTONNOTSELECTED,
    },
  },
  [ASSERTIONMODES.GETDROPDOWNSELECTEDOPTION]: {
    exact: {
      positive: ASSERTIONMODES.GETDROPDOWNSELECTEDOPTION,
    },
  },
  [ASSERTIONMODES.GETDROPDOWNCOUNTWITHTEXT]: {
    exact: {
      positive: ASSERTIONMODES.GETDROPDOWNCOUNTWITHTEXT,
    },
    contains: {
      positive: ASSERTIONMODES.GETDROPDOWNCOUNTWITHSUBTEXT,
    },
  },

  [ASSERTIONMODES.MATCHGETTEXTEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETTEXTEQUALS,
      negative: ASSERTIONMODES.MATCHGETTEXTNOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.MATCHGETTEXTCONTAINS,
      negative: ASSERTIONMODES.MATCHGETTEXTNOTCONTAINS,
    },
  },
  [ASSERTIONMODES.MATCHGETTEXTSTARTSWITH]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETTEXTSTARTSWITH,
      negative: ASSERTIONMODES.MATCHGETTEXTNOTSTARTSWITH,
    },
  },
  [ASSERTIONMODES.MATCHGETTEXTENDSWITH]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETTEXTENDSWITH,
      negative: ASSERTIONMODES.MATCHGETTEXTNOTENDSWITH,
    },
  },
  [ASSERTIONMODES.MATCHGETVALUEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETVALUEEQUALS,
      negative: ASSERTIONMODES.MATCHGETVALUENOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.MATCHGETVALUECONTAINS,
      negative: ASSERTIONMODES.MATCHGETVALUENOTCONTAINS,
    },
  },

  MATCHVARIABLESEQUALS: {
    exact: {
      positive: ASSERTIONMODES.MATCHVARIABLESEQUALS,
      negative: ASSERTIONMODES.MATCHVARIABLESNOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.MATCHVARIABLESCONTAINS,
      negative: ASSERTIONMODES.MATCHVARIABLESNOTCONTAINS,
    },
  },

  [ASSERTIONMODES.MATCHGETVALUESTARTSWITH]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETVALUESTARTSWITH,
      negative: ASSERTIONMODES.MATCHGETVALUENOTSTARTSWITH,
    },
  },
  [ASSERTIONMODES.MATCHGETVALUEENDSWITH]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETVALUEENDSWITH,
      negative: ASSERTIONMODES.MATCHGETVALUENOTENDSWITH,
    },
  },
  [ASSERTIONMODES.MATCHGETINNERHTMLEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETINNERHTMLEQUALS,
      negative: ASSERTIONMODES.MATCHGETINNERHTMLNOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.MATCHGETINNERHTMLCONTAINS,
      negative: ASSERTIONMODES.MATCHGETINNERHTMLNOTCONTAINS,
    },
  },

  [ASSERTIONMODES.MATCHGETINNERHTMLSTARTSWITH]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETINNERHTMLSTARTSWITH,
      negative: ASSERTIONMODES.MATCHGETINNERHTMLNOTSTARTSWITH,
    },
  },

  [ASSERTIONMODES.MATCHGETINNERHTMLENDSWITH]: {
    exact: {
      positive: ASSERTIONMODES.MATCHGETINNERHTMLENDSWITH,
      negative: ASSERTIONMODES.MATCHGETINNERHTMLNOTENDSWITH,
    },
  },

  [ASSERTIONMODES.MATCHISENABLEDEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.MATCHISENABLEDEQUALS,
      negative: ASSERTIONMODES.MATCHISENABLEDNOTEQUALS,
    },
  },
  [ASSERTIONMODES.MATCHISPRESENTEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.MATCHISPRESENTEQUALS,
      negative: ASSERTIONMODES.MATCHISPRESENTNOTEQUALS,
    },
  },
  [ASSERTIONMODES.MATCHISELEMENTCLICKABLEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.MATCHISELEMENTCLICKABLEEQUALS,
      negative: ASSERTIONMODES.MATCHISELEMENTCLICKABLENOTEQUALS,
    },
  },
  [ASSERTIONMODES.MATCHISDISPLAYEDEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.MATCHISDISPLAYEDEQUALS,
      negative: ASSERTIONMODES.MATCHISDISPLAYEDNOTEQUALS,
    },
  },
  [ASSERTIONMODES.DROPDOWNCOUNTIS]: {
    exact: {
      positive: ASSERTIONMODES.DROPDOWNCOUNTIS,
      negative: ASSERTIONMODES.DROPDOWNCOUNTISNOT,
    },
  },
  [ASSERTIONMODES.DROPDOWNSELECTED]: {
    exact: {
      positive: ASSERTIONMODES.DROPDOWNSELECTED,
      negative: ASSERTIONMODES.DROPDOWNNOTSELECTED,
    },
  },
  [ASSERTIONMODES.DROPDOWNCONTAINS]: {
    exact: {
      positive: ASSERTIONMODES.DROPDOWNCONTAINS,
    },
  },
  [ASSERTIONMODES.DROPDOWNVALUESARE]: {
    exact: {
      positive: ASSERTIONMODES.DROPDOWNVALUESARE,
    },
  },
  [ASSERTIONMODES.DROPDOWNDUPLICATECOUNT]: {
    exact: {
      positive: ASSERTIONMODES.DROPDOWNDUPLICATECOUNT,
    },
  },
  [ASSERTIONMODES.RADIOSTATE]: {
    checked: {
      positive: ASSERTIONMODES.RADIOCHECKED,
    },
    unchecked: {
      positive: ASSERTIONMODES.RADIONOTCHECKED,
    },
  },
  [ASSERTIONMODES.CHECKBOXSTATE]: {
    checked: {
      positive: ASSERTIONMODES.CHECKBOXCHECKED,
    },
    unchecked: {
      positive: ASSERTIONMODES.CHECKBOXNOTCHECKED,
    },
  },
  [ASSERTIONMODES.GENERICVARASSIGN]: {
    exact: {
      positive: ASSERTIONMODES.GENERICVARASSIGN,
    },
  },

  [ASSERTIONMODES.GENERICVARMATCHEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.GENERICVARMATCHEQUALS,
      negative: ASSERTIONMODES.GENERICVARMATCHNOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.GENERICVARMATCHCONTAINS,
      negative: ASSERTIONMODES.GENERICVARMATCHNOTCONTAINS,
    },
  },
  [ASSERTIONMODES.GENERICVARMATCHSTARTSWITH]: {
    exact: {
      positive: ASSERTIONMODES.GENERICVARMATCHSTARTSWITH,
      negative: ASSERTIONMODES.GENERICVARMATCHNOTSTARTSWITH,
    },
  },
  [ASSERTIONMODES.GENERICVARMATCHENDSWITH]: {
    exact: {
      positive: ASSERTIONMODES.GENERICVARMATCHENDSWITH,
      negative: ASSERTIONMODES.GENERICVARMATCHNOTENDSWITH,
    },
  },
  [ASSERTIONMODES.TITLEEQUALS]: {
    exact: {
      positive: ASSERTIONMODES.TITLEEQUALS,
      negative: ASSERTIONMODES.TITLENOTEQUALS,
    },
    contains: {
      positive: ASSERTIONMODES.TITLECONTAINS,
      negative: ASSERTIONMODES.TITLENOTCONTAINS,
    },
  },
  [ASSERTIONMODES.TITLEENDSSWITH]: {
    exact: {
      positive: ASSERTIONMODES.TITLEENDSSWITH,
      negative: ASSERTIONMODES.TITLENOTENDSSWITH,
    },
  },
  [ASSERTIONMODES.TITLESTARTSWITH]: {
    exact: {
      positive: ASSERTIONMODES.TITLESTARTSWITH,
      negative: ASSERTIONMODES.TITLENOTSTARTSWITH,
    },
  },
};

export const getElementAttributes = async (el) => {
  if (!el || typeof el.getAttributeNames !== "function") {
    console.warn("Invalid element passed to getElementAttributes");
    return {};
  }

  const attrList = el.getAttributeNames();
  const attributes = {};

  for (const attr of attrList) {
    const value = el.getAttribute(attr);

    // Normalize boolean-style attributes (e.g., `disabled`, `checked`)
    attributes[attr] = value === "" ? true : value;
  }

  // Include data-* attributes in camelCase via el.dataset
  const dataAttrs = { ...el.dataset };

  return {
    ...attributes,
    ...dataAttrs,
  };
};

export const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
};

export const flattenJson = (obj, prefix = "", result = {}) => {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const path = `${prefix}[${i}]`;
      flattenJson(item, path, result);
    });
  } else if (typeof obj === "object" && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      flattenJson(value, path, result);
    });
  } else {
    result[prefix] = String(obj); // convert values to string
  }

  return result;
};

export const floatingDeleteCookieDockConfirm = (
  cookieList,
  closeDock,
  windowDeleteCookies
) => {
  if (Array.isArray(cookieList) && cookieList.length === 0) {
    window.__recordAction(
      window.__buildData({
        action: ASSERTIONMODES.DELETECOOKIES,
        cookies: cookieList,
      })
    );
  } else {
    for (let cookie of cookieList) {
      window.__recordAction(
        window.__buildData({
          action: ASSERTIONMODES.DELETECOOKIE,
          cookieName: cookie,
        })
      );
    }
  }
  windowDeleteCookies(cookieList);
  closeDock();
  // await Promise.all([windowDeleteCookies(cookieList), closeDock()]);
};

export const recordAddReuseStep = (fileName, params, onCancel) => {
  let expectedStep = params ? `use(${fileName}) ${params}` : `use(${fileName})`;

  window.__recordAction(
    window.__buildData({
      action: ASSERTIONMODES.ADDREUSESTEP,
      // "addReuse",
      expected: expectedStep,
    })
  );
  onCancel();
};

export const recordPdfCompareStep = ({
  basePdfFileNm,
  referencePdfFileNm,
  pageRng,
  isSoftAssert,
  type,
  onCancel,
}) => {
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
  onCancel();
};

export const recordTextInPdfStep = ({
  basePdfFileName,
  expected,
  isSoftAssert,
  onCancel,
  mode,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = "exact";
  const polarity = "positive";
  const assertName = assertionMapping[category][polarity];
  window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: assertName,
      basePdfFileName: basePdfFileName.endsWith(".pdf")
        ? basePdfFileName
        : `${basePdfFileName}.pdf`,
      expected,
      isSoftAssert,
    })
  );
  onCancel();
};

export const onConfirmTextValAssignment = async ({
  varName,
  locatorName,
  onCancel,
  el,
  e,
  textValue,
  mode,
  isNegative,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = "exact";
  const polarity = isNegative ? "negative" : "positive";
  const assertName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      assertion: assertName,
      // getModeSelected(mode),
      varName,
      el,
      e,
      text: textValue,
    })
  );
  await onCancel();
};

export const onConfirmGetAttrValAssignment = async ({
  varName,
  locatorName,
  onCancel,
  el,
  e,
  textValue,
  mode,
  selectedAssertions,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = "exact";
  const polarity = "positive";
  const assertName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      assertion: assertName,
      // getModeSelected(mode),
      varName,
      el,
      e,
      text: textValue,
      expected: selectedAssertions.attributeName,
    })
  );
  await onCancel();
};

export const onConfirmAttrEqlValAssignment = async ({
  varName,
  locatorName,
  onCancel,
  el,
  e,
  textValue,
  mode,
  selectedAssertions,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = selectedAssertions.isSubstringMatch ? "contains" : "exact";
  const polarity = selectedAssertions.isNegative ? "negative" : "positive";
  const assertName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      assertion: assertName,
      // getModeSelected(mode),
      varName,
      el,
      e,
      text: textValue,
      expected: selectedAssertions.attributeName,
      expectedAttribute: selectedAssertions.value,
    })
  );
  await onCancel();
};

export const onConfirmRadioCheckboxAssignment = async ({
  varName,
  locatorName,
  onCancel,
  el,
  e,
  textValue,
  mode,
  isNegative,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = "exact";
  const polarity = isNegative ? "negative" : "positive";
  const assertName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      assertion: assertName,
      varName,
      el,
      e,
      text: textValue,
    })
  );
  await onCancel();
};

export const onConfirmGetDropdownOptionSelected = async ({
  varName,
  locatorName,
  onCancel,
  el,
  e,
  textValue,
  mode,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = "exact";
  const polarity = "positive";
  const assertName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      assertion: assertName,
      varName,
      el,
      e,
      text: textValue,
    })
  );
  await onCancel();
};

export const onConfirmGetDropdownCountWithText = async ({
  varName,
  locatorName,
  onCancel,
  el,
  e,
  textValue,
  mode,
  substr,
  expected,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = !substr ? "exact" : "contains";
  const polarity = "positive";
  const assertName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      assertion: assertName,
      varName,
      el,
      e,
      text: textValue,
      expected,
    })
  );
  await onCancel();
};

export const onConfirmDbAction = async ({
  dbAction,
  dbType,
  varName,
  hostName,
  userName,
  password,
  portNum,
  onCancel,
  query,
}) => {
  const dbConfigData = {
    action: "assert",
    assertion: ASSERTIONMODES.SINGLEVARASSIGNDBCONFIG,
    varName: `${varName}DbConfig`,
    dbType,
    dbHostName: hostName,
    dbUserName: userName,
    dbPassword: password,
    dbPortNum: portNum,
  };

  const dbQueryData = {
    action: "assert",
    assertion: ASSERTIONMODES.SINGLEVARASSIGNDBQUERY,
    varName: `${varName}DbQuery`,
    dbQuery: query,
  };

  let jsonData = [];
  try {
    const liveData = await fetch("http://localhost:3111/record", {
      headers: { "Content-Type": "application/json" },
    });
    jsonData = await liveData.json();
  } catch (err) {
    console.warn("Unable to fetch live recorded data:", err);
  }

  // Check if DB config already exists
  const existingConfig =
    Array.isArray(jsonData) &&
    jsonData.find(
      (v) =>
        v.dbType === dbConfigData.dbType &&
        v.dbHostName === dbConfigData.dbHostName &&
        v.dbUserName === dbConfigData.dbUserName &&
        v.dbPassword === dbConfigData.dbPassword &&
        v.dbPortNum === dbConfigData.dbPortNum
    );

  if (!existingConfig) {
    window.__recordAction(dbConfigData);
  }

  const configVarName = existingConfig?.varName || dbConfigData.varName;

  // Check if DB query step already exists
  const existingQuery =
    Array.isArray(jsonData) &&
    jsonData.find(
      (v) =>
        v.dbQuery &&
        v.dbQuery.trim() === query.trim() &&
        v.assertion === ASSERTIONMODES.SINGLEVARASSIGNDBQUERY
    );

  if (!existingQuery) {
    window.__recordAction(dbQueryData);
  }

  const queryVarName = existingQuery?.varName || dbQueryData.varName;

  // Final combined DB action
  window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: dbAction,
      varName,
      expected: [configVarName, queryVarName],
    })
  );

  await onCancel();
};

export const onConfirmElemMatch = ({
  expected,
  softAssert,
  locatorName,
  onCancel,
  el,
  e,
  textValue,
  mode,
  isNegative,
  exactMatch,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = exactMatch ? "exact" : "contains";
  const polarity = isNegative ? "negative" : "positive";
  const assertName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      assertion: assertName,
      el,
      e,
      text: textValue,
      expected,
      isSoftAssert: softAssert,
    })
  );
  onCancel();
};

export const floatingAssertDockNonTextConfirm = ({
  isSoftAssert,
  isNegative,
  locatorName,
  closeDock,
  mode,
  textValue,
  el,
  e,
}) => {
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
  closeDock();
};

export const recordAttributesAssert = async ({
  selectedAssertions,
  isSoftAssert,
  locatorName,
  el,
  e,
  closeDock,
  textValue,
  mode,
}) => {
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
        textValue,
      })
    );
  }

  await closeDock();
};

export const floatingAssertDockAssertTxtOnConfirm = ({
  expected,
  isSoftAssert,
  locatorName,
  exact,
  isNegative,
  el,
  e,
  textValue,
  mode,
  closeDock,
}) => {
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
  closeDock();
};

export const floatingAssertCurrentUrlConfirm = ({
  expected,
  isSoftAssert,
  isNegative,
  exactMatch,
  mode,
  closeDock,
}) => {
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
  closeDock();
};

export const recordCheckboxRadioAssert = ({
  checkBoxState,
  isSoftAssert,
  el,
  locatorName,
  mode,
  closeDock,
  e,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = checkBoxState.isChecked ? "checked" : "unchecked";
  const polarity = "positive";
  const assertionName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      isSoftAssert,
      assertion: assertionName,
      expected: checkBoxState.isChecked,
      el,
      e,
    })
  );

  closeDock();
};

export const getCookies = async () => {
  const cookies = await window.__getCookies();
  return cookies;
};

export const recordCookiesAssert = ({
  selectedAssertions,
  isSoftAssert,
  mode,
  closeDock,
}) => {
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
        cookieName: cookieObj.cookieName,
        expected: cookieObj.value,
      })
    );
  }

  closeDock();
};

export const recordDropdownAssert = ({
  expected,
  isSoftAssert,
  isNegative,
  locatorName,
  mode,
  closeDock,
  el,
  e,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = "exact";
  const polarity = isNegative ? "negative" : "positive";
  const assertionName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      isSoftAssert,
      assertion: assertionName,
      expected,
      el,
      e,
    })
  );

  closeDock();
};

export const recordDropdownOrderAssert = ({
  checkBoxState,
  isSoftAssert,
  locatorName,
  closeDock,
  el,
  e,
}) => {
  window.__recordAction(
    window.__buildData({
      action: "assert",
      locatorName,
      isSoftAssert,
      assertion: ASSERTIONMODES.DROPDOWNINALPHABETICORDER,
      expected: checkBoxState.isChecked ? "asc" : "desc",
      el,
      e,
    })
  );

  closeDock();
};

export const recordHttpRequest = async ({
  host,
  path,
  method,
  headers,
  body,
  closeDock,
  status,
  responseAsserts,
}) => {
  await window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: ASSERTIONMODES.HTTPHOST,
      httpUrl: host.trim(),
    })
  );

  if (path.trim()) {
    await window.__recordAction(
      window.__buildData({
        action: "assert",
        assertion: ASSERTIONMODES.HTTPPATH,
        httpPath: path.trim(),
      })
    );
  }

  if (headers && Array.isArray(headers) && headers.length) {
    const headersObject = headers.reduce((acc, { key, value }) => {
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    await window.__recordAction(
      window.__buildData({
        action: "assert",
        assertion: ASSERTIONMODES.HTTPHEADERS,
        httpHeaders: JSON.stringify(headersObject),
      })
    );
  }

  if (body.trim()) {
    await window.__recordAction(
      window.__buildData({
        action: "assert",
        assertion: ASSERTIONMODES.HTTPPAYLOAD,
        httpPayload: body.trim(),
      })
    );
  }

  await window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: ASSERTIONMODES.HTTPMETHOD,
      httpMethod: method.toUpperCase().trim(),
    })
  );

  await window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: ASSERTIONMODES.HTTPSTATUS,
      httpStatus: Number(status),
    })
  );

  if (
    responseAsserts &&
    Array.isArray(responseAsserts) &&
    responseAsserts.length
  ) {
    const assertionMapping =
      ASSERTION_NAME_LOOKUP[ASSERTIONMODES.MATCHVARIABLESEQUALS];

    for (let i = 0; i < responseAsserts.length; i++) {
      const assertObj = responseAsserts[i];
      const category = assertObj.isSubstringMatch ? "contains" : "exact";
      const polarity = assertObj.isNegative ? "negative" : "positive";
      const assertMode = assertionMapping[category][polarity];
      const isSoftAssert = assertObj.isSoftAssert;

      if (assertObj.name === "status") {
        assertObj.name = "response.status";
      }
      await window.__recordAction(
        window.__buildData({
          action: "assert",
          isSoftAssert,
          assertion: assertMode,
          varName: assertObj.name,
          expected: assertObj.value,
        })
      );
    }
  }

  closeDock();
};

export const onConfirmGenericVarAssignment = ({
  varName,
  value,
  onCancel,
  isVarReasssign,
}) => {
  window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: ASSERTIONMODES.GENERICVARASSIGN,
      varName,
      expected: value,
      isReassignVar: isVarReasssign,
    })
  );
  onCancel();
};

export const onConfirmGenericVarMatch = ({
  varName,
  expected,
  mode,
  softAssert,
  isNegative,
  exactMatch,
  onCancel,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = !exactMatch ? "contains" : "exact";
  const polarity = isNegative ? "negative" : "positive";
  const assertionName = assertionMapping[category][polarity];
  window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: assertionName,
      varName,
      expected,
      isSoftAssert: softAssert,
    })
  );
  onCancel();
};

export const onConfirmGetEmailFromServer = async ({
  varName,
  serverId,
  subject,
  filter,
  sentFrom,
  sentTo,
  receivedBefore,
  onCancel,
}) => {
  const emailConfigData = {
    action: "assert",
    assertion: ASSERTIONMODES.SINGLEVARASSIGNEMAILCONFIG,
    varName: `${varName}EmailConfig`,
    emailServerId: serverId,
    emailSubject: subject,
    ...(sentFrom ? { emailSentFrom: sentFrom } : {}),
    ...(sentTo ? { emailSentTo: sentTo } : {}),
    ...(filter ? { emailFilter: filter } : {}),
    ...(receivedBefore ? { emailReceivedBefore: receivedBefore } : {}),
  };

  let jsonData = [];
  try {
    const liveData = await fetch("http://localhost:3111/record", {
      headers: { "Content-Type": "application/json" },
    });
    jsonData = await liveData.json();
  } catch (err) {
    console.warn("Unable to fetch live recorded data:", err);
  }

  // Check if DB config already exists
  const existingConfig =
    Array.isArray(jsonData) &&
    jsonData.find(
      (v) =>
        v.emailServerId === emailConfigData.dbType &&
        v.emailSubject === emailConfigData.dbHostName &&
        v.emailSentFrom &&
        emailConfigData.emailSentFrom &&
        v.emailSentFrom === emailConfigData.emailSentFrom &&
        v.emailSentTo &&
        emailConfigData.emailSentTo &&
        v.emailSentTo === emailConfigData.emailSentTo &&
        v.emailFilter &&
        emailConfigData.emailFilter &&
        v.emailFilter === emailConfigData.emailFilter &&
        v.emailReceivedBefore !== undefined &&
        emailConfigData.emailReceivedBefore !== undefined &&
        v.emailReceivedBefore === emailConfigData.emailReceivedBefore
    );

  if (!existingConfig) {
    await window.__recordAction(emailConfigData);
  }

  const configVarName = existingConfig?.varName || emailConfigData.varName;

  // Final combined DB action
  await Promise.all([
    window.__recordAction(
      window.__buildData({
        action: "assert",
        assertion: ASSERTIONMODES.GETEMAIL,
        varName,
        expected: configVarName,
      })
    ),
    onCancel(),
  ]);
};

export const onConfirmDeleteEmailFromServer = async ({
  // serverId: emailConfig.serverId.trim(),
  // subject: emailConfig.subject.trim(),
  // sentFrom: emailConfig.sentFrom.trim() || null,
  // sentTo: emailConfig.sentTo.trim() || null,
  // receivedBefore: emailConfig.receivedBefore.trim() || null,
  // deleteAllEmails,
  // onCancel: handleCancel,
  varName,
  serverId,
  subject,
  sentFrom,
  sentTo,
  receivedBefore,
  onCancel,
  deleteAllEmails,
}) => {
  const emailConfigData = {
    action: "assert",
    assertion: ASSERTIONMODES.SINGLEVARASSIGNEMAILCONFIG,
    varName: `${varName}EmailConfig`,
    emailServerId: serverId,
    emailSubject: subject,
    ...(sentFrom ? { emailSentFrom: sentFrom } : {}),
    ...(sentTo ? { emailSentTo: sentTo } : {}),
    ...(receivedBefore ? { emailReceivedBefore: receivedBefore } : {}),
  };

  let jsonData = [];
  try {
    const liveData = await fetch("http://localhost:3111/record", {
      headers: { "Content-Type": "application/json" },
    });
    jsonData = await liveData.json();
  } catch (err) {
    console.warn("Unable to fetch live recorded data:", err);
  }

  // Check if DB config already exists
  const existingConfig =
    Array.isArray(jsonData) &&
    jsonData.find(
      (v) =>
        v.emailServerId === emailConfigData.dbType &&
        v.emailSubject === emailConfigData.dbHostName &&
        v.emailSentFrom &&
        emailConfigData.emailSentFrom &&
        v.emailSentFrom === emailConfigData.emailSentFrom &&
        v.emailSentTo &&
        emailConfigData.emailSentTo &&
        v.emailSentTo === emailConfigData.emailSentTo &&
        v.emailReceivedBefore !== undefined &&
        emailConfigData.emailReceivedBefore !== undefined &&
        v.emailReceivedBefore === emailConfigData.emailReceivedBefore
    );

  if (!existingConfig) {
    window.__recordAction(emailConfigData);
  }

  const configVarName = existingConfig?.varName || emailConfigData.varName;

  // Final combined DB action
  window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: deleteAllEmails
        ? ASSERTIONMODES.DELETEEMAIL
        : ASSERTIONMODES.DELETEALLEMAIL,
      varName,
      expected: configVarName,
    })
  );

  await onCancel();
};

export const onConfirmPageTitleAssignment = ({ varName, onCancel }) => {
  window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: ASSERTIONMODES.GETTITLE,
      // getModeSelected(mode),
      varName,
    })
  );
  onCancel();
};

export const onConfirmPageTitleMatch = ({
  softAssert,
  onCancel,
  mode,
  isNegative,
  exactMatch,
  expected,
}) => {
  const assertionMapping = ASSERTION_NAME_LOOKUP[mode];
  const category = !exactMatch ? "contains" : "exact";
  const polarity = isNegative ? "negative" : "positive";
  const assertionName = assertionMapping[category][polarity];

  window.__recordAction(
    window.__buildData({
      action: "assert",
      assertion: assertionName,
      isSoftAssert: softAssert,
      expected,
    })
  );
  onCancel();
};
