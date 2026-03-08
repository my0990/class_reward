import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * 공통 스코프 필터 생성:
 * - teacher_id: 세션에서 가져와 ObjectId로
 * - classId: body/query에서 가져와 ObjectId로 (optional)
 *
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @param {{ classId?: string, classIdRequired?: boolean }} options
 */
export async function buildFilter(req, res, options = {}) {
  const { classId, classIdRequired = true } = options;

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?._id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  let teacherObjectId;
  try {
    teacherObjectId = ObjectId.createFromHexString(session.user._id);
  } catch {
    const err = new Error("Invalid teacher_id in session");
    err.status = 400;
    throw err;
  }

  // classId는 body → query 순으로 찾되, options.classId가 있으면 그걸 우선 사용
  const rawClassId =
    classId ?? req.body?.classId ?? req.query?.classId ?? null;

  if (!rawClassId) {
    if (classIdRequired) {
      const err = new Error("classId required");
      err.status = 400;
      throw err;
    }
    return { teacher_id: teacherObjectId };
  }

  let classObjectId;
  try {
    classObjectId = ObjectId.createFromHexString(rawClassId);
  } catch {
    const err = new Error("Invalid classId");
    err.status = 400;
    throw err;
  }

  return {
    teacher_id: teacherObjectId,
    classId: classObjectId,
  };
}