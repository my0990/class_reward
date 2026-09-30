'use server'
import { updateThermometerSettingService } from "@/server-action/service/thermometer/thermometer.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resolveStudentTarget, StudentTargetError } from "@/lib/auth/studentTarget";
import { updateManualDegreeService, donateCookieService } from "@/server-action/service/thermometer/thermometer.service";

export async function updateThermometerSetting({ rewardObj, requireCurrency, classId }) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;

    if (!teacher_id) {
      return {
        result: false,
        message: "로그인이 필요합니다.",
      };
    }

    const response = await updateThermometerSettingService({
      teacher_id: teacher_id,
      classId,
      rewardObj,
      requireCurrency
    });


    return {
      result: true,
      message: "학급온도계 설정 수정 완료",
      data: response,
    };
  } catch (error) {
    console.error("error:", error);

    return {
      result: false,
      message: error.message || "학급온도계 설정 수정 실패",
    };
  }
}



// 키오스크(교사 로그인)에서는 학생 비밀번호 확인 후 받은 kioskToken이 필요하다.
// 학생 로그인이면 본인 쿠키만 기부된다.
export async function donate({ userId, amount, classId, kioskToken }) {
  try {
    const session = await getServerSession(authOptions);

    let target;
    try {
      target = resolveStudentTarget(session, { userId, classId, kioskToken });
    } catch (error) {
      if (error instanceof StudentTargetError) return { result: false, message: error.message };
      throw error;
    }

    return await donateCookieService({ ...target, amount });
  } catch (error) {
    console.error("donateCookieAction error:", error);

    return {
      result: false,
      message: error.message || "기부 처리 중 오류가 발생했습니다.",
    };
  }
}


export async function updateManualDegree({ classId, degreeChange, type }) {

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        result: false,
        message: "로그인이 필요합니다.",
      };
    }

    const teacher_id = session?.user?._id ?? null;

    const result = await updateManualDegreeService({
      teacher_id,
      classId,
      degreeChange,
      type
    });

    return {
      result: true,
      message: "수동 온도 수정 완료",
      data: result,
    };
  } catch (error) {
    console.error("updateManualDegreeAction error:", error);

    return {
      result: false,
      message: error.message || "수동 온도 수정 실패",
    };
  }
}