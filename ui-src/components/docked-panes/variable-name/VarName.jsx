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

export default function VarName({
  varName,
  setVarName,
  disableAutoFocus,
  varNameError,
  setVarNameError,
}) {
  const varNameInputRef = useRef(null);
  const [existingVarNames, setExistingVarNames] = useState(new Set());

  useEffect(() => {
    if (!disableAutoFocus && varNameInputRef.current) {
      varNameInputRef.current.focus();
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
          data.map((step) => step.varName).filter(Boolean)
        );
        setExistingVarNames(usedNames);
      } catch (err) {
        console.warn("Could not fetch existing variable names:", err);
      }
    };
    fetchExistingVarNames();
  }, []);

  const validateVarName = (name) => {
    if (!name.trim()) return "Variable name cannot be empty";
    if (RESERVED_VAR_NAMES.has(name))
      return "* Reserved keyword. Try another name.";
    if (existingVarNames.has(name))
      return "* Variable name already used in recording";
    return "";
  };

  const handleVarNameChange = (e) => {
    const name = e.target.value;
    setVarName(name);
    setVarNameError(validateVarName(name));
  };

  return (
    <div className="locator-name-container">
      <label>Variable Name (Required)</label>
      <input
        ref={varNameInputRef}
        type="text"
        className="cookie-input"
        value={varName}
        onChange={handleVarNameChange}
        placeholder="Enter variable name.."
      />
      {varNameError && (
        <div
          className="invalid-tag-error"
          style={{ color: "var(--recorder-error-color) !important" }}
        >
          {varNameError}
        </div>
      )}
    </div>
  );
}
