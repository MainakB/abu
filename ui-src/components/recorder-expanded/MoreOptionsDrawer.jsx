// import React, { useState, useEffect } from "react";
// import { ASSERTIONMODES } from "../constants/index.js";
// import Cookie from "./svg-icons/Cookie.jsx";
// // import CookieBin from "./svg-icons/CookieBin.jsx";
// // import NetworkGlobe from "./svg-icons/NetworkGlobe.jsx";
// // import Camera from "./svg-icons/Camera.jsx";
// // import Stopwatch from "./svg-icons/Stopwatch.jsx";

// export default function MoreOptionsDrawer({
//   isOpen,
//   onClose,
//   expanded,
//   onToggleSection,
//   onMenuSelection,
//   getClassName,
//   currentMode,
//   onMenuSelectionLaunchDock,
//   onMenuSelectionMonoStep,
// }) {
//   if (!isOpen) return null;

//   return (
//     <div className="drawer">
//       {/* <div className="drawer-header">
//         <span>Advanced Panel</span>
//         <button onClick={onClose}>❌</button>
//       </div> */}
//       <div className="drawer-content">
//         <div className="drawer-section">
//           <div
//             className="drawer-title"
//             onClick={() => onToggleSection("assertions")}
//           >
//             Assertions {expanded.assertions ? "▲" : "▼"}
//           </div>
//           {expanded.assertions && (
//             <ul className="drawer-list">
//               <li
//                 className={getClassName(
//                   currentMode,
//                   ASSERTIONMODES.ATTRIBUTEVALUE
//                 )}
//                 onClick={async () =>
//                   await onMenuSelection(ASSERTIONMODES.ATTRIBUTEVALUE)
//                 }
//               >
//                 ✓ Assert Attribute Value
//               </li>
//               <li
//                 className={getClassName(currentMode, ASSERTIONMODES.NETPAYLOAD)}
//                 onClick={async () =>
//                   await onMenuSelection(ASSERTIONMODES.NETPAYLOAD)
//                 }
//               >
//                 ✓ Assert Network Payload
//               </li>
//               <li
//                 className={getClassName(currentMode, ASSERTIONMODES.NETREQUEST)}
//                 onClick={async () =>
//                   await onMenuSelection(ASSERTIONMODES.NETREQUEST)
//                 }
//               >
//                 ✓ Assert Network Request
//               </li>
//               <li
//                 className={getClassName(currentMode, ASSERTIONMODES.PRSENECE)}
//                 onClick={async () =>
//                   await onMenuSelection(ASSERTIONMODES.PRSENECE)
//                 }
//               >
//                 ✓ Assert Element Present
//               </li>
//               <li
//                 className={getClassName(currentMode, ASSERTIONMODES.ENABLED)}
//                 onClick={async () =>
//                   await onMenuSelection(ASSERTIONMODES.ENABLED)
//                 }
//               >
//                 ✓ Assert Element Enabled
//               </li>
//               <li
//                 className={getClassName(currentMode, ASSERTIONMODES.DISABLED)}
//                 onClick={async () =>
//                   await onMenuSelection(ASSERTIONMODES.DISABLED)
//                 }
//               >
//                 ✓ Assert Element Disabled
//               </li>
//             </ul>
//           )}
//         </div>

//         <div className="drawer-section">
//           <div
//             className="drawer-title"
//             onClick={() => onToggleSection("actions")}
//           >
//             Actions {expanded.actions ? "▲" : "▼"}
//           </div>
//           {expanded.actions && (
//             <ul className="drawer-list">
//               <li>⏱ Wait For Element To Be Present</li>
//               <li>⏱ Wait For Element To Be Visible</li>
//               <li>⏱ Wait For Element To Be Clickable</li>
//               <li>⏱ Wait For Element To Be Enabled</li>
//               <li>⏱ Wait For Element To Be Disabled</li>
//               <li>🌐 Wait For Network Request</li>
//               <li
//                 className={getClassName(
//                   currentMode,
//                   ASSERTIONMODES.TAKESCREENSHOT
//                 )}
//                 onClick={async () =>
//                   await onMenuSelectionMonoStep(ASSERTIONMODES.TAKESCREENSHOT)
//                 }
//               >
//                 📷 Take Screenshot
//               </li>
//               <li
//                 className={getClassName(currentMode, ASSERTIONMODES.PAGERELOAD)}
//                 onClick={async () =>
//                   await onMenuSelectionMonoStep(ASSERTIONMODES.PAGERELOAD)
//                 }
//               >
//                 🔄 PAGE RELOAD
//               </li>
//               <li
//                 className={getClassName(currentMode, ASSERTIONMODES.ADDCOOKIES)}
//                 onClick={async () =>
//                   await onMenuSelectionLaunchDock(ASSERTIONMODES.ADDCOOKIES)
//                 }
//               >
//                 🍪 Add Cookies
//               </li>
//               <li
//                 className={getClassName(
//                   currentMode,
//                   ASSERTIONMODES.DELETECOOKIES
//                 )}
//                 onClick={async () =>
//                   await onMenuSelectionLaunchDock(ASSERTIONMODES.DELETECOOKIES)
//                 }
//               >
//                 {/* // onClick={handleDeleteCookies}> */}
//                 {/* <span clasName="icon-svg-container">
//                 <CookieBin />
//                 Delete Cookies
//               </span> */}
//                 🗑️ Delete Cookies
//               </li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//               <li>🌐 Wait For Network Request</li>
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { ASSERTIONMODES } from "../../constants/index.js";
import Cookie from "../svg-icons/Cookie.jsx";

export default function MoreOptionsDrawer({
  isOpen,
  onClose,
  expanded, // This will now be controlled by the parent
  onToggleSection,
  onMenuSelection,
  getClassName,
  currentMode,
  onMenuSelectionLaunchDock,
  onMenuSelectionMonoStep,
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer">
      <div className="drawer-content">
        <div className="drawer-section">
          <div
            className="drawer-title"
            onClick={() => onToggleSection("assertions")}
          >
            Assertions {expanded.assertions ? "▲" : "▼"}
          </div>
          {expanded.assertions && (
            <ul className="drawer-list">
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.ATTRIBUTEVALUE
                )}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.ATTRIBUTEVALUE)
                }
              >
                ✓ Assert Attribute Value
              </li>
              <li
                className={getClassName(currentMode, ASSERTIONMODES.NETPAYLOAD)}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.NETPAYLOAD)
                }
              >
                ✓ Assert Network Payload
              </li>
              <li
                className={getClassName(currentMode, ASSERTIONMODES.NETREQUEST)}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.NETREQUEST)
                }
              >
                ✓ Assert Network Request URL
              </li>
              <li
                className={getClassName(currentMode, ASSERTIONMODES.PRSENECE)}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.PRSENECE)
                }
              >
                ✓ Assert Element Present
              </li>
              <li
                className={getClassName(currentMode, ASSERTIONMODES.ENABLED)}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.ENABLED)
                }
              >
                ✓ Assert Element Enabled
              </li>
              <li>✓ Assert Element Count</li>
              <li
                className={getClassName(currentMode, ASSERTIONMODES.RADIOSTATE)}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.RADIOSTATE)
                }
              >
                ✓ Assert Radio State
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.CHECKBOXSTATE
                )}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.CHECKBOXSTATE)
                }
              >
                ✓ Assert Checkbox State
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.DROPDOWNSELECTED
                )}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.DROPDOWNSELECTED)
                }
              >
                ✓ Assert Dropdown Selected
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.DROPDOWNCOUNTIS
                )}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.DROPDOWNCOUNTIS)
                }
              >
                ✓ Assert Dropdown Count
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.DROPDOWNCONTAINS
                )}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.DROPDOWNCONTAINS)
                }
              >
                ✓ Assert Dropdown Contains
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.DROPDOWNVALUESARE
                )}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.DROPDOWNVALUESARE)
                }
              >
                ✓ Assert Dropdown Values
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.DROPDOWNINALPHABETICORDER
                )}
                onClick={async () =>
                  await onMenuSelection(
                    ASSERTIONMODES.DROPDOWNINALPHABETICORDER
                  )
                }
              >
                ✓ Assert Dropdown Ordering
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.DROPDOWNDUPLICATECOUNT
                )}
                onClick={async () =>
                  await onMenuSelection(ASSERTIONMODES.DROPDOWNDUPLICATECOUNT)
                }
              >
                ✓ Assert Dropdown Duplicate Count
              </li>
              <li>✓ Assert Cookie Value</li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.ASSERTCURRENTURL
                )}
                onClick={async () =>
                  await onMenuSelectionLaunchDock(
                    ASSERTIONMODES.ASSERTCURRENTURL
                  )
                }
              >
                ✓ Assert Current Url
              </li>
              <li>✓ Assert Text In Page Source</li>
            </ul>
          )}
        </div>

        <div className="drawer-section">
          <div
            className="drawer-title"
            onClick={() => onToggleSection("actions")}
          >
            Actions {expanded.actions ? "▲" : "▼"}
          </div>
          {expanded.actions && (
            <ul className="drawer-list">
              <li>
                <span className="icon">⏱</span> Wait For Element To Be Present
              </li>
              <li>
                <span className="icon">⏱</span> Wait For Element To Be Visible
              </li>
              <li>
                <span className="icon">⏱</span> Wait For Element To Be Clickable
              </li>
              <li>
                <span className="icon">⏱</span> Wait For Element To Be Enabled
              </li>
              <li>
                <span className="icon">⏱</span> Wait For Element To Be Disabled
              </li>
              <li>
                <span className="icon">🌐</span> Wait For Network Request
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.TAKESCREENSHOT
                )}
                onClick={async () =>
                  await onMenuSelectionMonoStep(ASSERTIONMODES.TAKESCREENSHOT)
                }
              >
                <span className="icon">📷</span> Take Screenshot
              </li>
              <li
                className={getClassName(currentMode, ASSERTIONMODES.PAGERELOAD)}
                onClick={async () =>
                  await onMenuSelectionMonoStep(ASSERTIONMODES.PAGERELOAD)
                }
              >
                <span className="icon">🔄</span> Page Reload
              </li>
              <li
                className={getClassName(currentMode, ASSERTIONMODES.ADDCOOKIES)}
                onClick={async () =>
                  await onMenuSelectionLaunchDock(ASSERTIONMODES.ADDCOOKIES)
                }
              >
                <span className="icon">🍪</span> Add Cookies
              </li>
              <li
                className={getClassName(
                  currentMode,
                  ASSERTIONMODES.DELETECOOKIES
                )}
                onClick={async () =>
                  await onMenuSelectionLaunchDock(ASSERTIONMODES.DELETECOOKIES)
                }
              >
                <span className="icon">🗑️</span> Delete Cookies
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
