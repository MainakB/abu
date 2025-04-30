import React, { useState, useEffect } from "react";
import ConfirmCancelFooter from "../confirm-cancel-footer/ConfirmCancelFooter.jsx";

export default function AssertCookieValueDock({
  getCookies,
  mode,
  onConfirm,
  onCancel,
}) {
  // Initialize state for each attribute
  const [cookiesStates, setCookiesStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [softAssert, setSoftAssert] = useState(false);

  useEffect(() => {
    const fetchCookies = async () => {
      try {
        setLoading(true);
        const cookies = await getCookies();
        console.log(cookies);
        // Handle both object and array formats
        let processedCookies;
        if (Array.isArray(cookies)) {
          processedCookies = cookies.map((cookie) => {
            console.log("entries", Object.entries(cookie));
            const { name, value } = cookie;
            // Object.entries(cookie)[0];
            return {
              name,
              value,
              checked: false,
              isNegative: false,
              isSubstringMatch: false,
            };
          });
        } else {
          processedCookies = Object.entries(cookie).map(([name, value]) => ({
            name,
            value,
            checked: false,
            isNegative: false,
            isSubstringMatch: false,
          }));
        }

        setCookiesStates(processedCookies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCookies();
  }, [getCookies]);

  const updateCookie = (index, field, value) => {
    setCookiesStates((prevCookie) =>
      prevCookie.map((cookie, i) =>
        i === index ? { ...cookie, [field]: value } : cookie
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cookiesStates.every((cookie) => cookie.checked);
    setCookiesStates((prevCookies) =>
      prevCookies.map((cookie) => ({
        ...cookie,
        checked: !allSelected, // If all selected, unselect; otherwise select all
      }))
    );
  };

  const hasCheckedItems = cookiesStates.some((c) => c.checked);

  const handleCancel = () => {
    setSoftAssert(false);
    onCancel();
  };

  const handleConfirm = () => {
    const selectedAssertions = cookiesStates
      .filter((c) => c.checked)
      .map((c) => ({
        cookieName: c.name,
        value: c.value,
        isNegative: c.isNegative,
        isSubstringMatch: c.isSubstringMatch,
      }));
    onConfirm(selectedAssertions, softAssert);
    setSoftAssert(false);
  };

  return (
    <div
      id="floating-assert-attribute-dock"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="assert-dock-content">
        <div className="assert-dock-header">
          <strong>Assert Cookie Value</strong>
        </div>

        {loading && <div className="assert-loading">Loading cookies...</div>}
        {error && <div className="assert-error">Error: {error}</div>}
        {!loading && !error && cookiesStates.length === 0 && (
          <div className="assert-empty">No cookies found</div>
        )}
        {!loading && !error && cookiesStates.length > 0 && (
          <div className="assert-attributes-container">
            <div className="assert-attributes-container-wrapper">
              <button
                className="assert-toggle-button-neg-pos"
                type="button"
                onClick={toggleSelectAll}
              >
                {cookiesStates.every((c) => c.checked)
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {cookiesStates.map((cookie, index) => (
              <div key={index} className="assert-attribute-row">
                <label className="assert-checkbox-container">
                  <input
                    type="checkbox"
                    className="assert-checkbox"
                    checked={cookie.checked}
                    onChange={(e) =>
                      updateCookie(index, "checked", e.target.checked)
                    }
                  />
                </label>

                <input
                  type="text"
                  className="assert-input assert-attribute-name"
                  value={cookie.name}
                  readOnly
                  disabled
                  title={cookie.name}
                />

                <button
                  className="assert-toggle-button-neg-pos"
                  title={
                    cookie.isNegative ? "Assert not equals" : "Assert equals"
                  }
                  onClick={() =>
                    updateCookie(index, "isNegative", !cookie.isNegative)
                  }
                >
                  {cookie.isNegative ? "≠" : "="}
                </button>

                <input
                  type="text"
                  className="assert-input assert-attribute-value"
                  value={cookie.value}
                  onChange={(e) => updateCookie(index, "value", e.target.value)}
                />
                <button
                  className="assert-toggle-button-neg-pos"
                  title={
                    cookie.isSubstringMatch ? "Substring match" : "Exact match"
                  }
                  onClick={() =>
                    updateCookie(
                      index,
                      "isSubstringMatch",
                      !cookie.isSubstringMatch
                    )
                  }
                >
                  {cookie.isSubstringMatch ? "contains" : "exact"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmCancelFooter
        softAssert={softAssert}
        setSoftAssert={setSoftAssert}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        disabled={!hasCheckedItems}
      />
    </div>
  );
}
