// 학생 돈/아이템을 움직이는 server action(구매·아이템 사용·기부)이 "누구의" 돈을 움직일지 정한다.
//
// - 학생 로그인: 세션에 있는 본인 정보만 쓴다. 파라미터로 온 userId/classId는 무시한다.
// - 교사 로그인(키오스크): 파라미터의 userId/classId를 쓰되, 그 학생이 비밀번호를 맞혀서
//   받은 키오스크 토큰(lib/auth/kioskToken)이 있어야 한다.
import { verifyKioskToken } from "@/lib/auth/kioskToken";

export class StudentTargetError extends Error {}

export function resolveStudentTarget(session, { userId, classId, kioskToken } = {}) {
  const user = session?.user;

  if (user?.role === "student" && user.mustChangePassword) {
    throw new StudentTargetError("먼저 비밀번호를 바꿔주세요.");
  }

  if (user?.role === "student" && user.userId && user.classId && user.teacher_id) {
    return { teacher_id: user.teacher_id, classId: user.classId, userId: user.userId };
  }

  if (user?.role === "teacher" && user._id) {
    if (!userId || !classId) {
      throw new StudentTargetError("잘못된 요청입니다.");
    }
    if (!verifyKioskToken(kioskToken, { teacher_id: user._id, classId, userId })) {
      throw new StudentTargetError("학생 비밀번호 확인이 필요합니다. 처음부터 다시 진행해주세요.");
    }
    return { teacher_id: user._id, classId, userId };
  }

  throw new StudentTargetError("로그인이 필요합니다.");
}
