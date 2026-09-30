// 교사용 server action이 학생 세션/남의 학급에서 실행되지 않는지 확인한다.
// (예전에는 로그인만 확인해서, 학생 id가 교사 id 자리에 들어간 채로 서비스가 실행됐다)
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { setupTestMongo, makeScope, seedStudent, seedClassData, getStudent } from "@/test/helpers/testMongo";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));
vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);

const { getServerSession } = await import("next-auth");
const { createItem, updateItem, deleteItem } = await import("./market/market.action.js");
const { handlePoint } = await import("./class/handlePoint.js");
const { updateThermometerSetting, updateManualDegree } = await import("./thermometer/thermometer.action.js");
const { createQuest } = await import("./quest/quest.action.js");
const { createProfileImg, selectProfileImg, selectProfileTitle } = await import("./profile/profile.action.js");
const { updateCurrencyName } = await import("./class/classSetting.action.js");
const { createClass } = await import("./class/createClass.js");

const mongo = setupTestMongo();
const scope = makeScope();
const other = makeScope(); // 다른 교사의 학급

const asTeacher = (s = scope) => getServerSession.mockResolvedValue({ user: { role: "teacher", _id: s.teacher_id } });
const asStudent = (userId = "s1", s = scope) =>
  getServerSession.mockResolvedValue({
    user: { role: "student", _id: new ObjectId().toHexString(), userId, teacher_id: s.teacher_id, classId: s.classId },
  });

async function seedClass(s) {
  await mongo.db.collection("classes").insertOne({ _id: s.classObjectId, teacher_id: s.teacherObjectId, className: "반" });
  await seedClassData(mongo.db, s, { currencyName: "쿠키" });
}

beforeEach(async () => {
  // 실패를 일부러 일으키는 테스트라 action의 console.error 로그는 숨긴다 (테스트 결과에는 영향 없음)
  vi.spyOn(console, "error").mockImplementation(() => {});
  getServerSession.mockReset();
  await seedClass(scope);
  await seedClass(other);
});

const count = (name, filter = {}) => mongo.db.collection(name).countDocuments(filter);

describe("학생 세션으로는 교사용 action이 실행되지 않는다", () => {
  it("아이템 등록/수정/삭제", async () => {
    asStudent();
    expect((await createItem({ classId: scope.classId, itemName: "a", itemPrice: 1, itemStock: 1 })).result).toBe(false);
    expect((await updateItem({ classId: scope.classId, itemId: "x", updatedItemStock: 1, updatedItemPrice: 1 })).result).toBe(false);
    expect((await deleteItem({ classId: scope.classId, itemId: "x" })).result).toBe(false);
    const doc = await mongo.db.collection("class_data").findOne({ classId: scope.classObjectId });
    expect(doc.itemList).toHaveLength(0);
  });

  it("포인트 지급", async () => {
    await seedStudent(mongo.db, scope, { userId: "s1", money: 0 });
    asStudent("s1");
    const res = await handlePoint({ classId: scope.classId, targetStudent: [{ userId: "s1" }], point: 1000, isSend: true });
    expect(res.success).toBe(false);
    expect((await getStudent(mongo.db, "s1")).money).toBe(0);
  });

  it("퀘스트 생성, 온도계 설정, 화폐 이름 변경, 프로필 이미지 등록, 학급 생성", async () => {
    asStudent();
    expect((await createQuest({ classId: scope.classId, questName: "q", questReward: 1 })).result).toBe(false);
    expect((await updateThermometerSetting({ classId: scope.classId, rewardObj: {}, requireCurrency: 10 })).result).toBe(false);
    expect((await updateManualDegree({ classId: scope.classId, degreeChange: 50, type: "increase" })).result).toBe(false);
    expect((await updateCurrencyName({ classId: scope.classId, currencyName: "해킹", currencyEmoji: "💀" })).result).toBe(false);
    expect((await createProfileImg({ classId: scope.classId, createdProfileImgUrl: "https://x.com/a.png" })).result).toBe(false);
    expect((await createClass({ className: "가짜반" })).success).toBe(false);

    expect(await count("quest")).toBe(0);
    expect(await count("thermometer")).toBe(0);
    expect(await count("classes")).toBe(2);
    const doc = await mongo.db.collection("class_data").findOne({ classId: scope.classObjectId });
    expect(doc.currencyName).toBe("쿠키");
    expect(doc.profileImgStorage).toBeUndefined();
  });
});

describe("교사도 남의 학급에는 실행할 수 없다", () => {
  it("아이템 등록, 포인트 지급, 온도계 설정이 모두 거부되고 문서가 새로 생기지 않는다", async () => {
    await seedStudent(mongo.db, other, { userId: "outsider", money: 0 });
    asTeacher(scope);

    expect((await createItem({ classId: other.classId, itemName: "a", itemPrice: 1, itemStock: 1 })).result).toBe(false);
    expect((await handlePoint({ classId: other.classId, targetStudent: [{ userId: "outsider" }], point: 10, isSend: true })).success).toBe(false);
    expect((await updateThermometerSetting({ classId: other.classId, rewardObj: {}, requireCurrency: 10 })).result).toBe(false);

    expect((await getStudent(mongo.db, "outsider")).money).toBe(0);
    expect(await count("thermometer")).toBe(0);
  });

  it("자기 학급에는 정상적으로 실행된다", async () => {
    asTeacher(scope);
    const res = await createItem({ classId: scope.classId, itemName: "사탕", itemPrice: "100", itemStock: "3" });
    expect(res.result).toBe(true);
    const settings = await updateThermometerSetting({ classId: scope.classId, rewardObj: { 10: "간식" }, requireCurrency: "20" });
    expect(settings.result).toBe(true);
    const t = await mongo.db.collection("thermometer").findOne({ classId: scope.classObjectId });
    expect(t.requireCurrency).toBe(20);
  });

  it("온도계 1도당 쿠키 수가 0이거나 숫자가 아니면 거부", async () => {
    asTeacher(scope);
    for (const v of [0, "0", "abc", -5, 1.5]) {
      expect((await updateThermometerSetting({ classId: scope.classId, rewardObj: {}, requireCurrency: v })).result).toBe(false);
    }
    expect(await count("thermometer")).toBe(0);
  });
});

describe("프로필 사진/칭호 선택", () => {
  const URL_ID = new ObjectId().toHexString();
  const OWNED = "https://example.com/owned.png";

  async function seedS1() {
    await seedStudent(mongo.db, scope, {
      userId: "s1",
      profileUrl: "https://example.com/default.png",
      profileImgStorage: { [URL_ID]: OWNED },
      titles: [{ id: new ObjectId(), title: "독서왕" }],
      profileTitle: "초보 오렌지",
    });
    await seedStudent(mongo.db, scope, { userId: "s2", profileUrl: "https://example.com/s2.png", titles: [] });
  }

  it("학생은 구입한 이미지만 고를 수 있다", async () => {
    await seedS1();
    asStudent("s1");
    expect((await selectProfileImg({ url: OWNED })).result).toBe(true);
    expect((await getStudent(mongo.db, "s1")).profileUrl).toBe(OWNED);

    const res = await selectProfileImg({ url: "https://evil.com/not-owned.png" });
    expect(res.result).toBe(false);
    expect((await getStudent(mongo.db, "s1")).profileUrl).toBe(OWNED);
  });

  it("학생은 받은 칭호만 고를 수 있다", async () => {
    await seedS1();
    asStudent("s1");
    expect((await selectProfileTitle({ profileTitle: "독서왕" })).result).toBe(true);
    expect((await selectProfileTitle({ profileTitle: "전설의 용사" })).result).toBe(false);
    expect((await getStudent(mongo.db, "s1")).profileTitle).toBe("독서왕");
  });

  it("학생은 다른 친구의 사진/칭호를 바꿀 수 없다 (userId 파라미터 무시)", async () => {
    await seedS1();
    asStudent("s1");
    await selectProfileTitle({ userId: "s2", classId: scope.classId, profileTitle: "독서왕" });
    const s2 = await getStudent(mongo.db, "s2");
    expect(s2.profileUrl).toBe("https://example.com/s2.png");
    expect(s2.profileTitle).toBeUndefined();
  });
});
