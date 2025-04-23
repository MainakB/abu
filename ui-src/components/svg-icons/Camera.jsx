import React from "react";

export default function Camera() {
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
      <rect
        x="8"
        y="16"
        width="48"
        height="36"
        rx="4"
        ry="4"
        fill="#e8e8e8"
        stroke="#444"
      />
      <circle cx="32" cy="34" r="10" fill="#fff" stroke="#4a4a4a" />
      <rect x="20" y="10" width="8" height="6" rx="2" fill="#444" />
      <circle cx="46" cy="22" r="2" fill="#888" />
    </svg>
  );
}
