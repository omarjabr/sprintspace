import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import proxyOptions from "./proxyOptions";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: proxyOptions,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../sprintspace/public/frontend",
    emptyOutDir: true,
    target: "es2015",
  },
});
