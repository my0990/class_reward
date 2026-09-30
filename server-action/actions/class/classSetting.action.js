"use server";
import { authorizeTeacherClass, getTeacherId } from "@/lib/auth/actionAuth";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateCurrencyNameService } from "@/server-action/service/class/classSetting.service";

export async function updateCurrencyName({ classId, currencyName, currencyEmoji }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };
    const teacher_id = auth.teacher_id;

    return await updateCurrencyNameService({
      teacher_id,
      classId,
      currencyName,
      currencyEmoji,
    });
  } catch (error) {
    console.error("updateCurrencyName error:", error);

    return {
      result: false,
      message: error.message || "화폐 설정 변경에 실패했습니다.",
    };
  }
}
