import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the site works under any GitHub Pages path
// (e.g. https://<user>.github.io/<repo>/).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
