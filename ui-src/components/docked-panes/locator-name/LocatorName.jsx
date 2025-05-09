import React, { useEffect, useRef } from "react";

export default function LocatorName({
  locatorName,
  setLocatorName,
  disableAutoFocus,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disableAutoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const updateLocatorName = (e) => {
    setLocatorName(e.target.value);
  };

  return (
    <div className="locator-name-container">
      <label>Enter Locator Name: </label>
      <input
        ref={inputRef}
        type="text"
        className="cookie-input"
        value={locatorName}
        onChange={updateLocatorName}
        placeholder="Enter locator variable name"
      />
    </div>
  );
}
