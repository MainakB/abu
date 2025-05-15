import React, { useState } from "react";

export default function AIAssistedSearch({ options, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);

    // Call to embedding + similarity ranking
    const matches = await window.__aiSearch(val, options);
    setResults(matches);
  };

  return (
    <div>
      <input
        className="ai-search-input"
        type="text"
        placeholder="Search actions/assertions"
        value={query}
        onChange={handleSearch}
      />
      <ul className="ai-search-results">
        {results.map(({ label, mode }) => (
          <li key={mode} onClick={() => onSelect(mode)}>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
