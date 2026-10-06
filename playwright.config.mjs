// 화면 테스트 설정 — 직접 실행하지 말고 npm run test:e2e 로 (e2e/run.mjs가 테스트 DB를 준비한다)
import { defineConfig, devices } from "@playwright/test";

if (!process.env.E2E_MONGODB_URI) {
  throw new Error("npm run test:e2e 로 실행해주세요 (테스트용 DB 없이 실행하면 진짜 DB를 쓸 수 있습니다).");
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // 같은 테스트 DB를 쓰므로 순서대로
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    locale: "ko-KR",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npx next dev -p 3100",
    url: "http://localhost:3100",
    timeout: 180_000,
    reuseExistingServer: false,
    env: process.env, // run.mjs가 넣은 테스트용 MONGODB_URI 등
  },
});
