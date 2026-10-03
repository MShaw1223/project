/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

// proxies /backend/* to the Go server so the browser stays same-origin (the Go server has no CORS
// middleware); nginx.conf does the same in the container image. Port 3000 is the origin the Go
// server allows by default (APP_ORIGINS)
const server = {
  port: 3000,
  strictPort: true,
  proxy: { "/backend": { target: BACKEND_URL, rewrite: (path: string) => path.replace(/^\/backend/, "") } },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server,
  preview: server,
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // vmThreads sets jsdom up once per worker rather than once per test file, still isolating the files
    pool: "vmThreads",
    // only collected by `npm run test:coverage`. Every source file counts, including the ones no test
    // imports, so the figures are for the whole app rather than for the files that happen to be tested
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/**/*.d.ts"],
      // text-summary is what CI reads the percentage from, cobertura what GitLab annotates diffs with
      reporter: ["text", "text-summary", "html", "cobertura"],
    },
  },
});
