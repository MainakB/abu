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

    const iFramesPath = getIframePath(el);
    selectors.iframes = iFramesPath;
    selectors.iframeDepth =
      iFramesPath && Array.isArray(iFramesPath) ? iFramesPath.length : -1;

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

  const getShadowRoot = (el) => {
    let rootMainNode = el.getRootNode();
    console.log("RootNode type:", rootMainNode.toString());
    console.log("RootNode instance of:", rootMainNode instanceof ShadowRoot);
    if (
      rootMainNode instanceof ShadowRoot ||
      rootMainNode.toString() === "[object HTMLDocument]"
    ) {
      let rootMain = el;
      while (
        rootMain.host &&
        (rootMain instanceof ShadowRoot ||
          rootMain.toString() === "[object HTMLDocument]")
      ) {
        rootMain = rootMain.host.getRootNode();
      }
      console.log("rootMain :", rootMainNode);
    }

    console.log("Top-level root:", rootMainNode);
  };

  function getIframePathFromTop(targetWin = window) {
    const path = [];

    function find(win, root = window.top, trail = []) {
      const frames = root.document.querySelectorAll("iframe, frame");

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];

        try {
          if (frame.contentWindow === win) {
            trail.push(frame);
            path.push(...trail);
            return true;
          }

          // Recurse into nested frames
          if (find(win, frame.contentWindow, [...trail, frame])) {
            return true;
          }
        } catch (e) {
          // Cross-origin access — ignore
        }
      }

      return false;
    }

    try {
      if (targetWin !== window.top) {
        find(targetWin);
      }
    } catch (err) {
      console.warn("Error tracing frame path:", err.message);
    }

    return path.map((f) => ({
      src: f.getAttribute("src") || null,
      name: f.getAttribute("name") || null,
      id: f.getAttribute("id") || null,
      className: f.className || null,
      title: f.getAttribute("title") || null,
    }));
  }

  function getIframePath(element) {
    try {
      let win = element.ownerDocument.defaultView;
      const frames = getIframePathFromTop(win);
      return frames;
      // frames.map((iframe) => iframe.getAttribute("src") || "[iframe]");
    } catch (err) {
      console.warn("⚠️ Failed to get iframe path:", err.message);
      return [];
    }
  }
})();
