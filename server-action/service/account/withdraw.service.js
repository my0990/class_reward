// 교사 회원 탈퇴 — 즉시 영구 삭제
//
// 순서 (중간에 실패해도 다시 실행하면 이어서 지워지도록):
// 1) 확인 문구 + 현재 비밀번호 확인
// 2) 교사와 그 학생들의 로그인 계정에 disabled 표시 → 바로 로그인 불가 (로그인 중이면 최대 5분 안에 로그아웃)
// 3) 학급마다 purgeClassService로 학급 데이터 전부 삭제 (휴지통 학급 포함)
// 4) 학급에 묶이지 않고 남은 교사 데이터 정리 (teacher_id 기준)
// 5) 교사 본인 데이터(user_data, 이메일 인증 기록) → 마지막으로 로그인 계정 삭제
// 6) 관리자 기록에는 "탈퇴 1건"만 남긴다 (이메일 등 개인정보 없음)
import { ObjectId } from "mongodb";
import { compare } from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { purgeClassService } from "@/server-action/service/class/deleteClass.service";

export const WITHDRAW_CONFIRM_TEXT = "탈퇴합니다";

function toOid(teacher_id) {
  try {
    return ObjectId.createFromHexString(teacher_id);
  } catch {
    throw new Error("잘못된 계정 정보입니다.");
  }
}

/** 확인 창에 보여줄 개수: 학급(휴지통 포함), 학생 계정 */
export async function getWithdrawSummaryService({ teacher_id }) {
  const teacherOid = toOid(teacher_id);
  const client = await connectDB;
  const [classes, students] = await Promise.all([
    client.db("data").collection("classes").countDocuments({ teacher_id: teacherOid }),
    client.db("user").collection("users").countDocuments({ teacher_id: teacherOid, role: "student" }),
  ]);
  return { classes, students };
}

/** @returns {{ ok: true, removed: object } | { ok: false, message: string }} */
export async function withdrawTeacherService({ teacher_id, password, confirmText, now = new Date() }) {
  if (String(confirmText ?? "").trim() !== WITHDRAW_CONFIRM_TEXT) {
    return { ok: false, message: `확인을 위해 '${WITHDRAW_CONFIRM_TEXT}'를 정확히 입력해주세요.` };
  }
  if (!password) return { ok: false, message: "현재 비밀번호를 입력해주세요." };

  const teacherOid = toOid(teacher_id);
  const client = await connectDB;
  const data = client.db("data");
  const userDb = client.db("user");

  const teacher = await userDb.collection("users").findOne({ _id: teacherOid, role: "teacher" });
  if (!teacher) return { ok: false, message: "계정을 찾을 수 없습니다." };

  const hashed = teacher.passwordHash ?? teacher.password;
  if (!hashed || !(await compare(String(password), hashed))) {
    return { ok: false, message: "비밀번호가 일치하지 않습니다." };
  }

  // 2) 로그인 차단
  await userDb
    .collection("users")
    .updateMany(
      { $or: [{ _id: teacherOid }, { teacher_id: teacherOid, role: "student" }] },
      { $set: { disabled: true, disabledReason: "teacherWithdrawn", disabledAt: now } }
    );

  // 3) 학급 단위 영구 삭제
  const classes = await data.collection("classes").find({ teacher_id: teacherOid }, { projection: { _id: 1 } }).toArray();
  for (const c of classes) {
    await purgeClassService({ teacherObjectId: teacherOid, classObjectId: c._id });
  }

  // 4) 학급 문서 없이 남아 있던 데이터 (예전 데이터 등)
  const byTeacher = { teacher_id: teacherOid };
  const leftovers = {};
  for (const name of ["user_data", "history", "quest", "thermometer", "class_data", "classes"]) {
    leftovers[name] = (await data.collection(name).deleteMany(byTeacher)).deletedCount;
  }
  leftovers.studentUsers = (await userDb.collection("users").deleteMany({ ...byTeacher, role: "student" })).deletedCount;
  leftovers.kiosk = (await userDb.collection("kiosk_pwd_attempts").deleteMany(byTeacher)).deletedCount;

  // 5) 교사 본인 데이터 (교사 user_data는 userId = 이메일로 저장되어 있다)
  const email = teacher.email;
  if (email) {
    await data.collection("user_data").deleteMany({ userId: email, role: "teacher" });
    await userDb.collection("email_verifications").deleteMany({ email });
    await userDb.collection("email_send_log").deleteMany({ email });
  }
  await userDb.collection("users").deleteOne({ _id: teacherOid });

  // 6) 개수만 기록
  try {
    await client.db("admins").collection("audit_log").insertOne({
      at: now,
      adminEmail: null,
      action: "teacher_withdraw",
      target: null,
      detail: `학급 ${classes.length}개`,
    });
  } catch (err) {
    console.error("[withdraw audit]", err);
  }

  return { ok: true, removed: { classes: classes.length, leftovers } };
}
