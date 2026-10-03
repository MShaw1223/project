import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // vmThreads sets jsdom up once per worker rather than once per test file, still isolating the files
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"], pool: "vmThreads" },
});
