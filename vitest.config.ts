import { defineConfig } from "vitest/config";

const setupFile = new URL("./vitest.setup.ts", import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
      "@sdkwork/comments-contracts":
        new URL("./packages/common/comments/sdkwork-comments-contracts/src/index.ts", import.meta.url).pathname,
      "@sdkwork/comments-service":
        new URL("./packages/common/comments/sdkwork-comments-service/src/index.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    setupFiles: [setupFile],
  },
});
