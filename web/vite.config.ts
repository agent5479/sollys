import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Custom domain (www.sollys.co.nz) serves from site root.
 * Keep base `/` so CSS/JS resolve at /assets/… — not /sollys/assets/…
 * (project-pages path breaks once the domain is applied).
 */
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [react()],
  base,
  server: { port: 5173 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
