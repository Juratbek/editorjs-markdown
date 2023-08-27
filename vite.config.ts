import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: true,
    minify: true,
    reportCompressedSize: true,
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      fileName: "build",
      formats: ["iife", "es",],
      name: "Markdown",
    },
  },
});
