import { test, expect } from "@playwright/test";
import { E2E, loginTeacher } from "./helpers.mjs";

test("선생님 로그인 → 학급 선택 화면에 학급이 보인다", async ({ page }) => {
  await loginTeacher(page);
  await expect(page.getByRole("heading", { name: "학급 선택" })).toBeVisible();
  await expect(page.getByText(E2E.className)).toBeVisible();
});

test("비밀번호를 틀리면 실패, 5번 틀리면 잠긴다", async ({ page }) => {
  await page.goto("/auth/login/teacher");
  await page.getByPlaceholder("이메일을 입력해주세요").fill("locked-test@test.com");
  for (let i = 0; i < 5; i++) {
    await page.getByPlaceholder("비밀번호를 입력해주세요").fill(`wrong-${i}`);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page.getByText(/올바르지 않습니다|잠겼습니다/)).toBeVisible();
  }
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill("anything");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByText(/잠겼습니다/)).toBeVisible();
});
