import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * GitHub project Pages serves at https://<user>.github.io/<repo>/.
 * Override with VITE_BASE=/ for a custom domain at site root.
 */
const base = process.env.VITE_BASE ?? "/sollys/";

export default defineConfig({
  plugins: [react()],
  base,
  server: { port: 5173 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
