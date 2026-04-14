'use server'
import { updateThermometerSettingService } from "@/server-action/service/thermometer/thermometer.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function updateThermometerSetting({rewardObj, requireCurrency, classId }) {
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