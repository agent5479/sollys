import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Project Pages URL is https://agent5479.github.io/sollys/ */
const pagesBase = process.env.VITE_BASE ?? (process.env.GITHUB_PAGES === "1" ? "/sollys/" : "/");

export default defineConfig({
  plugins: [react()],
  base: pagesBase,
  server: { port: 5173 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
