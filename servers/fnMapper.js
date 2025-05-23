import converter from "number-to-words";
import { FUNCTIONMAPPER } from "../ui-src/constants/index.js";

const getLocObject = (keyName, value) => {
  if (Array.isArray(value)) {
    const result = [];
    for (const loc of value) {
      result.push({
        locatorType: keyName,
        locatorValue: loc.replace(/"/g, "'"),
      });
    }
    return result;
  }
  return {
    locatorType: keyName,
    locatorValue: value.replace(/"/g, "'"),
  };
};

const wrapEnum = (str) => `__ENUM__${str}`;

const getCamelCasedLocName = (input) => {
  const cleaned = input.toLowerCase().replace(/[^a-zA-Z]+/g, " ");

  // Convert to camelCase
  const camelCase = cleaned
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");

  return camelCase;
};

const getExportTypes = (key) => {
  if (key === "id") {
    return wrapEnum("Types.LocatorTypes.ID");
  }

  if (key === "name") {
    return wrapEnum("Types.LocatorTypes.NAME");
  }

  if (key === "xpath") {
    return wrapEnum("Types.LocatorTypes.XPATH");
  }

  if (key === "className") {
    return wrapEnum("Types.LocatorTypes.CLASSNAME");
  }

  if (key === "css") {
    return wrapEnum("Types.LocatorTypes.CSS");
  }

  if (key === "cssSr") {
    return wrapEnum("Types.LocatorTypes.CSSSR");
  }

  if (key === "deepCss") {
    return wrapEnum("Types.LocatorTypes.DEEPCSS");
  }

  if (key === "cssContaingText") {
    return wrapEnum("Types.LocatorTypes.CSSCONTAININGTEXT");
  }

  if (key === "linkedText") {
    return wrapEnum("Types.LocatorTypes.LINKTEXT");
  }

  if (key === "partialLinkedText") {
    return wrapEnum("Types.LocatorTypes.PARTIALLINKTEXT");
  }

  if (key === "buttonText") {
    return wrapEnum("Types.LocatorTypes.BUTTONTEXT");
  }

  if (key === "partialButtonText") {
    return wrapEnum("Types.LocatorTypes.PARTIALBUTTONTEXT");
  }

  if (key === "tagName") {
    return wrapEnum("Types.LocatorTypes.TAGNAME");
  }

  if (key === "shadowRoot") {
    return wrapEnum("Types.LocatorTypes.SHADOWROOT");
  }
};

function isPossiblyHidden(attributes = {}) {
  const attrEntries = Object.entries(attributes);
  if (attrEntries.length === 0) return false;

  const attr = Object.entries(attributes).reduce((acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  }, {});

  const classString = attr["class"] || "";
  const styleString = attr["style"] || "";

  return (
    "hidden" in attr ||
    attr["aria-hidden"] === "true" ||
    attr["type"] === "hidden" ||
    attr["role"] === "presentation" ||
    attr["role"] === "none" ||
    attr["inert"] !== undefined ||
    attr["aria-disabled"] === "true" ||
    attr["disabled"] !== undefined ||
    classString.includes("hidden") ||
    classString.includes("sr-only") ||
    classString.includes("invisible") ||
    styleString.includes("display: none") ||
    styleString.includes("visibility: hidden") ||
    styleString.includes("opacity: 0")
  );
}

const constructLocators = (arg, locatorIndex) => {
  const argSelectors = arg.selectors;
  const attr = arg.attributes;
  const tagname = arg.tagName;

  const keys = Object.keys(argSelectors);
  const locator = [];

  for (let key of keys) {
    if (
      (key === "id" ||
        key === "name" ||
        key === "xpath" ||
        key === "css" ||
        key === "className") &&
      argSelectors[key] &&
      argSelectors[key] !== null &&
      argSelectors[key] !== ""
    ) {
      const locs = getLocObject(getExportTypes(key), argSelectors[key]);
      if (Array.isArray(locs)) {
        for (const loc of locs) {
          locator.push(loc);
        }
      } else {
        locator.push(locs);
      }
    } else if (
      key === "href" &&
      argSelectors[key] &&
      argSelectors[key] !== null &&
      argSelectors[key] !== ""
    ) {
      locator.push(
        getLocObject(getExportTypes("linkedText"), argSelectors[key])
      );
    } else if (
      argSelectors[key] &&
      argSelectors[key] !== "" &&
      key !== "iframes" &&
      key !== "iframeDepth"
    ) {
      locator.push(
        getLocObject(
          getExportTypes("xpath"),
          `//${tagname}[@${key}="${argSelectors[key]}"]`
        )
      );
    }
  }
  let locKeyName = `locator_${locatorIndex}`;
  let locNameUpdated = false;
  if (arg.locatorName) {
    locKeyName = arg.locatorName;
    locNameUpdated = true;
  } else if (
    arg.text &&
    typeof arg.text === "string" &&
    arg.text.trim() !== ""
  ) {
    const locNameCamelCased = getCamelCasedLocName(arg.text);
    if (
      locNameCamelCased &&
      typeof locNameCamelCased === "string" &&
      locNameCamelCased.length < 34
    ) {
      locKeyName = `loc_${locNameCamelCased}`;
      locNameUpdated = true;
    }
  }
  let descText =
    arg.text && typeof arg.text === "string" && arg.text.trim() !== ""
      ? ` for ${arg.text}`
      : "";

  const result = {
    [locKeyName]: {
      poParentObject: "__fileName",
      description: `${arg.tagName} tag${descText}`,
      locator,
    },
  };
  let newIdx = locatorIndex + (locNameUpdated ? 0 : 1);
  return { result, newIdx, locKeyName };
};

const getOrdinalIndex = (arg) => {
  if (
    arg.elementIndex !== undefined &&
    /^\d+$/.test(arg.elementIndex) &&
    arg.elementIndex >= 0
  ) {
    let temp = arg.elementIndex + 1;
    let elIndex = converter.toOrdinal(temp);
    let ordinalPrefix = `${elIndex} `;
    return ordinalPrefix;
  }
  return "";
};

const clickOnTypes = (tagNameValue) => {
  if (!tagNameValue) return "";
  const tagName = tagNameValue.toLowerCase();

  if (tagName === "button" || tagName === "input") return ` ${tagName}`;
  if (tagName === "a") return " link";
  return "";
};

function stringifyWithoutQuotes(objArray) {
  return `[${objArray
    .map((obj) => {
      const props = Object.entries(obj).map(([key, value]) => {
        // Add quotes only around string **values**, not keys
        const safeValue =
          typeof value === "string" && !value.startsWith('"')
            ? `"${value}"`
            : value;
        return `${key}:${safeValue}`;
      });
      return `{${props.join(", ")}}`;
    })
    .join(", ")}]`;
}

export const ACTION_HANDLERS = {
  [FUNCTIONMAPPER.CLOSETAB.key]: (arg, idx) => [
    {
      step: `And ${FUNCTIONMAPPER.CLOSETAB.name}()`,
      aiStep: `And close current tab`,
    },
    idx,
  ],
  [FUNCTIONMAPPER.NEWTAB.key]: (arg, idx) => [
    {
      step: `And ${FUNCTIONMAPPER.NEWTAB.name}()`,
      aiStep: `And open a new tab`,
    },
    idx,
  ],

  [FUNCTIONMAPPER.NAVIGATE.key]: (arg, idx) => [
    {
      step: `Given ${FUNCTIONMAPPER.NAVIGATE.name} "${arg.url}"`,
      aiStep: `Given navigate to "${arg.url}"`,
    },
    idx,
  ],

  [FUNCTIONMAPPER.SWITCHTOWINDOW.key]: (arg, idx) => [
    {
      step: `And ${FUNCTIONMAPPER.SWITCHTOWINDOW.name}("${
        arg.attributes.url || arg.attributes.title
      }")`,
      aiStep: `And switch to window with ${
        arg.attributes.url ? "url" : "title"
      } "${arg.attributes.url || arg.attributes.title}"`,
    },
    idx,
  ],

  [FUNCTIONMAPPER.SWITCHFRAME.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex =
      arg.iframeDepth !== undefined && /^\d+$/.test(arg.iframeDepth)
        ? converter.toOrdinal(arg.iframeDepth)
        : -1;

    let nameValue = null;
    let type = null;
    if (
      arg.selectors.iframes &&
      Array.isArray(arg.selectors.iframes) &&
      arg.selectors.iframes.length
    ) {
      if (arg.selectors.iframes[0].title) {
        nameValue = arg.selectors.iframes[0].title;
        type = "title";
      } else if (arg.selectors.iframes[0].name) {
        nameValue = arg.selectors.iframes[0].name;
        type = "name";
      } else if (arg.selectors.iframes[0].src) {
        nameValue = arg.selectors.iframes[0].src;
        type = "src";
      } else if (arg.selectors.iframes[0].id) {
        nameValue = arg.selectors.iframes[0].id;
        type = "id";
      } else if (arg.selectors.iframes[0].className) {
        nameValue = arg.selectors.iframes[0].className;
        type = "className";
      }
    }

    return [
      {
        step: `And ${FUNCTIONMAPPER.SWITCHFRAME.name}("${loc.locKeyName}")`,
        aiStep:
          elIndex !== -1 && type && nameValue
            ? `And switch to iframe at depth ${elIndex} and ${type} ${nameValue}`
            : type && nameValue
            ? `And switch to iframe with ${type} equals to ${nameValue}`
            : `And ${FUNCTIONMAPPER.SWITCHFRAME.name}("${loc.locKeyName}")`,
        locator: loc.result,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.SWITCHTODEFAULTFRAME.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.SWITCHTODEFAULTFRAME.name}()`,
        aiStep: `And switch to default frame`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.CLICK.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    let isJsClick = isPossiblyHidden(arg.attributes);
    const fnName = FUNCTIONMAPPER[isJsClick ? "JSCLICK" : "CLICK"].name;
    return [
      {
        step: `And ${fnName}({po:"${loc.locKeyName}"})`,
        aiStep: arg.text
          ? `And ${fnName} on "${arg.text}"${clickOnTypes(arg.tagName)}`
          : arg.tagName && elIndex !== ""
          ? `And ${fnName} ${elIndex}${arg.tagName} tag`
          : `And ${fnName}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.HOVER.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.HOVER.name}({po:"${loc.locKeyName}"})`,
        aiStep: arg.text
          ? `And mouse hover on "${arg.text}"`
          : elIndex !== ""
          ? `And mouse hover on ${elIndex}element of type ${arg.tagName.toLowerCase()} and value "${
              arg.text
            }"`
          : `And ${FUNCTIONMAPPER.HOVER.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.INPUT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const doEnterAfterInput =
      arg.keyPressed && arg.keyPressed === "Enter" ? ", eai: true" : "";

    const inputLabel =
      arg.attributes?.placeholder ||
      arg.attributes?.associatedLabel ||
      arg.attributes?.title ||
      arg.attributes?.["aria-describedby"] ||
      arg.attributes?.["aria-label"] ||
      arg.attributes?.name ||
      null;
    const inputLabelToUse = inputLabel ? `"${inputLabel}" ` : "";

    const ordinalPrefix = getOrdinalIndex(arg);

    return [
      {
        step: `And ${FUNCTIONMAPPER.INPUT.name}({po:"${loc.locKeyName}", txt:"${arg.value}"${doEnterAfterInput}})`,
        aiStep:
          arg.value && arg.keyPressed && arg.keyPressed === "Enter"
            ? `And type "${arg.value}" to the ${ordinalPrefix}${inputLabelToUse}input field and hit enter`
            : arg.value
            ? `And type "${arg.value}" to the ${ordinalPrefix}${inputLabelToUse}input field`
            : null,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.FILEUPLOAD.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const trailingString =
      elIndex === "" && arg.text
        ? ""
        : ` to ${elIndex}${arg.text || arg.tagName.toLowerCase()}`;
    return [
      {
        step: `And ${FUNCTIONMAPPER.FILEUPLOAD.name}({po:"${loc.locKeyName}", fpt:"${arg.fileNames[0]}"})`,
        aiStep: `And upload file "${arg.fileNames[0]}"${trailingString}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.SELECT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.SELECT.name}({po:"${loc.locKeyName}", txt:"${arg.value}"})`,
        aiStep: `And select option "${
          arg.value
        }" from ${elIndex}${arg.tagName.toLowerCase()} type dropdown`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTTEXTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTEQUALS.name}({po:"${loc.locKeyName}", et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `text value of ${elIndex}${arg.tagName} equals "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTTEXTNOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTNOTEQUALS.name}({po:"${loc.locKeyName}", et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `text value of ${elIndex}${arg.tagName} not equals "${arg.expected}"`,
        locator: loc.result,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTTEXTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTCONTAINS.name}({po:"${loc.locKeyName}", et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `text value of ${elIndex}${arg.tagName} contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTTEXTNOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTNOTCONTAINS.name}({po:"${loc.locKeyName}", et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `text value of ${elIndex}${arg.tagName} not contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTVALUEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTVALUEEQUALS.name}({po:"${loc.locKeyName}", atr:"value", ea:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `attribute "value" of ${elIndex}${arg.tagName} equals "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTVALUENOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTVALUENOTEQUALS.name}({po:"${loc.locKeyName}", atr:"value", ea:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `attribute "value" of ${elIndex}${arg.tagName} not equals "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTVALUECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTVALUECONTAINS.name}({po:"${loc.locKeyName}", atr:"value", ea:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `attribute "value" of ${elIndex}${arg.tagName} contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTVALUENOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTVALUENOTCONTAINS.name}({po:"${loc.locKeyName}", atr:"value", ea:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `attribute "value" of ${elIndex}${arg.tagName} not contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCEEQUALS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCEEQUALS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `page source has text "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCENOTEQUALS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCENOTEQUALS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `page source does not have text "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCECONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCECONTAINS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `page source contains partial text "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCENOTCONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTINPAGESOURCENOTCONTAINS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `page source does not contain partial text "${arg.expected}"`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTVISIBILITY.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTVISIBILITY.name}({po:"${loc.locKeyName}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" + " is visible",
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTINVISIBILITY.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTINVISIBILITY.name}({po:"${loc.locKeyName}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" + " is not visible",
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTENABLED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTENABLED.name}({po:"${loc.locKeyName}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" + " is enabled",
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTDISABLED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTDISABLED.name}({po:"${loc.locKeyName}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" + " is disabled",
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTATTRIBUTEVALUEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTATTRIBUTEVALUEEQUALS.name}({po:"${loc.locKeyName}", atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" +
              ` has attribute "${arg.attributeAssertPropName}" with value "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTATTRIBUTEVALUENOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTATTRIBUTEVALUENOTEQUALS.name}({po:"${loc.locKeyName}, atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" +
              ` does not have attribute "${arg.attributeAssertPropName}" with value "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTATTRIBUTEVALUECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTATTRIBUTEVALUECONTAINS.name}({po:"${loc.locKeyName}, atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" +
              ` has attribute "${arg.attributeAssertPropName}" containing value "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTATTRIBUTEVALUENOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTATTRIBUTEVALUENOTCONTAINS.name}({po:"${loc.locKeyName}, atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
            (arg.isSoftAssert ? "soft assert " : "assert ") +
            `${elIndex}element of type ${arg.tagName}` +
            arg.text && arg.text !== ""
            ? ` and text ${arg.text}`
            : "" +
              ` does not have attribute "${arg.attributeAssertPropName}" containing value "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNSELECTED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNSELECTED.name}({po:"${loc.locKeyName}", et: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown has option "${
            arg.value
          }" selected`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.DROPDOWNNOTSELECTED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNNOTSELECTED.name}({po:"${loc.locKeyName}", et: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown does not have option "${
            arg.value
          }" selected`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNCOUNTIS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNCOUNTIS.name}({po:"${loc.locKeyName}", ect: ${arg.expected}${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown has options count of "${
            arg.expected
          }"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.DROPDOWNCOUNTISNOT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNCOUNTISNOT.name}({po:"${loc.locKeyName}", ect: ${arg.expected}${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown does not have options count of "${
            arg.expected
          }"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.DROPDOWNVALUESARE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNVALUESARE.name}({po:"${loc.locKeyName}", et: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown has options values "${
            arg.expected
          }"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.DROPDOWNDUPLICATECOUNT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNDUPLICATECOUNT.name}({po:"${loc.locKeyName}", ect: ${arg.expected}${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown has duplicate options count of "${
            arg.expected
          }"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNINALPHABETICORDER.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNINALPHABETICORDER.name}({po:"${loc.locKeyName}", sortOrder: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown options are sorted in "${
            arg.expected === "asc"
              ? "ascending"
              : arg.expected === "desc"
              ? "descending"
              : arg.expected
          }" order`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNCONTAINS.name}({po:"${loc.locKeyName}", txt: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown contains option "${
            arg.expected
          }"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNNOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNNOTCONTAINS.name}({po:"${loc.locKeyName}", txt: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown does not contain option "${
            arg.expected
          }"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.DROPDOWNOPTIONSBYPARTIALTEXT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const elIndex = getOrdinalIndex(arg);
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNOPTIONSBYPARTIALTEXT.name}({po:"${loc.locKeyName}", txt: "${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `${elIndex}${arg.tagName.toLowerCase()} dropdown contains option with partial text "${
            arg.expected
          }"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  //
  [FUNCTIONMAPPER.ASSERTCURRENTURLEQUALS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCURRENTURLEQUALS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `current url equals "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCURRENTURLNOTEQUALS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCURRENTURLNOTEQUALS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `current url not equals "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCURRENTURLCONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCURRENTURLCONTAINS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `current url contains "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCURRENTURLNOTCONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCURRENTURLNOTCONTAINS.name}({et:"${arg.expected}"${soft}})`,
        aiStep:
          "And " +
          (arg.isSoftAssert ? "soft assert " : "assert ") +
          `current url not contains "${arg.expected}"`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.CHECKBOXCHECKED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.CHECKBOXCHECKED.name}({po:"${loc.locKeyName}", checked: ${arg.expected}${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.CHECKBOXNOTCHECKED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.CHECKBOXNOTCHECKED.name}({po:"${loc.locKeyName}", checked: ${arg.expected}${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.RADIOCHECKED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.RADIOCHECKED.name}({po:"${loc.locKeyName}", checked: ${arg.expected}${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.RADIONOTCHECKED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.RADIONOTCHECKED.name}({po:"${loc.locKeyName}", checked: ${arg.expected}${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.GETATTRIBUTE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETATTRIBUTE.name}({po:"${loc.locKeyName}", atr:"${arg.expected}"})`,
        aiStep: `And get attribute "${
          arg.expected
        }" of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ISATTRIBUTEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTEEQUALS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        aiStep: `And check if attribute "${
          arg.expected
        }" of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} equals "${
          arg.expectedAttribute
        }" and assign to "${arg.varName}" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISATTRIBUTENOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTENOTEQUALS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        aiStep: `And check if attribute "${
          arg.expected
        }" of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} not equals "${
          arg.expectedAttribute
        }" and assign to "${arg.varName}" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISATTRIBUTECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTECONTAINS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        aiStep: `And check if attribute "${
          arg.expected
        }" of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} contains "${
          arg.expectedAttribute
        }" and assign to "${arg.varName}" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISATTRIBUTENOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTENOTCONTAINS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        aiStep: `And check if attribute "${
          arg.expected
        }" of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} does not contain "${
          arg.expectedAttribute
        }" and assign to "${arg.varName}" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  //
  [FUNCTIONMAPPER.ISENABLED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISENABLED.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is enabled and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISNOTENABLED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISNOTENABLED.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is not enabled and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISPRESENT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISPRESENT.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is present and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISNOTPRESENT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISNOTPRESENT.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is not present and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISELEMENTCLICKABLE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISELEMENTCLICKABLE.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is clickable and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISELEMENTNOTCLICKABLE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISELEMENTNOTCLICKABLE.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is not clickable and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISDISPLAYED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISDISPLAYED.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is displayed and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISNOTDISPLAYED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISNOTDISPLAYED.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And check if ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} is not displayed and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETTEXT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETTEXT.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And get text value of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETVALUE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETVALUE.name}({po:"${loc.locKeyName}", atr:"value"})`,
        aiStep: `And get attribute "value" of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETINNERHTML.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const elIndex = getOrdinalIndex(arg);
    const textVerbiage =
      arg.text && arg.text !== "" ? `with text "${arg.text}"` : "";
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETINNERHTML.name}({po:"${loc.locKeyName}"})`,
        aiStep: `And get inner html of ${elIndex}${arg.tagName.toLowerCase()}${textVerbiage} and assign to "${
          arg.varName
        }" for later use`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETTITLE.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETTITLE.name}()`,
        aiStep: `And get title of page and assign to "${arg.varName}" for later use`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ISCHECKBOXSELECTED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISCHECKBOXSELECTED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISCHECKBOXNOTSELECTED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISCHECKBOXNOTSELECTED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISRADIOBUTTONSELECTED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISRADIOBUTTONSELECTED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISRADIOBUTTONNOTSELECTED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISRADIOBUTTONNOTSELECTED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETDROPDOWNSELECTEDOPTION.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETDROPDOWNSELECTEDOPTION.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETDROPDOWNCOUNTWITHTEXT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETDROPDOWNCOUNTWITHTEXT.name}({po:"${loc.locKeyName}", txt: "${arg.expected}" })`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETDROPDOWNCOUNTWITHSUBTEXT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETDROPDOWNCOUNTWITHSUBTEXT.name}({po:"${loc.locKeyName}", txt: "${arg.expected}" })`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ADDREUSESTEP.key]: (arg, idx) => {
    return [
      {
        step: `And ${arg.expected}`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTTEXTINPDF.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const aiSoft = soft !== "" ? "soft " : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTINPDF.name}({basePath: "${arg.basePdfFileName}", et: "${arg.expected}"${soft} })`,
        aiStep: `And ${aiSoft}assert pdf "${arg.referencePdfFileName}" contains text "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTPDFCOMPARISON.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const aiSoft = soft !== "" ? "soft " : "";
    const pagesToCompare =
      arg.pdfComparisonPages &&
      Array.isArray(arg.pdfComparisonPages) &&
      arg.pdfComparisonPages.length
        ? `, pagesToCompare: [${arg.pdfComparisonPages}]`
        : "";

    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTPDFCOMPARISON.name}({referencePath: "${arg.referencePdfFileName}", basePath: "${arg.basePdfFileName}"${pagesToCompare}${soft} })`,
        aiStep:
          pagesToCompare === ""
            ? `And ${aiSoft}compare pdf "${arg.referencePdfFileName}" with "${arg.basePdfFileName}"`
            : `And ${aiSoft}compare pdf "${arg.referencePdfFileName}" with "${arg.basePdfFileName}" for pages ${arg.pdfComparisonPages}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTTEXTIMAGESINPDF.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const aiSoft = soft !== "" ? "soft " : "";
    const pagesToCompare =
      arg.pdfComparisonPages &&
      Array.isArray(arg.pdfComparisonPages) &&
      arg.pdfComparisonPages.length
        ? `, pagesToCompare: ${arg.pdfComparisonPages}`
        : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTTEXTIMAGESINPDF.name}({referencePath: "${arg.referencePdfFileName}", basePath: "${arg.basePdfFileName}"${pagesToCompare}${soft} })`,
        aiStep:
          pagesToCompare === ""
            ? `And ${aiSoft}compare text and images in pdf "${arg.referencePdfFileName}" with "${arg.basePdfFileName}"`
            : `And ${aiSoft}compare text and images in pdf "${arg.referencePdfFileName}" with "${arg.basePdfFileName}" for pages ${arg.pdfComparisonPages}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCPDPDF.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    const aiSoft = soft !== "" ? "soft " : "";
    const pagesToCompare =
      arg.pdfComparisonPages &&
      Array.isArray(arg.pdfComparisonPages) &&
      arg.pdfComparisonPages.length
        ? `, pagesToCompare: ${arg.pdfComparisonPages}`
        : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.GETDROPDOWNCOUNTWITHSUBTEXT.name}({referencePath: "${arg.referencePdfFileName}", fileToDownload: "${arg.basePdfFileName}" ${soft}})`,
        aiStep:
          pagesToCompare === ""
            ? `And ${aiSoft}compare cpd pdfs "${arg.referencePdfFileName}" with "${arg.basePdfFileName}"`
            : `And ${aiSoft}compare cpd pdfs "${arg.referencePdfFileName}" with "${arg.basePdfFileName}" for pages ${arg.pdfComparisonPages}`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.SINGLEVARASSIGNEMAILCONFIG.key]: (arg, idx) => {
    const emailServerId = `"serverId": "${arg.emailServerId}"`;
    const emailSubject = `, "subject": "${arg.emailSubject}"`;
    const emailSentFrom = arg.emailSentFrom
      ? `, "sentFrom": "${arg.emailSentFrom}"`
      : "";
    const emailSentTo = arg.emailSentTo
      ? `, "sentTo": "${arg.emailSentTo}"`
      : "";
    const emailFilter = arg.emailFilter
      ? `, "filter": "${arg.emailFilter}"`
      : "";
    const emailReceivedBefore = arg.emailReceivedBefore
      ? `, "receivedBefore": ${arg.emailReceivedBefore}`
      : "";

    return [
      {
        step: `* def ${arg.varName} = {${emailServerId}${emailSubject}${emailSentFrom}${emailSentTo}${emailFilter}${emailReceivedBefore}}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GETEMAIL.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETEMAIL.name}(${arg.expected})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.DELETEEMAIL.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.DELETEEMAIL.name}(${arg.expected})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.DELETEALLEMAIL.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.DELETEALLEMAIL.name}(${arg.expected})`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.SINGLEVARASSIGNDBCONFIG.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = {"dbType": "${arg.dbType}", "user": "${arg.dbUserName}", "dbPassword": "${arg.dbPassword}", "host": "${arg.dbHostName}", "port": ${arg.dbPortNum}}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.SINGLEVARASSIGNDBQUERY.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = {"query": "${arg.dbQuery}"}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GETDBVALUE.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETDBVALUE.name}(${arg.expected[0]}, ${arg.expected[1]})`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.GETDBROW.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETDBROW.name}(${arg.expected[0]}, ${arg.expected[1]})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GETDBROWS.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETDBROWS.name}(${arg.expected[0]}, ${arg.expected[1]})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.RUNDBQUERY.key]: (arg, idx) => {
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.RUNDBQUERY.name}(${arg.expected[0]}, ${arg.expected[1]})`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.MATCHATTRIBUTEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHATTRIBUTEEQUALS.name}({po:"${loc.locKeyName}", atr:"${arg.attributeAssertPropName}"}) == "${arg.expectedAttribute}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHATTRIBUTENOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHATTRIBUTENOTEQUALS.name}({po:"${loc.locKeyName}", atr:"${arg.attributeAssertPropName}"}) != "${arg.expectedAttribute}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHATTRIBUTECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHATTRIBUTECONTAINS.name}({po:"${loc.locKeyName}", atr:"${arg.attributeAssertPropName}"}) contains "${arg.expectedAttribute}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHATTRIBUTENOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHATTRIBUTENOTCONTAINS.name}({po:"${loc.locKeyName}", atr:"${arg.attributeAssertPropName}"}) not contains "${arg.expectedAttribute}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHISENABLEDEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISENABLEDEQUALS.name}({po:"${loc.locKeyName}"}) == ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHISENABLEDNOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISENABLEDNOTEQUALS.name}({po:"${loc.locKeyName}"}) != ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHISPRESENTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISPRESENTEQUALS.name}({po:"${loc.locKeyName}"}) == ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHISPRESENTNOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISPRESENTNOTEQUALS.name}({po:"${loc.locKeyName}"}) != ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHISELEMENTCLICKABLEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISELEMENTCLICKABLEEQUALS.name}({po:"${loc.locKeyName}"}) == ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHISELEMENTCLICKABLENOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISELEMENTCLICKABLENOTEQUALS.name}({po:"${loc.locKeyName}"}) != ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHISDISPLAYEDEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISDISPLAYEDEQUALS.name}({po:"${loc.locKeyName}"}) == ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHISDISPLAYEDNOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHISDISPLAYEDNOTEQUALS.name}({po:"${loc.locKeyName}"}) != ${arg.expected}`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETTEXTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTEQUALS.name}({po:"${loc.locKeyName}"}) == "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETTEXTNOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTNOTEQUALS.name}({po:"${loc.locKeyName}"}) != "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETTEXTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTCONTAINS.name}({po:"${loc.locKeyName}"}) contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETTEXTNOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTNOTCONTAINS.name}({po:"${loc.locKeyName}"}) not contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETVALUEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUEEQUALS.name}({po:"${loc.locKeyName}", atr: "value"}) == "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETVALUENOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUENOTEQUALS.name}({po:"${loc.locKeyName}", atr: "value"}) != "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETVALUECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUECONTAINS.name}({po:"${loc.locKeyName}", atr: "value"}) contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETVALUENOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUENOTCONTAINS.name}({po:"${loc.locKeyName}", atr: "value"}) not contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETINNERHTMLEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLEQUALS.name}({po:"${loc.locKeyName}"}) == "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETINNERHTMLNOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLNOTEQUALS.name}({po:"${loc.locKeyName}"}) != "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETINNERHTMLCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLCONTAINS.name}({po:"${loc.locKeyName}"}) contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETINNERHTMLNOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLNOTCONTAINS.name}({po:"${loc.locKeyName}"}) not contains "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETTEXTSTARTSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTSTARTSWITH.name}({po:"${loc.locKeyName}"}) starts with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETTEXTNOTSTARTSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTNOTSTARTSWITH.name}({po:"${loc.locKeyName}"}) not starts with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETTEXTENDSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTENDSWITH.name}({po:"${loc.locKeyName}"}) ends with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETTEXTNOTENDSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETTEXTNOTENDSWITH.name}({po:"${loc.locKeyName}"}) not ends with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETVALUESTARTSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUESTARTSWITH.name}({po:"${loc.locKeyName}", atr: "value"}) starts with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETVALUENOTSTARTSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUENOTSTARTSWITH.name}({po:"${loc.locKeyName}", atr: "value"}) not starts with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETVALUEENDSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUEENDSWITH.name}({po:"${loc.locKeyName}", atr: "value"}) ends with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETVALUENOTENDSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETVALUENOTENDSWITH.name}({po:"${loc.locKeyName}", atr: "value"}) not ends with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.MATCHGETINNERHTMLSTARTSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLSTARTSWITH.name}({po:"${loc.locKeyName}"}) starts with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETINNERHTMLNOTSTARTSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLNOTSTARTSWITH.name}({po:"${loc.locKeyName}"}) not starts with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETINNERHTMLENDSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLENDSWITH.name}({po:"${loc.locKeyName}"}) ends with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHGETINNERHTMLNOTENDSWITH.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.MATCHGETINNERHTMLNOTENDSWITH.name}({po:"${loc.locKeyName}"}) not ends with "${arg.expected}"`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.MATCHVARIABLESEQUALS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${arg.varName} == "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.MATCHVARIABLESNOTEQUALS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${arg.varName} != "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.MATCHVARIABLESCONTAINS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${arg.varName} contains "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.MATCHVARIABLESNOTCONTAINS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${arg.varName} not contains "${arg.expected}"`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.PAGERELOAD.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.PAGERELOAD.name}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.TAKESCREENSHOT.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.TAKESCREENSHOT.name}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ADDCOOKIES.key]: (arg, idx) => {
    let cokkieValue = [];
    if (arg.cookies && Array.isArray(arg.cookies) && arg.cookies.length) {
      for (let cookie of arg.cookies) {
        let cookieObj = {
          nme: `${cookie.name}`,
          vle: `${cookie.value}`,

          ...(cookie.domain && cookie.domain.trim() !== ""
            ? { dmn: `${cookie.domain}` }
            : {}),
          ...(cookie.path && cookie.path !== "/" && cookie.path.trim() !== ""
            ? { pth: `${cookie.path}` }
            : {}),
          ...(cookie.expiry && cookie.expiry.trim() !== ""
            ? { exp: cookie.expiry }
            : {}),
          ...(cookie.secure !== undefined && cookie.secure
            ? { scr: cookie.secure }
            : {}),
          ...(cookie.httpOnly !== undefined && cookie.httpOnly
            ? { htp: cookie.httpOnly }
            : {}),
        };
        cokkieValue.push(cookieObj);
      }
    } else {
      return null;
    }

    return [
      {
        step: `And ${FUNCTIONMAPPER.ADDCOOKIES.name}(${stringifyWithoutQuotes(
          cokkieValue
        )})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.DELETECOOKIES.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.DELETECOOKIES.name}()`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.DELETECOOKIE.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.DELETECOOKIE.name}("${arg.cookieName}")`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.ASSERTPRESENCE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTPRESENCE.name}({po:"${loc.locKeyName}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTABSENCE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTABSENCE.name}({po:"${loc.locKeyName}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCOOKIEVALUEEQUALS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCOOKIEVALUEEQUALS.name}({nme:"${arg.cookieName}", et:"${arg.expected}"${soft}})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCOOKIEVALUENOTEQUALS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCOOKIEVALUENOTEQUALS.name}({nme:"${arg.cookieName}", et:"${arg.expected}"${soft}})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCOOKIEVALUECONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCOOKIEVALUECONTAINS.name}({nme:"${arg.cookieName}", et:"${arg.expected}"${soft}})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCOOKIEVALUENOTCONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCOOKIEVALUENOTCONTAINS.name}({nme:"${arg.cookieName}", et:"${arg.expected}"${soft}})`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.TITLEEQUALS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLEEQUALS.name}() == "${arg.expected}"`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.TITLENOTEQUALS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLENOTEQUALS.name}() != "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.TITLECONTAINS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLECONTAINS.name}() contains "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.TITLENOTCONTAINS.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLENOTCONTAINS.name}() not contains "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.TITLESTARTSWITH.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLESTARTSWITH.name}() starts with "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.TITLENOTSTARTSWITH.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLENOTSTARTSWITH.name}() not starts with "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.TITLEENDSSWITH.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLEENDSSWITH.name}() ends with "${arg.expected}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.TITLENOTENDSSWITH.key]: (arg, idx) => {
    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    return [
      {
        step: `And ${matchType} ${FUNCTIONMAPPER.TITLENOTENDSSWITH.name}() not ends with "${arg.expected}"`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.HTTPHOST.key]: (arg, idx) => {
    return [
      {
        step: `Given ${FUNCTIONMAPPER.HTTPHOST.name} "${arg.httpUrl}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.HTTPPATH.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.HTTPPATH.name} "${arg.httpPath}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.HTTPHEADER.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.HTTPHEADER.name} ${arg.httpHeaderKey}="${arg.httpHeaderValue}"`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.HTTPHEADERS.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.HTTPHEADERS.name} ${arg.httpHeaders}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.HTTPPAYLOAD.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.HTTPPAYLOAD.name} ${arg.httpPayload}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.HTTPMETHOD.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.HTTPMETHOD.name} ${arg.httpMethod}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.HTTPSTATUS.key]: (arg, idx) => {
    return [
      {
        step: `Then ${FUNCTIONMAPPER.HTTPSTATUS.name} ${arg.httpStatus}`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GENERICVARASSIGN.key]: (arg, idx) => {
    const varNameComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const stepComputed = arg.isReassignVar
      ? `* ${arg.varName} = ${varNameComputed}`
      : `* ${FUNCTIONMAPPER.GENERICVARASSIGN.name} ${arg.varName} = ${varNameComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.GENERICVARMATCHEQUALS.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHEQUALS.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GENERICVARMATCHNOTEQUALS.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHNOTEQUALS.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GENERICVARMATCHCONTAINS.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHCONTAINS.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GENERICVARMATCHNOTCONTAINS.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHNOTCONTAINS.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GENERICVARMATCHSTARTSWITH.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHSTARTSWITH.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.GENERICVARMATCHNOTSTARTSWITH.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHNOTSTARTSWITH.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GENERICVARMATCHENDSWITH.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHENDSWITH.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GENERICVARMATCHNOTENDSWITH.key]: (arg, idx) => {
    const varValComputed =
      arg.expected &&
      (arg.expected.startsWith("data") || arg.expected.startsWith("response"))
        ? arg.expected
        : `"${arg.expected}"`;

    const matchType = arg.isSoftAssert ? "sMatch" : "match";
    const stepComputed = `And ${matchType} ${arg.varName} ${FUNCTIONMAPPER.GENERICVARMATCHNOTENDSWITH.name} ${varValComputed}`;
    return [
      {
        step: stepComputed,
      },
      idx,
    ];
  },
};
