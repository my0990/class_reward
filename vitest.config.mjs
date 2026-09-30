import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.{js,jsx,ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**"],
    hookTimeout: 60000, // mongodb-memory-server 최초 실행 시 mongod 바이너리 다운로드 등으로 느릴 수 있음
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      // jsconfig.json의 "@/*" -> 프로젝트 루트 alias와 동일하게 맞춘다
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
