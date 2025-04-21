import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  define: { "process.env": {} },
  build: {
    lib: {
      // 🆕 NEW ENTRY POINT
      entry: resolve(__dirname, "floatingAssertDockMount.jsx"),
      name: "FloatingAssertDock",
      formats: ["iife"],
      fileName: () => "floatingAssert.bundle.js", // ⬅️ keep same filename
    },
    outDir: resolve(__dirname, "../injected"),
    emptyOutDir: false, // Don't wipe out `panel.bundle.js`
    cssCodeSplit: false,
  },
});
