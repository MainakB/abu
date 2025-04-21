import React from "react";

export default function Stopwatch() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: 6 }}
    >
      <circle cx="32" cy="32" r="30" fill="#e6f3ff" stroke="#4a90e2" />
      <path
        d="M2 32h60M32 2v60M10 10c10 10 34 10 44 0M10 54c10-10 34-10 44 0"
        stroke="#4a90e2"
      />
      <ellipse cx="32" cy="32" rx="12" ry="30" fill="none" stroke="#4a90e2" />
    </svg>
  );
}
