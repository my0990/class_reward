import { test, expect } from "@playwright/test";
import { E2E } from "./helpers.mjs";

const s3 = E2E.students[2];

test("처음 비밀번호로 로그인한 학생은 새 비밀번호부터 정한다", async ({ page }) => {
  await page.goto("/auth/login/student");
  await page.getByPlaceholder("아이디를 입력해주세요").fill(s3.userId);
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill(s3.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("**/student/change-password");

  // 다른 화면으로 가려 해도 다시 돌아온다
  await page.goto(`/student/dashboard/${E2E.classId}`);
  await expect(page).toHaveURL(/\/student\/change-password$/);

  await page.getByPlaceholder("새 비밀번호", { exact: true }).fill("1111");
  await page.getByPlaceholder("새 비밀번호 한 번 더").fill("1111");
  await page.getByRole("button", { name: "비밀번호 바꾸기" }).click();
  await expect(page.getByText(/반복하면 안 돼요/)).toBeVisible();

  await page.getByPlaceholder("새 비밀번호", { exact: true }).fill("7391");
  await page.getByPlaceholder("새 비밀번호 한 번 더").fill("7391");
  await page.getByRole("button", { name: "비밀번호 바꾸기" }).click();
  await page.waitForURL(`**/student/dashboard/${E2E.classId}`);
});
