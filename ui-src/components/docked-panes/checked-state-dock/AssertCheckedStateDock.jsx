import React, { useState, useEffect, useMemo } from "react";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

// export default function AssertCheckedStateDock({
//   el,
//   onConfirm,
//   onCancel,
//   label, // descriptive label like "Checkbox" or "Radio Button"
// }) {
//   const [isChecked, setIsChecked] = useState(el.checked);
//   const [softAssert, setSoftAssert] = useState(false);
//   const [locatorName, setLocatorName] = useState("");

//   const handleConfirm = (elValue) => {
//     onConfirm(
//       {
//         type: label,
//         isChecked,
//       },
//       softAssert,
//       elValue
//     );
//     setSoftAssert(false);
//   };

//   const handleCancel = () => {
//     setSoftAssert(false);
//     onCancel();
//   };

//   if (label.toLowerCase() === "radio" && el.tagName !== "input") {
//     const isPrecedingSiblingInput =
//       el.previousElementSibling &&
//       el.previousElementSibling.tagName &&
//       el.previousElementSibling.tagName.toLowerCase() === "input";

//     let isNextSiblingInput = false;
//     if (!isPrecedingSiblingInput) {
//       isNextSiblingInput =
//         el.nextElementSibling &&
//         el.nextElementSibling.tagName &&
//         el.nextElementSibling.tagName.toLowerCase() === "input";
//     }

//     if (isPrecedingSiblingInput) {
//       el = el.previousElementSibling;
//     } else if (isNextSiblingInput) {
//       el = el.nextElementSibling;
//     }
//   }

//   return (
//     <div
//       id="floating-assert-attribute-dock"
//       onClick={(e) => e.stopPropagation()}
//       onMouseDown={(e) => e.stopPropagation()}
//     >
//       <div className="assert-dock-content">
//         <div className="assert-dock-header">
//           <strong>Assert {label} state</strong>
//         </div>

//         <div className="assert-attributes-container">
//           {el && el.type && el.type === label.toLowerCase() ? (
//             <div className="assert-attribute-row">
//               <label className="assert-checkbox-container" style={{ flex: 1 }}>
//                 <input
//                   type="radio"
//                   name="assert-checked-state"
//                   checked={isChecked === true}
//                   onChange={() => setIsChecked(true)}
//                 />
//                 <span style={{ marginLeft: "6px" }}>Is Checked</span>
//               </label>
//               <label className="assert-checkbox-container" style={{ flex: 1 }}>
//                 <input
//                   type="radio"
//                   name="assert-checked-state"
//                   checked={isChecked === false}
//                   onChange={() => setIsChecked(false)}
//                 />
//                 <span style={{ marginLeft: "6px" }}>Is Not Checked</span>
//               </label>
//             </div>
//           ) : (
//             <div className="assert-attribute-row">
//               <span>Element trying to assert is not a {label}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       <ConfirmCancelFooter
//         locatorName={locatorName}
//         setLocatorName={setLocatorName}
//         softAssert={softAssert}
//         setSoftAssert={setSoftAssert}
//         onCancel={handleCancel}
//         onConfirm={() => handleConfirm(el)}
//         disabled={
//           el && el.type && el.type === label.toLowerCase() ? false : true
//         }
//       />
//     </div>
//   );
// }

export default function AssertCheckedStateDock({
  el,
  onConfirm,
  onCancel,
  label, // descriptive label like "Checkbox" or "Radio Button"
}) {
  // const [isChecked, setIsChecked] = useState(el.checked);
  const [isChecked, setIsChecked] = useState(false);
  const [softAssert, setSoftAssert] = useState(false);
  const [locatorName, setLocatorName] = useState("");

  // ✅ Create a clean memoized version of the element
  const effectiveEl = useMemo(() => {
    if (!el) return null;

    if (label.toLowerCase() === "radio" && el.tagName !== "INPUT") {
      const isPrecedingSiblingInput =
        el.previousElementSibling &&
        el.previousElementSibling.tagName &&
        el.previousElementSibling.tagName.toLowerCase() === "input";

      let isNextSiblingInput = false;
      if (!isPrecedingSiblingInput) {
        isNextSiblingInput =
          el.nextElementSibling &&
          el.nextElementSibling.tagName &&
          el.nextElementSibling.tagName.toLowerCase() === "input";
      }

      if (isPrecedingSiblingInput) {
        return el.previousElementSibling;
      } else if (isNextSiblingInput) {
        return el.nextElementSibling;
      }
    }

    return el;
  }, [el, label]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (effectiveEl && typeof effectiveEl.checked === "boolean") {
        setIsChecked(effectiveEl.checked);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [effectiveEl]);

  // ✅ Confirm handler uses fresh effectiveEl
  const handleConfirm = () => {
    onConfirm(
      {
        type: label,
        isChecked,
      },
      softAssert,
      effectiveEl,
      locatorName
    );
    setSoftAssert(false);
  };

  const handleCancel = () => {
    setSoftAssert(false);
    onCancel();
  };

  return (
    <div
      id="floating-assert-attribute-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Assert {label} state</strong>
        </div>

        <div className="assert-attributes-container">
          {effectiveEl &&
          effectiveEl.type &&
          effectiveEl.type === label.toLowerCase() ? (
            <div className="assert-attribute-row">
              <label className="assert-checkbox-container" style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="assert-checked-state"
                  checked={isChecked === true}
                  onChange={() => setIsChecked(true)}
                />
                <span style={{ marginLeft: "6px" }}>Is Checked</span>
              </label>
              <label className="assert-checkbox-container" style={{ flex: 1 }}>
                <input
                  type="radio"
                  name="assert-checked-state"
                  checked={isChecked === false}
                  onChange={() => setIsChecked(false)}
                />
                <span style={{ marginLeft: "6px" }}>Is Not Checked</span>
              </label>
            </div>
          ) : (
            <div className="assert-attribute-row">
              <span>Element trying to assert is not a {label}</span>
            </div>
          )}
        </div>
      </div>

      <ConfirmCancelFooter
        locatorName={locatorName}
        setLocatorName={setLocatorName}
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={
          !(
            effectiveEl &&
            effectiveEl.type &&
            effectiveEl.type === label.toLowerCase()
          )
        }
      />
    </div>
  );
}
