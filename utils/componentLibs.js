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
