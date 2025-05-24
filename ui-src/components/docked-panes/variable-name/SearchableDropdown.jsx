import React, { useState, useRef, useEffect } from "react";
// optional for styling

export default function SearchableDropdown({
  options = [],
  selectedIndex,
  setSelectedIndex,
  label = "Variable Name",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setQuery(""); // reset search
    setOpen(false);
  };

  const selectedLabel = options[selectedIndex] || "";

  return (
    <div className="searchable-dropdown" ref={containerRef}>
      <label>{label}</label>
      <div className="dropdown-control" onClick={() => setOpen(!open)}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search or select..."
          value={open ? query : selectedLabel}
          onChange={(e) => setQuery(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          readOnly={!open}
        />
      </div>

      {open && (
        <ul className="dropdown-menu">
          {filteredOptions.length === 0 && (
            <li className="dropdown-item disabled">No matches</li>
          )}
          {filteredOptions.map((name, i) => {
            const realIndex = options.indexOf(name); // for mapping to original index
            return (
              <li
                key={i}
                className="dropdown-item"
                onClick={() => handleSelect(realIndex)}
              >
                {name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
