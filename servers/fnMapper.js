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
          `//${tagname}[@${key}=${argSelectors[key]}]`
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

export const ACTION_HANDLERS = {
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
    return [
      {
        step: `And ${FUNCTIONMAPPER.SWITCHFRAME.name}("${loc.locKeyName}")`,
        locator: loc.result,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.SWITCHTODEFAULTFRAME.key]: (arg, idx) => {
    return [
      {
        step: `And ${FUNCTIONMAPPER.SWITCHTODEFAULTFRAME.name}()`,
      },
      idx,
    ];
  },

  [FUNCTIONMAPPER.CLICK.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `And ${FUNCTIONMAPPER.CLICK.name}({po:"${loc.locKeyName}"})`,
        aiStep: arg.text ? `And click on "${arg.text}"` : null,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.INPUT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `And ${FUNCTIONMAPPER.INPUT.name}({po:"${loc.locKeyName}", txt:"${arg.value}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.TEXT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.TEXT.name}({po:"${loc.locKeyName}", et:"${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.VISIBILITY.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.VISIBILITY.name}({po:"${loc.locKeyName}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.INVISIBILITY.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.INVISIBILITY.name}({po:"${loc.locKeyName}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ATTRIBUTEVALUEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ATTRIBUTEVALUEEQUALS.name}({po:"${loc.locKeyName}, atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.NOTATTRIBUTEVALUEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.NOTATTRIBUTEVALUEEQUALS.name}({po:"${loc.locKeyName}, atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.ATTRIBUTEVALUECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ATTRIBUTEVALUECONTAINS.name}({po:"${loc.locKeyName}, atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.NOTATTRIBUTEVALUECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.NOTATTRIBUTEVALUECONTAINS.name}({po:"${loc.locKeyName}, atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNSELECTED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNSELECTED.name}({po:"${loc.locKeyName}, et: "${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNCOUNTIS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNCOUNTIS.name}({po:"${loc.locKeyName}, ect: "${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNINALPHABETICORDER.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNINALPHABETICORDER.name}({po:"${loc.locKeyName}, sortOrder: "${arg.expected}"${soft}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  [FUNCTIONMAPPER.DROPDOWNCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.DROPDOWNCONTAINS.name}({po:"${loc.locKeyName}, txt: "${arg.expected}"${soft}})`,
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
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCURRENTURLNOTEQUALS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCURRENTURLNOTEQUALS.name}({et:"${arg.expected}"${soft}})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCURRENTURLCONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCURRENTURLCONTAINS.name}({et:"${arg.expected}"${soft}})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.ASSERTCURRENTURLNOTCONTAINS.key]: (arg, idx) => {
    const soft = arg.isSoftAssert ? ", isSoftAssert: true" : "";
    return [
      {
        step: `And ${FUNCTIONMAPPER.ASSERTCURRENTURLNOTCONTAINS.name}({et:"${arg.expected}"${soft}})`,
      },
      idx,
    ];
  },
  [FUNCTIONMAPPER.GETATTRIBUTE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETATTRIBUTE.name}({po:"${loc.locKeyName}", atr:"${arg.expected}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISATTRIBUTEEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTEEQUALS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISATTRIBUTENOTEQUALS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTENOTEQUALS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISATTRIBUTECONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTECONTAINS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISATTRIBUTENOTCONTAINS.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISATTRIBUTENOTCONTAINS.name}({po:"${loc.locKeyName}", atr:"${arg.expected}", ea: "${arg.expectedAttribute}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },

  //
  [FUNCTIONMAPPER.ISENABLED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISENABLED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISNOTENABLED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISNOTENABLED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISPRESENT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISPRESENT.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISNOTPRESENT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISNOTPRESENT.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISELEMENTCLICKABLE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISELEMENTCLICKABLE.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISELEMENTNOTCLICKABLE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISELEMENTNOTCLICKABLE.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISDISPLAYED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISDISPLAYED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.ISNOTDISPLAYED.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.ISNOTDISPLAYED.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETTEXT.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETTEXT.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.VALUE.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.VALUE.name}({po:"${loc.locKeyName}", atr:"value"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  },
  [FUNCTIONMAPPER.GETINNERHTML.key]: (arg, idx) => {
    const loc = constructLocators(arg, idx);
    return [
      {
        step: `* def ${arg.varName} = ${FUNCTIONMAPPER.GETINNERHTML.name}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
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
};
