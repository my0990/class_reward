"use server";

import { bumpFeature } from "@/lib/stats/featureUsage";
import { logError } from "@/lib/errorLog/errorLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyStudentPasswordService } from "@/server-action/service/kiosk/kioskAuth.service";
import { createKioskToken } from "@/lib/auth/kioskToken";
import { bumpDailyUsage } from "@/lib/stats/dailyUsage";
import { isKioskUser } from "@/lib/auth/kioskSession";
import { findActiveKioskDeviceService } from "@/server-action/service/kiosk/kioskDevice.service";

// 키오스크(교사 로그인 기기 또는 키오스크로 연결된 기기)에서 학생 비밀번호를 확인하고, 맞으면 결제 토큰을 발급한다.
// 이 토큰이 있어야 buyItem / useItem / donate가 그 학생 대신 처리된다.
export async function checkKioskPassword({ userId, userPwd }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    let teacher_id;
    if (user?.role === "teacher" && user._id) {
      teacher_id = user._id;
    } else if (isKioskUser(user)) {
      // 연결된 기기: 결제를 시작할 때마다 연결이 살아 있는지 확인 (끊으면 바로 막힘)
      if (!(await findActiveKioskDeviceService(user._id))) {
        return { result: false, message: "이 기기의 키오스크 연결이 끊겼어요. 선생님께 말씀해 주세요." };
      }
      teacher_id = user.teacher_id;
    } else {
      return { result: false, message: "로그인이 필요합니다." };
    }

    const res = await verifyStudentPasswordService({ teacher_id, userId, userPwd });

    if (!res.ok || !res.classId) {
      return { result: false, message: res.message || "비밀번호를 확인해주세요." };
    }
    // 연결된 기기는 그 반 학생만
    if (isKioskUser(user) && String(res.classId) !== String(user.classId)) {
      return { result: false, message: "우리 반 학생만 쓸 수 있어요." };
    }

    await bumpDailyUsage("kiosk"); // 관리자 대시보드: 일별 키오스크 사용 수
    bumpFeature("kiosk_login", { classId: res.classId });

    return {
      result: true,
      kioskToken: createKioskToken({ teacher_id, classId: res.classId, userId }),
      classId: res.classId,
      // true면 결제로 넘어가기 전에 새 비밀번호를 정한다 (changeKioskStudentPassword)
      mustChangePassword: Boolean(res.mustChangePassword),
    };
  } catch (error) {
    logError("checkKioskPassword error:", error);
    return { result: false, message: "비밀번호 확인 중 오류가 발생했습니다." };
  }
}
