import { type AliasOptions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const root = path.resolve(__dirname, "src");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
 resolve: {
    alias: {
      "@": root,
    } as AliasOptions,
  },
});
