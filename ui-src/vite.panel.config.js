// // ui-src/vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { resolve } from "path";

// export default defineConfig({
//   plugins: [react()],
//   define: {
//     "process.env": {}, // ✅ Prevents "process is not defined"
//   },
//   build: {
//     lib: {
//       entry: resolve(__dirname, "index.jsx"),
//       name: "RecorderUI",
//       formats: ["iife"], // ⬅️ IIFE for browser injection
//       fileName: () => "ui.bundle.js",
//     },
//     outDir: resolve(__dirname, "../injected"),
//     // outDir: process.cwd() + "/injected", // ⬅️ Make sure it builds to the injected folder
//     emptyOutDir: true,
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    // cssInjected()
  ], // ✅ inject CSS into JS bundle
  define: { "process.env": {} },
  build: {
    lib: {
      entry: resolve(__dirname, "index.jsx"),
      name: "Panel",
      formats: ["iife"], // ✅ compatible with browser injection
      fileName: () => "panel.bundle.js",
    },
    outDir: resolve(__dirname, "../injected"),
    emptyOutDir: false,
    // cssCodeSplit: false, //seperate css file generation is required in recorder.js
  },
});
