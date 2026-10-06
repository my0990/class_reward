import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { compare, hash } from "bcryptjs";
import { checkNewStudentPassword } from "@/lib/auth/studentPassword";

function toAccountFilter({ _id, email, userId, role }) {
  if (!_id) {
    throw new Error("로그인이 필요합니다.");
  }

  let objectId;
  try {
    objectId = ObjectId.createFromHexString(_id);
  } catch {
    throw new Error("잘못된 사용자 정보입니다.");
  }

  return role === "teacher"
    ? { email, _id: objectId }
    : { userId, _id: objectId };
}

export async function updateProfileService({
  _id,
  email,
  userId,
  role,
  profileNickname,
  profileState,
}) {
  const filter = toAccountFilter({ _id, email, userId, role });

  const db = (await connectDB).db("data");
  const db2 = (await connectDB).db("user");

  const user_res = await db2.collection("users").findOne(filter);
  if (!user_res) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  await db.collection("user_data").updateOne(
    { userId: role === "teacher" ? email : userId, role },
    { $set: { profileNickname, profileState } },
    { upsert: true }
  );

  return { result: true, message: "profile 변경 성공" };
}

export async function updatePasswordService({
  _id,
  email,
  userId,
  role,
  currentPassword,
  nextPassword,
}) {
  const filter = toAccountFilter({ _id, email, userId, role });

  if (!currentPassword || !nextPassword) {
    throw new Error("비밀번호를 모두 입력해주세요.");
  }

  const db = (await connectDB).db("user");
  const user = await db.collection("users").findOne(filter);

  if (!user) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const hashed = user.passwordHash ?? user.password;
  if (!hashed) {
    throw new Error("비밀번호 정보를 찾을 수 없습니다.");
  }

  const isCorrectPassword = await compare(currentPassword, hashed);
  if (!isCorrectPassword) {
    throw new Error("비밀번호가 일치하지 않습니다.");
  }

  if (role === "teacher" && String(nextPassword).length < 8) {
    throw new Error("비밀번호는 8자 이상 입력해주세요.");
  }
  if (role === "student") {
    const problem = checkNewStudentPassword(nextPassword, userId);
    if (problem) throw new Error(problem);
  }

  const newPasswordHash = await hash(nextPassword, 12);
  // 교사는 비밀번호를 바꾸면 다른 기기의 로그인도 끝낸다 (passwordChangedAt 이후 세션 무효)
  const $set = role === "teacher" ? { passwordHash: newPasswordHash, passwordChangedAt: new Date() } : { passwordHash: newPasswordHash };
  await db.collection("users").updateOne(filter, { $set, $unset: { password: "" } });

  return { result: true, message: "비밀번호 변경 성공" };
}
