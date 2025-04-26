import { FUNCTIONMAPPER } from "../ui-src/constants/index.js";

export const mapData = (arg, idx) => {
  let actionType = arg.action;
  if (arg.action === "assert") {
    actionType = arg.assertion;
  }
  let result;

  if (actionType === FUNCTIONMAPPER.NAVIGATE.key) {
    const fnNameAlias = FUNCTIONMAPPER.NAVIGATE.name;
    result = [{ step: `Given ${fnNameAlias} "${arg.url}"` }, idx];
  }

  if (actionType === FUNCTIONMAPPER.SWITCHTOWINDOW.key) {
    const fnNameAlias = FUNCTIONMAPPER.SWITCHTOWINDOW.name;
    result = [
      {
        step: `And ${fnNameAlias}("${
          arg.attributes.url || arg.attributes.title
        }")`,
      },
      idx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.CLICK.key) {
    const fnNameAlias = FUNCTIONMAPPER.CLICK.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.INPUT.key) {
    const fnNameAlias = FUNCTIONMAPPER.INPUT.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", txt:"${arg.value}"})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  const hasSoftAssert = arg.isSoftAssert ? ", isSoftAssert: true" : "";
  if (actionType === FUNCTIONMAPPER.TEXT.key) {
    const fnNameAlias = FUNCTIONMAPPER.TEXT.name;
    const loc = constructLocators(arg, idx);

    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", et:"${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.VISIBILITY.key) {
    const fnNameAlias = FUNCTIONMAPPER.VISIBILITY.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.INVISIBILITY.key) {
    const fnNameAlias = FUNCTIONMAPPER.INVISIBILITY.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.ATTRIBUTEVALUEEQUALS.key) {
    const fnNameAlias = FUNCTIONMAPPER.ATTRIBUTEVALUEEQUALS.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And assertElementEqualAttributeValue({po:"${loc.locKeyName}", atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.NOTATTRIBUTEVALUEEQUALS.key) {
    const fnNameAlias = FUNCTIONMAPPER.NOTATTRIBUTEVALUEEQUALS.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.ATTRIBUTEVALUECONTAINS.key) {
    const fnNameAlias = FUNCTIONMAPPER.ATTRIBUTEVALUECONTAINS.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.NOTATTRIBUTEVALUECONTAINS.key) {
    const fnNameAlias = FUNCTIONMAPPER.NOTATTRIBUTEVALUECONTAINS.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", atr: "${arg.attributeAssertPropName}", ea: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.DROPDOWNSELECTED.key) {
    const fnNameAlias = FUNCTIONMAPPER.DROPDOWNSELECTED.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", et: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.DROPDOWNCOUNTIS.key) {
    const fnNameAlias = FUNCTIONMAPPER.DROPDOWNCOUNTIS.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", ect: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.DROPDOWNINALPHABETICORDER.key) {
    const fnNameAlias = FUNCTIONMAPPER.DROPDOWNINALPHABETICORDER.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", sortOrder: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  if (actionType === FUNCTIONMAPPER.DROPDOWNCONTAINS.key) {
    const fnNameAlias = FUNCTIONMAPPER.DROPDOWNCONTAINS.name;
    const loc = constructLocators(arg, idx);
    result = [
      {
        step: `And ${fnNameAlias}({po:"${loc.locKeyName}", txt: "${arg.expected}"${hasSoftAssert}})`,
        locator: loc.result,
      },
      loc.newIdx,
    ];
  }

  return result || [{ step: arg }, idx];
};

const getLocObject = (keyName, value) => {
  return {
    locatorType: keyName,
    locatorValue: value.replace(/"/g, "'"),
  };
};

const wrapEnum = (str) => `__ENUM__${str}`;

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
      locator.push(getLocObject(getExportTypes(key), argSelectors[key]));
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
  const locKeyName = `locator_${locatorIndex}`;
  const result = {
    [locKeyName]: {
      poParentObject: "__fileName",
      description: "Please add a description",
      locator,
    },
  };
  let newIdx = locatorIndex + 1;
  return { result, newIdx, locKeyName };
};
