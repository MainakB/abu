(() => {
  window.__getSelectors = (el, elIndexValue) => {
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
    selectors.id = el.id ? `${el.id}` : null;
    let xpathText = generateTextBasedXpath(el, elIndexValue);
    selectors.xpath = [
      getPathTo(el),
      generateXPath(el),
      ...(xpathText ? [xpathText] : []),
    ];
    selectors.css = getCssSelector(el);
    selectors.name = el.name ? `${el.name}` : null;
    selectors["data-testid"] = el.dataset.testid
      ? `${el.dataset.testid}`
      : null;
    selectors["aria-label"] = el.getAttribute("aria-label")
      ? `${el.getAttribute("aria-label")}`
      : null;
    selectors.role = el.getAttribute("role")
      ? `${el.getAttribute("role")}`
      : null;
    selectors.className = getUniqueClass(el);
    selectors.href =
      el.tagName.toLowerCase() === "a" ? `${el.getAttribute("href")}` : null;
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
    return classes.length === 1 ? `${classes[0]}` : null;
  };

  function getElementIdx(elt) {
    let count = 1;
    for (var sib = elt.previousSibling; sib; sib = sib.previousSibling) {
      if (sib.nodeType == 1 && sib.tagName == elt.tagName) count++;
    }

    return count;
  }

  const generateXPath = (elt) => {
    let path = "";
    for (; elt && elt.nodeType == 1; elt = elt.parentNode) {
      idx = getElementIdx(elt);
      xname = elt.tagName.toLowerCase();
      if (idx > 1) xname += "[" + idx + "]";
      path = "/" + xname + path;
    }

    return path;
  };

  const generateTextBasedXpath = (el, elIndexValue) => {
    let textValue = null;
    try {
      let elText =
        window.__getTextValueOfEl(el) ||
        el.innerText?.trim() ||
        el.textContent?.trim();
      if (!elText || elText === "") return null;
      if (elText && elText !== "") {
        let className = getUniqueClass(el);
        let id = el.id;
        if (id) {
          textValue = `.//${el.tagName?.toLowerCase()}[@id='${id}' and text()='${elText}']`;
        } else if (className) {
          textValue = `.//${el.tagName?.toLowerCase()}[@class='${className}' and text()='${elText}']`;
        } else {
          textValue = `.//${el.tagName?.toLowerCase()}[text()='${elText}']`;
        }
      }
    } catch (e) {}
    return elIndexValue >= 0
      ? `(${textValue})[${elIndexValue + 1}]`
      : textValue;
  };

  const getShadowRoot = (el) => {
    let rootMainNode = el.getRootNode();
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
    }
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
      tagName: f.tagName ? f.tagName.toLowerCase() : null,
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

  function getPathTo(element) {
    if (!element || element.nodeType !== 1) return "";

    if (element.id) {
      // Shortcut for unique ID
      return `id("${element.id}")`;
    }

    if (element === document.body) {
      return "/html/body";
    }

    let ix = 1; // XPath index starts at 1
    let siblings = element.parentNode ? element.parentNode.children : [];

    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i] === element) break;
      if (siblings[i].nodeName === element.nodeName) {
        ix++;
      }
    }

    return (
      getPathTo(element.parentNode) +
      "/" +
      element.tagName.toLowerCase() +
      "[" +
      ix +
      "]"
    );
  }

  const getCssSelector = (el) => {
    const acceptedAttrNames = new Set([
      "role",
      "name",
      "aria-label",
      "rel",
      "href",
    ]);

    /** Check if attribute name and value are word-like. */
    function attr(name, value) {
      let nameIsOk = acceptedAttrNames.has(name);
      nameIsOk ||= name.startsWith("data-") && wordLike(name);
      let valueIsOk = wordLike(value) && value.length < 100;
      valueIsOk ||= value.startsWith("#") && wordLike(value.slice(1));
      return nameIsOk && valueIsOk;
    }

    /** Check if id name is word-like. */
    function idName(name) {
      return wordLike(name);
    }
    /** Check if class name is word-like. */
    function className(name) {
      return wordLike(name);
    }
    /** Check if tag name is word-like. */
    function tagName(name) {
      return true;
    }

    /** Finds unique CSS selectors for the given element. */
    function finder(input, options) {
      if (input.nodeType !== Node.ELEMENT_NODE) {
        throw new Error(
          `Can't generate CSS selector for non-element node type.`
        );
      }
      if (input.tagName.toLowerCase() === "html") {
        return "html";
      }
      const defaults = {
        root: document.body,
        idName: idName,
        className: className,
        tagName: tagName,
        attr: attr,
        timeoutMs: 1000,
        seedMinLength: 3,
        optimizedMinLength: 2,
        maxNumberOfPathChecks: Infinity,
      };
      const startTime = new Date();
      const config = { ...defaults, ...options };
      const rootDocument = findRootDocument(config.root, defaults);
      let foundPath;
      let count = 0;
      for (const candidate of search(input, config, rootDocument)) {
        const elapsedTimeMs = new Date().getTime() - startTime.getTime();
        if (
          elapsedTimeMs > config.timeoutMs ||
          count >= config.maxNumberOfPathChecks
        ) {
          const fPath = fallback(input, rootDocument);
          if (!fPath) {
            throw new Error(
              `Timeout: Can't find a unique selector after ${config.timeoutMs}ms`
            );
          }
          return selector(fPath);
        }
        count++;
        if (unique(candidate, rootDocument)) {
          foundPath = candidate;
          break;
        }
      }
      if (!foundPath) {
        throw new Error(`Selector was not found.`);
      }
      const optimized = [
        ...optimize(foundPath, input, config, rootDocument, startTime),
      ];
      optimized.sort(byPenalty);
      if (optimized.length > 0) {
        return selector(optimized[0]);
      }
      return selector(foundPath);
    }

    function* search(input, config, rootDocument) {
      const stack = [];
      let paths = [];
      let current = input;
      let i = 0;
      while (current && current !== rootDocument) {
        const level = tie(current, config);
        for (const node of level) {
          node.level = i;
        }
        stack.push(level);
        current = current.parentElement;
        i++;
        paths.push(...combinations(stack));
        if (i >= config.seedMinLength) {
          paths.sort(byPenalty);
          for (const candidate of paths) {
            yield candidate;
          }
          paths = [];
        }
      }
      paths.sort(byPenalty);
      for (const candidate of paths) {
        yield candidate;
      }
    }

    function wordLike(name) {
      if (/^[a-z\-]{3,}$/i.test(name)) {
        const words = name.split(/-|[A-Z]/);
        for (const word of words) {
          if (word.length <= 2) {
            return false;
          }
          if (/[^aeiou]{4,}/i.test(word)) {
            return false;
          }
        }
        return true;
      }
      return false;
    }

    function tie(element, config) {
      const level = [];
      const elementId = element.getAttribute("id");
      if (elementId && config.idName(elementId)) {
        level.push({
          name: "#" + CSS.escape(elementId),
          penalty: 0,
        });
      }
      for (let i = 0; i < element.classList.length; i++) {
        const name = element.classList[i];
        if (config.className(name)) {
          level.push({
            name: "." + CSS.escape(name),
            penalty: 1,
          });
        }
      }
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        if (config.attr(attr.name, attr.value)) {
          level.push({
            name: `[${CSS.escape(attr.name)}="${CSS.escape(attr.value)}"]`,
            penalty: 2,
          });
        }
      }
      const tagName = element.tagName.toLowerCase();
      if (config.tagName(tagName)) {
        level.push({
          name: tagName,
          penalty: 5,
        });
        const index = indexOf(element, tagName);
        if (index !== undefined) {
          level.push({
            name: nthOfType(tagName, index),
            penalty: 10,
          });
        }
      }
      const nth = indexOf(element);
      if (nth !== undefined) {
        level.push({
          name: nthChild(tagName, nth),
          penalty: 50,
        });
      }
      return level;
    }

    function selector(path) {
      let node = path[0];
      let query = node.name;
      for (let i = 1; i < path.length; i++) {
        const level = path[i].level || 0;
        if (node.level === level - 1) {
          query = `${path[i].name} > ${query}`;
        } else {
          query = `${path[i].name} ${query}`;
        }
        node = path[i];
      }
      return query;
    }

    function penalty(path) {
      return path.map((node) => node.penalty).reduce((acc, i) => acc + i, 0);
    }

    function byPenalty(a, b) {
      return penalty(a) - penalty(b);
    }

    function indexOf(input, tagName) {
      const parent = input.parentNode;
      if (!parent) {
        return undefined;
      }
      let child = parent.firstChild;
      if (!child) {
        return undefined;
      }
      let i = 0;
      while (child) {
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          (tagName === undefined || child.tagName.toLowerCase() === tagName)
        ) {
          i++;
        }
        if (child === input) {
          break;
        }
        child = child.nextSibling;
      }
      return i;
    }

    function fallback(input, rootDocument) {
      let i = 0;
      let current = input;
      const path = [];
      while (current && current !== rootDocument) {
        const tagName = current.tagName.toLowerCase();
        const index = indexOf(current, tagName);
        if (index === undefined) {
          return;
        }
        path.push({
          name: nthOfType(tagName, index),
          penalty: NaN,
          level: i,
        });
        current = current.parentElement;
        i++;
      }
      if (unique(path, rootDocument)) {
        return path;
      }
    }

    function nthChild(tagName, index) {
      if (tagName === "html") {
        return "html";
      }
      return `${tagName}:nth-child(${index})`;
    }

    function nthOfType(tagName, index) {
      if (tagName === "html") {
        return "html";
      }
      return `${tagName}:nth-of-type(${index})`;
    }

    function* combinations(stack, path = []) {
      if (stack.length > 0) {
        for (let node of stack[0]) {
          yield* combinations(stack.slice(1, stack.length), path.concat(node));
        }
      } else {
        yield path;
      }
    }

    function findRootDocument(rootNode, defaults) {
      if (rootNode.nodeType === Node.DOCUMENT_NODE) {
        return rootNode;
      }
      if (rootNode === defaults.root) {
        return rootNode.ownerDocument;
      }
      return rootNode;
    }

    function unique(path, rootDocument) {
      const css = selector(path);
      switch (rootDocument.querySelectorAll(css).length) {
        case 0:
          throw new Error(`Can't select any node with this selector: ${css}`);
        case 1:
          return true;
        default:
          return false;
      }
    }

    function* optimize(path, input, config, rootDocument, startTime) {
      if (path.length > 2 && path.length > config.optimizedMinLength) {
        for (let i = 1; i < path.length - 1; i++) {
          const elapsedTimeMs = new Date().getTime() - startTime.getTime();
          if (elapsedTimeMs > config.timeoutMs) {
            return;
          }
          const newPath = [...path];
          newPath.splice(i, 1);
          if (
            unique(newPath, rootDocument) &&
            rootDocument.querySelector(selector(newPath)) === input
          ) {
            yield newPath;
            yield* optimize(newPath, input, config, rootDocument, startTime);
          }
        }
      }
    }

    return finder(el);
  };
})();
