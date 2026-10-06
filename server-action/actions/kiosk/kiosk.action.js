"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyStudentPasswordService } from "@/server-action/service/kiosk/kioskAuth.service";
import { createKioskToken } from "@/lib/auth/kioskToken";

// 키오스크(교사 로그인 기기)에서 학생 비밀번호를 확인하고, 맞으면 결제 토큰을 발급한다.
// 이 토큰이 있어야 buyItem / useItem / donate가 그 학생 대신 처리된다.
export async function checkKioskPassword({ userId, userPwd }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "teacher" || !session.user._id) {
      return { result: false, message: "로그인이 필요합니다." };
    }

    const res = await verifyStudentPasswordService({
      teacher_id: session.user._id,
      userId,
      userPwd,
    });

    if (!res.ok || !res.classId) {
      return { result: false, message: res.message || "비밀번호를 확인해주세요." };
    }

    return {
      result: true,
      kioskToken: createKioskToken({ teacher_id: session.user._id, classId: res.classId, userId }),
      classId: res.classId,
      // true면 결제로 넘어가기 전에 새 비밀번호를 정한다 (changeKioskStudentPassword)
      mustChangePassword: Boolean(res.mustChangePassword),
    };
  } catch (error) {
    console.error("checkKioskPassword error:", error);
    return { result: false, message: "비밀번호 확인 중 오류가 발생했습니다." };
  }
}
