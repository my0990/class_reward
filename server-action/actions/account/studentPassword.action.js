"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyKioskToken } from "@/lib/auth/kioskToken";
import { changeDefaultStudentPasswordService } from "@/server-action/service/account/studentPassword.service";

const fail = (message) => ({ result: false, message });

/** 학생 본인: 첫 로그인(기본 비밀번호) 때 새 비밀번호 정하기 */
export async function changeMyDefaultPassword({ newPassword }) {
  try {
    const user = (await getServerSession(authOptions))?.user;
    if (user?.role !== "student" || !user.userId || !user.teacher_id) return fail("학생 계정으로 로그인해야 합니다.");
    const res = await changeDefaultStudentPasswordService({ teacher_id: user.teacher_id, userId: user.userId, newPassword });
    return res.ok ? { result: true, message: "비밀번호를 바꿨어요." } : fail(res.message);
  } catch (error) {
    console.error("changeMyDefaultPassword error:", error);
    return fail("비밀번호를 바꾸지 못했어요. 다시 시도해주세요.");
  }
}

/** 키오스크: 기본 비밀번호를 맞힌 학생이 새 비밀번호 정하기 (비밀번호 확인 토큰 필요) */
export async function changeKioskStudentPassword({ classId, userId, kioskToken, newPassword }) {
  try {
    const user = (await getServerSession(authOptions))?.user;
    if (user?.role !== "teacher" || !user._id) return fail("로그인이 필요합니다.");
    if (!verifyKioskToken(kioskToken, { teacher_id: user._id, classId, userId })) {
      return fail("시간이 지났어요. 처음부터 다시 해주세요.");
    }
    const res = await changeDefaultStudentPasswordService({ teacher_id: user._id, userId, newPassword });
    return res.ok ? { result: true, message: "비밀번호를 바꿨어요." } : fail(res.message);
  } catch (error) {
    console.error("changeKioskStudentPassword error:", error);
    return fail("비밀번호를 바꾸지 못했어요. 다시 시도해주세요.");
  }
}
