import React, { useEffect, useRef, useState } from "react";

export default function ExistingVarNamesList({
  selectedVarIndex,
  setSelectedVarIndex,
  existingVarNames,
  setExistingVarNames,
}) {
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

        setExistingVarNames(Array.from(usedNames));
      } catch (err) {
        console.warn("Could not fetch existing variable names:", err);
      }
    };
    fetchExistingVarNames();
  }, []);

  // const handleVarNameChange = (e) => {
  //   const name = e.target.value;
  //   setVarName(name);
  //   setVarNameError(validateVarName(name));
  // };

  return (
    <div className="locator-name-container">
      {existingVarNames.length > 0 && setSelectedVarIndex !== null ? (
        <>
          <label>Variable Name (Required)</label>
          <select
            className="hdr-verb-select"
            value={selectedVarIndex}
            onChange={(e) => setSelectedVarIndex(Number(e.target.value))}
          >
            {existingVarNames.map((v, index) => (
              <option key={index} value={index}>
                {v}
              </option>
            ))}
          </select>
        </>
      ) : (
        <div>No Data</div>
      )}
    </div>
  );
}
