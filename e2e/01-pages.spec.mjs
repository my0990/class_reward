import { test, expect } from "@playwright/test";

test("없는 주소는 404 안내 화면", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res.status()).toBe(404);
  await expect(page.getByText("페이지를 찾을 수 없어요")).toBeVisible();
  await page.getByRole("link", { name: "처음 화면으로" }).click();
  await expect(page).toHaveURL("/");
});

test("첫 화면 푸터에 개인정보처리방침 링크", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "개인정보처리방침" }).click();
  await expect(page.getByRole("heading", { name: "개인정보처리방침" })).toBeVisible();
});
