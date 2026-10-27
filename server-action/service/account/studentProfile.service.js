// 선생님이 학생 관리에서 학생의 별명·자기소개를 고친다 (이 선생님·이 학급 학생만)
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

export const NICKNAME_MAX = 20;
export const STATE_MAX = 200;
const fail = (message) => ({ ok: false, message });

/** 별명: 줄바꿈·연속 공백은 한 칸, 앞뒤 공백 제거. 비면 안 됨 */
export function cleanNickname(v) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}
/** 자기소개: 줄바꿈은 그대로, 앞뒤 공백만 제거 (비워도 됨) */
export function cleanState(v) {
  return String(v ?? "").replace(/\r\n?/g, "\n").trim();
}

export async function updateStudentProfileByTeacherService({ teacher_id, classId, userId, profileNickname, profileState }) {
  let scope;
  try {
    scope = { teacher_id: ObjectId.createFromHexString(String(teacher_id)), classId: ObjectId.createFromHexString(String(classId)) };
  } catch {
    return fail("잘못된 학급 정보입니다.");
  }
  if (!userId) return fail("학생을 찾을 수 없습니다.");

  const set = {};
  if (profileNickname !== undefined) {
    const n = cleanNickname(profileNickname);
    if (!n) return fail("별명을 입력해 주세요.");
    if (n.length > NICKNAME_MAX) return fail(`별명은 ${NICKNAME_MAX}자까지 쓸 수 있어요.`);
    set.profileNickname = n;
  }
  if (profileState !== undefined) {
    const s = cleanState(profileState);
    if (s.length > STATE_MAX) return fail(`자기소개는 ${STATE_MAX}자까지 쓸 수 있어요.`);
    set.profileState = s;
  }
  if (Object.keys(set).length === 0) return fail("바꿀 내용이 없습니다.");

  const db = (await connectDB).db("data");
  const r = await db.collection("user_data").updateOne({ ...scope, role: "student", userId: String(userId) }, { $set: set });
  if (r.matchedCount === 0) return fail("학생을 찾을 수 없습니다.");
  return { ok: true, data: set };
}
