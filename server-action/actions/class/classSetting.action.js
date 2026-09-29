"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateCurrencyNameService } from "@/server-action/service/class/classSetting.service";

export async function updateCurrencyName({ classId, currencyName, currencyEmoji }) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;

    if (!teacher_id) {
      return { result: false, message: "로그인이 필요합니다." };
    }

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
