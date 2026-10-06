import { test, expect } from "@playwright/test";
import { E2E, loginTeacher, typeKeypad, withDb } from "./helpers.mjs";

const [s1, s2] = E2E.students;
const kiosk = `/teacher/kiosk/${E2E.classId}`;

test.beforeEach(async ({ page }) => {
  await loginTeacher(page);
});

test("잔액이 모자란 학생은 구매할 수 없다", async ({ page }) => {
  await page.goto(kiosk);
  await page.getByRole("link", { name: /아이템 구매하기/ }).click();
  await page.getByRole("button", { name: new RegExp(E2E.item.itemName) }).click();
  await page.getByRole("button", { name: new RegExp(s2.profileNickname) }).click();
  await expect(page.getByText("쿠키가 모자랍니다.")).toBeVisible();
});

test("처음 비밀번호 학생: 키오스크에서 새 비밀번호를 정하고 아이템을 산다", async ({ page }) => {
  await page.goto(kiosk);
  await page.getByRole("link", { name: /아이템 구매하기/ }).click();
  await page.getByRole("button", { name: new RegExp(E2E.item.itemName) }).click();
  await page.getByRole("button", { name: new RegExp(s1.profileNickname) }).click();

  await expect(page.getByText("비밀번호를 눌러주세요")).toBeVisible();
  await typeKeypad(page, s1.password);
  await expect(page.getByText(/새 비밀번호를 눌러주세요/)).toBeVisible();
  await typeKeypad(page, "4826");
  await expect(page.getByText("새 비밀번호를 한 번 더 눌러주세요")).toBeVisible();
  await typeKeypad(page, "4826");

  await page.getByRole("button", { name: "결제하기" }).click();
  await expect(page.getByText("아이템을 구입하였습니다")).toBeVisible();
  await page.getByRole("button", { name: "다음에 사용할래요" }).click();
  await expect(page).toHaveURL(kiosk);

  await withDb(async (client) => {
    const student = await client.db("data").collection("user_data").findOne({ userId: s1.userId });
    expect(student.money).toBe(s1.money - E2E.item.itemPrice);
    expect(student.itemList).toHaveLength(1);
    const cls = await client.db("data").collection("class_data").findOne({ itemList: { $exists: true } });
    expect(cls.itemList[0].itemStock).toBe(E2E.item.itemStock - 1);
  });
});

test("바꾼 비밀번호로는 바로 사용 화면으로 넘어가고, 산 아이템을 쓸 수 있다", async ({ page }) => {
  await page.goto(kiosk);
  await page.getByRole("link", { name: /아이템 사용하기/ }).click();
  await page.getByRole("button", { name: new RegExp(s1.profileNickname) }).click();
  await typeKeypad(page, "4826");
  await page.getByRole("button", { name: new RegExp(E2E.item.itemName) }).click();
  await page.getByRole("button", { name: "확인" }).click();
  await expect(page.getByText("아이템을 사용하였습니다")).toBeVisible();
  await expect(page).toHaveURL(kiosk);

  await withDb(async (client) => {
    const student = await client.db("data").collection("user_data").findOne({ userId: s1.userId });
    expect(student.itemList).toHaveLength(0);
  });
});
