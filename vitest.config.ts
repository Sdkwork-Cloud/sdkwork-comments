import { defineConfig } from "vitest/config";

const setupFile = new URL("./vitest.setup.ts", import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
    },
  },
  test: {
    environment: "node",
    setupFiles: [setupFile],
  },
});
