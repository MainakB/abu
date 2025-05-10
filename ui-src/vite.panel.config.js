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
