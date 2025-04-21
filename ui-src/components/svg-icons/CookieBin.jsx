import React from "react";

export default function CookieBin() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: 6 }}
    >
      <rect x="20" y="28" width="24" height="28" fill="#888" rx="2" />
      <rect x="18" y="26" width="28" height="4" fill="#666" rx="1" />
      <line x1="24" y1="30" x2="24" y2="54" stroke="#444" strokeWidth="2" />
      <line x1="32" y1="30" x2="32" y2="54" stroke="#444" strokeWidth="2" />
      <line x1="40" y1="30" x2="40" y2="54" stroke="#444" strokeWidth="2" />

      <circle
        cx="32"
        cy="16"
        r="10"
        fill="#d7a96b"
        stroke="#a4743f"
        strokeWidth="1.5"
      />
      <circle cx="28" cy="13" r="1.5" fill="#5c3b1e" />
      <circle cx="35" cy="18" r="1.2" fill="#5c3b1e" />
      <circle cx="30" cy="20" r="1" fill="#5c3b1e" />
    </svg>
  );
}
