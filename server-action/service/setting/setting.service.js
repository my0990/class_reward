import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { compare, hash } from "bcryptjs";
import { checkNewStudentPassword } from "@/lib/auth/studentPassword";
import { cleanNickname, cleanState, NICKNAME_MAX, STATE_MAX } from "@/server-action/service/account/studentProfile.service";

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

  // 별명·상태 메시지 길이 제한 (선생님이 학생 관리에서 고칠 때와 같은 규칙)
  const nickname = cleanNickname(profileNickname);
  const state = cleanState(profileState);
  if (!nickname) throw new Error("별명을 입력해 주세요.");
  if (nickname.length > NICKNAME_MAX) throw new Error(`별명은 ${NICKNAME_MAX}자까지 쓸 수 있어요.`);
  if (state.length > STATE_MAX) throw new Error(`상태 메시지는 ${STATE_MAX}자까지 쓸 수 있어요.`);

  const db = (await connectDB).db("data");
  const db2 = (await connectDB).db("user");

  const user_res = await db2.collection("users").findOne(filter);
  if (!user_res) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  await db.collection("user_data").updateOne(
    { userId: role === "teacher" ? email : userId, role },
    { $set: { profileNickname: nickname, profileState: state } },
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
  // mustChangePassword: 관리자 임시 비밀번호 상태였다면 해제
  await db.collection("users").updateOne(filter, { $set, $unset: { password: "", mustChangePassword: "" } });

  return { result: true, message: "비밀번호 변경 성공" };
}
