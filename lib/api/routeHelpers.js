// app/api 라우트 공용 헬퍼
//
// 모든 라우트가 반복하던 "세션 확인 → 교사 id 결정 → ObjectId 변환 → 에러 응답"을 한 곳에 모았다.
//
//   export const GET = withApiHandler(async (req, { params }) => {
//     const { teacherObjectId } = await requireTeacher();
//     const classObjectId = parseObjectId((await params).id, "classId");
//     ...
//     return NextResponse.json(data);
//   });
//
// 에러는 ApiError를 던지면 { error: 메시지 } + 해당 status로 응답된다.
// (hooks/useFetchData의 fetcher가 body.error를 읽어서 화면에 보여준다.)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdminSessionUser } from "@/lib/auth/adminAuth";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** 24자리 hex 문자열만 ObjectId로 바꾼다. 아니면 400. */
export function parseObjectId(value, name = "id") {
  if (typeof value !== "string" || !/^[0-9a-f]{24}$/i.test(value)) {
    throw new ApiError(400, `잘못된 ${name}입니다.`);
  }
  return ObjectId.createFromHexString(value);
}

/** 로그인만 확인한다. */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id || !session.user.role) {
    throw new ApiError(401, "로그인이 필요합니다.");
  }
  return session;
}

/** 교사만 통과. teacherObjectId는 로그인한 교사 본인의 id. */
export async function requireTeacher() {
  const session = await requireSession();
  if (session.user.role !== "teacher") {
    throw new ApiError(403, "교사만 사용할 수 있습니다.");
  }
  return {
    session,
    teacher_id: session.user._id,
    teacherObjectId: parseObjectId(session.user._id, "세션"),
  };
}

/** 관리자만 통과 (role=admin + ADMIN_EMAILS에 있는 이메일 + 세션 12시간 이내) */
export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdminSessionUser(session.user)) {
    throw new ApiError(403, "관리자만 사용할 수 있습니다.");
  }
  return { session, adminEmail: session.user.email };
}

/**
 * 교사 또는 학생 통과.
 * - teacherObjectId: 교사면 본인 id, 학생이면 담임 교사 id
 * - classId를 넘기면, 학생은 자기 학급일 때만 통과한다 (다른 반 데이터 조회 차단).
 *   교사는 쿼리에서 teacher_id로 소유권이 걸러진다.
 */
export async function requireMember({ classId } = {}) {
  const session = await requireSession();
  const { role } = session.user;

  if (role === "teacher") {
    return {
      session,
      role,
      teacherObjectId: parseObjectId(session.user._id, "세션"),
    };
  }

  if (role === "student") {
    const teacherObjectId = parseObjectId(session.user.teacher_id, "세션");
    if (classId !== undefined && String(session.user.classId) !== String(classId)) {
      throw new ApiError(403, "우리 학급 정보만 볼 수 있습니다.");
    }
    return { session, role, teacherObjectId };
  }

  throw new ApiError(403, "권한이 없습니다.");
}

/** 학급이 존재하고 휴지통에 있지 않은지 확인 (없거나 삭제됐으면 404) */
export async function requireActiveClass(teacherObjectId, classObjectId) {
  const { connectDB } = await import("@/lib/mongodb");
  const db = (await connectDB).db("data");
  const cls = await db
    .collection("classes")
    .findOne({ _id: classObjectId, teacher_id: teacherObjectId }, { projection: { deletedAt: 1 } });
  if (!cls || cls.deletedAt) {
    throw new ApiError(404, cls ? "삭제된 학급입니다." : "학급 정보를 찾을 수 없습니다.");
  }
}

/** 라우트 핸들러를 감싸서 ApiError는 해당 status로, 그 외 에러는 500으로 응답한다. */
export function withApiHandler(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      console.error(`[api] ${req?.method ?? ""} ${req?.url ?? ""}`, error);
      return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
  };
}

/** 쿼리스트링 숫자 파싱: 숫자가 아니면 기본값, 범위를 벗어나면 잘라낸다. */
export function parseIntParam(value, { defaultValue, min, max }) {
  const n = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(n)) return defaultValue;
  return Math.min(max, Math.max(min, n));
}
