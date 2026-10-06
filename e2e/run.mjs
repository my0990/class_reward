// 화면 테스트 실행기: npm run test:e2e
//
// 1) 메모리 MongoDB를 띄우고 테스트용 교사·학급·학생을 넣는다 (진짜 DB는 절대 쓰지 않는다)
// 2) 그 DB를 바라보는 개발 서버(포트 3100, 빌드 폴더 .next-e2e)를 Playwright가 켠다
// 3) 테스트가 끝나면 DB를 지운다
//
// 처음 한 번: npm i -D @playwright/test && npx playwright install chromium
import { spawn } from "node:child_process";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { seed } from "./seed.mjs";

const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
const uri = replSet.getUri();
if (!/^mongodb:\/\/127\.0\.0\.1/.test(uri)) throw new Error("테스트 DB가 로컬이 아닙니다. 중단합니다.");

const client = new MongoClient(uri);
await client.connect();
await seed(client);
await client.close();

const env = {
  ...process.env,
  E2E_MONGODB_URI: uri,
  // .env.local보다 먼저 정해 두면 Next가 덮어쓰지 않는다 → 진짜 DB·메일 키를 쓰지 않는다
  MONGODB_URI: uri,
  NEXTAUTH_SECRET: "e2e-secret",
  NEXTAUTH_URL: "http://localhost:3100",
  EMAIL_CODE_HMAC_KEY: "e2e-hmac",
  RESEND_API_KEY: "e2e-disabled",
  MAIL_FROM: "e2e@example.com",
  ADMIN_EMAILS: "",
  NEXT_DIST_DIR: ".next-e2e",
};

const args = ["playwright", "test", ...process.argv.slice(2)];
const child = spawn("npx", args, { stdio: "inherit", env, shell: process.platform === "win32" });
const code = await new Promise((resolve) => child.on("exit", resolve));
await replSet.stop();
process.exit(code ?? 1);
