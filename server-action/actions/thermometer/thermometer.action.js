'use server'
import { updateThermometerSettingService } from "@/server-action/service/thermometer/thermometer.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateManualDegreeService, donateCookieService } from "@/server-action/service/thermometer/thermometer.service";

export async function updateThermometerSetting({ rewardObj, requireCurrency, classId }) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;


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



export async function donate({ userId, amount, money, classId, degree }) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;
    if (!session) {
      return {
        result: false,
        message: "로그인이 필요합니다.",
      };
    }



    const result = await donateCookieService({
      userId,
      amount,
      money,
      teacher_id,
      classId,
      degree
    });

    return result;
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