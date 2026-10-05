// server action 공용 권한 검사
//
// 예전에는 대부분의 교사용 action이 "로그인했는지"만 보고 session.user._id를 교사 id로 썼다.
// 학생이 호출하면 학생 자신의 id가 교사 id 자리에 들어갔고, id가 안 맞아서 우연히 막히고 있었다.
// upsert를 쓰는 서비스(온도계 설정, 계정 생성, 프로필 이미지 등록 등)는 엉뚱한 문서를 만들 수도 있었다.
//
// 이제 교사용 action은 아래 둘 중 하나로 시작한다.
//   const teacher_id = await getTeacherId();                 // 학급과 무관한 작업 (학급 생성)
//   const auth = await authorizeTeacherClass(classId);       // 학급 작업: 교사 + 내 학급인지 확인
//   if (!auth.ok) return { result: false, message: auth.message };
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { isAdminSessionUser } from "@/lib/auth/adminAuth";

export const NOT_TEACHER_MESSAGE = "교사 계정으로 로그인해야 합니다.";
export const NOT_OWNER_MESSAGE = "학급 정보를 찾을 수 없거나 권한이 없습니다.";

const HEX24 = /^[0-9a-f]{24}$/i;

export const NOT_ADMIN_MESSAGE = "관리자 계정으로 로그인해야 합니다.";

/** 관리자 세션이면 관리자 이메일, 아니면 null (관리자용 server action과 페이지에서 사용) */
export async function getAdminEmail() {
  const session = await getServerSession(authOptions);
  return isAdminSessionUser(session?.user) ? session.user.email : null;
}

/**
 * 관리자 페이지용: 관리자가 아니면 /admin/login으로 보낸다.
 * layout은 페이지 간 이동 때 다시 실행되지 않을 수 있어서, 페이지마다 따로 부른다.
 */
export async function requireAdminPage() {
  const email = await getAdminEmail();
  if (!email) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  return email;
}

/** 교사 세션이면 교사 id(hex 문자열), 아니면 null */
export async function getTeacherId() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (user?.role !== "teacher" || typeof user._id !== "string" || !HEX24.test(user._id)) {
    return null;
  }
  return user._id;
}

/**
 * 교사 세션이고, classId가 그 교사가 만든 학급일 때만 ok
 * 휴지통에 있는(삭제된) 학급은 거부한다. 복구할 때만 includeDeleted: true.
 */
export async function authorizeTeacherClass(classId, { includeDeleted = false } = {}) {
  const teacher_id = await getTeacherId();
  if (!teacher_id) {
    return { ok: false, message: NOT_TEACHER_MESSAGE };
  }

  if (typeof classId !== "string" || !HEX24.test(classId)) {
    return { ok: false, message: NOT_OWNER_MESSAGE };
  }

  const db = (await connectDB).db("data");
  const owned = await db.collection("classes").countDocuments(
    {
      _id: ObjectId.createFromHexString(classId),
      teacher_id: ObjectId.createFromHexString(teacher_id),
      ...(includeDeleted ? {} : { deletedAt: { $exists: false } }),
    },
    { limit: 1 }
  );

  if (!owned) {
    return { ok: false, message: NOT_OWNER_MESSAGE };
  }

  return { ok: true, teacher_id };
}
