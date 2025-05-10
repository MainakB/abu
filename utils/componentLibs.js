import { ASSERTIONMODES, ASSERTIONNAMES } from "../ui-src/constants/index.js";

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
    varName: `${varName}_config`,
    dbType,
    dbHostName: hostName,
    dbUserName: userName,
    dbPassword: password,
    dbPortNum: portNum,
  };

  const dbQueryData = {
    action: "assert",
    assertion: ASSERTIONMODES.SINGLEVARASSIGNDBQUERY,
    varName: `${varName}_query`,
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
