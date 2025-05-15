import React, { useEffect, useRef, useState } from "react";

const RESERVED_VAR_NAMES = new Set([
  "null",
  "undefined",
  "true",
  "false",
  "await",
  "async",
  "var",
  "let",
  "const",
  "return",
  "break",
  "continue",
  "function",
  "class",
  "for",
  "if",
  "else",
  "switch",
  "case",
  "new",
  "delete",
  "this",
  "typeof",
  "instanceof",
  "while",
  "do",
  "import",
  "export",
  "response",
  "data",
  // add any domain-specific names to avoid
]);

export default function LocatorName({
  locatorName,
  setLocatorName,
  disableAutoFocus,
}) {
  const inputRef = useRef(null);
  const [existingLocNames, setExistingLocNames] = useState(new Set());
  const [locNameError, setLocNameError] = useState("");

  useEffect(() => {
    if (!disableAutoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Fetch existing var names once on mount
    const fetchExistingVarNames = async () => {
      try {
        const res = await fetch("http://localhost:3111/record", {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        const usedNames = new Set(
          data.map((step) => step.locatorName).filter(Boolean)
        );
        setExistingLocNames(usedNames);
      } catch (err) {
        console.warn("Could not fetch existing locator names:", err);
      }
    };
    fetchExistingVarNames();
  }, []);

  const validateLocName = (name) => {
    if (RESERVED_VAR_NAMES.has(name))
      return `* "${name}" is a reserved keyword. Try another name.`;
    if (existingLocNames.has(name))
      return `* Locator name "${name}" already used in recording`;
    return "";
  };

  const updateLocatorName = (e) => {
    const name = e.target.value;
    const isValidName = validateLocName(name);
    if (isValidName === "") {
      setLocatorName(name);
      setLocNameError("");
    } else {
      setLocatorName("");
      setLocNameError(isValidName);
    }
  };

  return (
    <div className="locator-name-container">
      <label>Enter Locator Name (Optional) </label>
      <input
        ref={inputRef}
        type="text"
        className="cookie-input"
        value={locatorName}
        onChange={updateLocatorName}
        placeholder="Enter locator variable name"
      />
      {locNameError && (
        <div
          className="invalid-tag-error"
          style={{ color: "var(--recorder-error-color) !important" }}
        >
          {locNameError}
        </div>
      )}
    </div>
  );
}
