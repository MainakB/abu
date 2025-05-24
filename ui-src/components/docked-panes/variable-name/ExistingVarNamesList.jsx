// import React, { useEffect, useRef, useState } from "react";

// export default function ExistingVarNamesList({
//   selectedVarIndex,
//   setSelectedVarIndex,
//   existingVarNames,
//   setExistingVarNames,
// }) {
//   useEffect(() => {
//     // Fetch existing var names once on mount
//     const fetchExistingVarNames = async () => {
//       try {
//         const res = await fetch("http://localhost:3111/record", {
//           headers: { "Content-Type": "application/json" },
//         });
//         const data = await res.json();
//         const usedNames = new Set(
//           data.map((step) => step.varName).filter(Boolean)
//         );

//         setExistingVarNames(Array.from(usedNames));
//       } catch (err) {
//         console.warn("Could not fetch existing variable names:", err);
//       }
//     };
//     fetchExistingVarNames();
//   }, []);

//   // const handleVarNameChange = (e) => {
//   //   const name = e.target.value;
//   //   setVarName(name);
//   //   setVarNameError(validateVarName(name));
//   // };

//   return (
//     <div className="locator-name-container">
//       {existingVarNames.length > 0 && setSelectedVarIndex !== null ? (
//         <>
//           <label>Variable Name (Required)</label>
//           <select
//             className="hdr-verb-select"
//             value={selectedVarIndex}
//             onChange={(e) => setSelectedVarIndex(Number(e.target.value))}
//           >
//             {existingVarNames.map((v, index) => (
//               <option key={index} value={index}>
//                 {v}
//               </option>
//             ))}
//           </select>
//         </>
//       ) : (
//         <div>No Data</div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import SearchableDropdown from "./SearchableDropdown.jsx";

export default function ExistingVarNamesList({
  selectedVarIndex,
  setSelectedVarIndex,
  existingVarNames,
  setExistingVarNames,
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExistingVarNames = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchExistingVarNames();
  }, []);

  return (
    <div className="locator-name-container">
      {loading ? (
        <div>Loading...</div>
      ) : existingVarNames.length === 0 ? (
        <div>No Data</div>
      ) : (
        <SearchableDropdown
          options={existingVarNames}
          selectedIndex={selectedVarIndex}
          setSelectedIndex={setSelectedVarIndex}
          label="Variable Name (Required)"
        />
      )}
    </div>
  );
}
