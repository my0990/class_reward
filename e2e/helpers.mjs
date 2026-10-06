import { MongoClient } from "mongodb";
import { E2E } from "./seed.mjs";

export { E2E };

/** 테스트 DB에서 직접 확인할 때 */
export async function withDb(fn) {
  const client = new MongoClient(process.env.E2E_MONGODB_URI);
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

export async function loginTeacher(page) {
  await page.goto("/auth/login/teacher");
  await page.getByPlaceholder("이메일을 입력해주세요").fill(E2E.teacher.email);
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill(E2E.teacher.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("**/teacher/classes");
}

/** 키오스크 비밀번호 키패드: 키보드 숫자 + Enter */
export async function typeKeypad(page, digits) {
  for (const d of digits) await page.keyboard.press(d);
  await page.keyboard.press("Enter");
}
