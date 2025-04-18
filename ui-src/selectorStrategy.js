(() => {
  window.__getSelectors = (el) => {
    const selectors = {};
    const attributes = {};

    if (!el || typeof el.getAttributeNames !== "function")
      return {
        selectors,
        attributes,
      };

    // Extract all attributes from the element
    el.getAttributeNames().forEach((attr) => {
      attributes[attr] = el.getAttribute(attr);
    });

    // Preferred stable selectors
    selectors.id = el.id ? `#${el.id}` : null;
    selectors.name = el.name ? `[name="${el.name}"]` : null;
    selectors.testId = el.dataset.testid
      ? `[data-testid="${el.dataset.testid}"]`
      : null;
    selectors.aria = el.getAttribute("aria-label")
      ? `[aria-label="${el.getAttribute("aria-label")}"]`
      : null;
    selectors.ariaRole = el.getAttribute("role")
      ? `[role="${el.getAttribute("role")}"]`
      : null;
    selectors.className = getUniqueClass(el);
    selectors.href =
      el.tagName.toLowerCase() === "a"
        ? `[href="${el.getAttribute("href")}"]`
        : null;
    selectors.css = getCssSelector(el);
    selectors.xpath = generateXPath(el); // Last resort

    return { selectors, attributes };
  };

  const getUniqueClass = (el) => {
    if (!el || typeof el.className !== "string") return null;
    if (!el.className) return null;
    const classes = el.className
      .split(" ")
      .filter((c) => c && !c.includes(" "));
    return classes.length === 1 ? `.${classes[0]}` : null;
  };

  const getCssSelector = (el) => {
    if (!el || !el.tagName || !el.parentNode || el === document.body) {
      return el?.tagName?.toLowerCase?.() || "*";
    }

    if (!el.parentNode || el === document.body) return el.tagName.toLowerCase();
    const siblingIndex = Array.from(el.parentNode.children).indexOf(el);
    return `${getCssSelector(
      el.parentNode
    )} > ${el.tagName.toLowerCase()}:nth-child(${siblingIndex + 1})`;
  };

  const generateXPath = (el) => {
    if (!el || el.nodeType !== 1 || !el.tagName) return "";
    if (!el || el.nodeType !== 1) return "";
    if (el.id) return `//*[@id="${el.id}"]`;
    const siblings = Array.from(el.parentNode?.children || []).filter(
      (x) => x.tagName === el.tagName
    );
    return `${generateXPath(el.parentNode)}/${el.tagName.toLowerCase()}${
      siblings.length > 1 ? `[${siblings.indexOf(el) + 1}]` : ""
    }`;
  };
})();
