import { describe, it, expect, vi } from "vitest";
import { ObjectId } from "mongodb";
import {
  setupTestMongo,
  makeScope,
  seedStudent,
  seedClassData,
  getStudent,
} from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { buyProfileImgService } = await import("./profile.service.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope();

const URL_ID = new ObjectId().toHexString();
const IMG_URL = "https://example.com/cat.png";

async function seedProfileImg(price = 100) {
  await seedClassData(mongo.db, scope, {
    profileImgStorage: { [URL_ID]: { url: IMG_URL, price } },
  });
}

const buy = (userId, urlId = URL_ID, s = scope) =>
  buyProfileImgService({ teacher_id: s.teacher_id, classId: s.classId, userId, urlId });

describe("buyProfileImgService (프로필 이미지 구매)", () => {
  it("서버에 저장된 가격만큼 차감하고 이미지를 보유 목록에 넣는다", async () => {
    await seedProfileImg(100);
    await seedStudent(mongo.db, scope, { userId: "s1", money: 300 });

    // 클라이언트가 가격/잔액을 조작해 보내도 서비스는 받지 않는다
    await buyProfileImgService({
      teacher_id: scope.teacher_id,
      classId: scope.classId,
      userId: "s1",
      urlId: URL_ID,
      price: 0,
      balance: 99999,
    });

    const student = await getStudent(mongo.db, "s1");
    expect(student.money).toBe(200);
    expect(student.profileImgStorage[URL_ID]).toBe(IMG_URL);

    const history = await mongo.db.collection("history").findOne({ userId: "s1" });
    expect(history).toMatchObject({ name: "프로필 구입", type: "출금", amount: 100, balance: 200 });
  });

  it("DB 가격이 문자열(\"100\")이어도 구매된다", async () => {
    await seedProfileImg("100");
    await seedStudent(mongo.db, scope, { userId: "s1", money: 100 });

    await buy("s1");
    expect((await getStudent(mongo.db, "s1")).money).toBe(0);
  });

  it("잔액이 부족하면 구매되지 않는다 (잔액이 음수가 되지 않는다)", async () => {
    await seedProfileImg(100);
    await seedStudent(mongo.db, scope, { userId: "s1", money: 50 });

    await expect(buy("s1")).rejects.toThrow("잔액이 부족합니다.");
    const student = await getStudent(mongo.db, "s1");
    expect(student.money).toBe(50);
    expect(student.profileImgStorage).toBeUndefined();
  });

  it("이미 가진 이미지는 다시 살 수 없다", async () => {
    await seedProfileImg(100);
    await seedStudent(mongo.db, scope, { userId: "s1", money: 500 });

    await buy("s1");
    await expect(buy("s1")).rejects.toThrow("이미 구입한 프로필 이미지입니다.");
    expect((await getStudent(mongo.db, "s1")).money).toBe(400);
  });

  it("동시에 두 번 눌러도 한 번만 결제된다", async () => {
    await seedProfileImg(100);
    await seedStudent(mongo.db, scope, { userId: "s1", money: 500 });

    const results = await Promise.allSettled([buy("s1"), buy("s1")]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await getStudent(mongo.db, "s1")).money).toBe(400);
    expect(await mongo.db.collection("history").countDocuments()).toBe(1);
  });

  it("학급에 없는 이미지는 살 수 없다", async () => {
    await seedProfileImg(100);
    await seedStudent(mongo.db, scope, { userId: "s1", money: 500 });

    await expect(buy("s1", new ObjectId().toHexString())).rejects.toThrow("존재하지 않는 프로필 이미지입니다.");
  });

  it("다른 학급 학생은 살 수 없고, 학생 문서가 새로 생기지도 않는다", async () => {
    await seedProfileImg(100);

    await expect(buy("ghost")).rejects.toThrow("사용자 정보를 찾을 수 없습니다.");
    expect(await mongo.db.collection("user_data").countDocuments()).toBe(0);
  });

  it("다른 교사의 학급 정보로는 살 수 없다", async () => {
    await seedProfileImg(100);
    await seedStudent(mongo.db, scope, { userId: "s1", money: 500 });

    await expect(buy("s1", URL_ID, other)).rejects.toThrow("존재하지 않는 프로필 이미지입니다.");
    expect((await getStudent(mongo.db, "s1")).money).toBe(500);
  });

  it.each(["a.b", "$set", "", "123", null])("urlId가 %j처럼 ObjectId 형식이 아니면 거부한다", async (urlId) => {
    await seedProfileImg(100);
    await seedStudent(mongo.db, scope, { userId: "s1", money: 500 });

    await expect(buy("s1", urlId)).rejects.toThrow("잘못된 프로필 이미지입니다.");
    expect((await getStudent(mongo.db, "s1")).money).toBe(500);
  });
});
