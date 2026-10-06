// 화면 테스트용 데이터 (메모리 DB에만 넣는다)
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export const E2E = {
  teacher: { email: "e2e-teacher@test.com", password: "teacher-pass-1" },
  classId: "64b000000000000000000001",
  teacherId: "64b000000000000000000002",
  className: "테스트반",
  item: { itemId: "item-candy", itemName: "사탕", itemPrice: 100, itemStock: 5, emoji: "🍬", itemExplanation: "달콤한 사탕" },
  // 1번: 처음 비밀번호(키오스크 테스트), 2번: 이미 바꾼 비밀번호·잔액 부족, 3번: 처음 비밀번호(학생 로그인 테스트)
  students: [
    { userId: "테스트반1", password: "12345678", money: 500, classNumber: 1, profileNickname: "용감한 고양이" },
    { userId: "테스트반2", password: "2580", money: 50, classNumber: 2, profileNickname: "느긋한 거북이" },
    { userId: "테스트반3", password: "12345678", money: 0, classNumber: 3, profileNickname: "졸린 판다" },
  ],
};

export async function seed(client) {
  const data = client.db("data");
  const user = client.db("user");
  const teacher_id = ObjectId.createFromHexString(E2E.teacherId);
  const classId = ObjectId.createFromHexString(E2E.classId);
  const hash = (p) => bcrypt.hash(p, 4);
  const now = new Date();

  await user.collection("users").insertOne({ _id: teacher_id, role: "teacher", email: E2E.teacher.email, passwordHash: await hash(E2E.teacher.password), createdAt: now });
  await data.collection("user_data").insertOne({ userId: E2E.teacher.email, role: "teacher", money: 0, profileNickname: "", profileState: "", profileUrl: "/favicon.ico" });
  await data.collection("classes").insertOne({ _id: classId, teacher_id, className: E2E.className, uniqueNickname: "테스트반" });
  await data.collection("class_data").insertOne({
    classId,
    teacher_id,
    className: E2E.className,
    itemList: [E2E.item],
    expTable: { startExp: 100, commonDifference: 10 },
    currencyEmoji: "🍪",
    currencyName: "쿠키",
    studentAccounts: { 1: "생성됨", 2: "생성됨", 3: "생성됨" },
    createdAt: now,
  });
  await data.collection("thermometer").insertOne({ teacher_id, classId, requireCurrency: 100, reward: {}, donators: {}, manualDegree: 0 });

  for (const s of E2E.students) {
    await user.collection("users").insertOne({ userId: s.userId, role: "student", teacher_id, classId, passwordHash: await hash(s.password) });
    await data.collection("user_data").insertOne({
      userId: s.userId,
      role: "student",
      teacher_id,
      classId,
      classNumber: s.classNumber,
      money: s.money,
      exp: 0,
      itemList: [],
      inventory: [],
      titles: [],
      profileNickname: s.profileNickname,
      profileState: "",
      profileTitle: "초보 오렌지",
      profileUrl: "/favicon.ico",
      profileImgStorage: {},
    });
  }
}
