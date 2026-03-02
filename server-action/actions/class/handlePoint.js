"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { handlePointService } from "@/server-action/service/class/handlePointService";
export async function handlePoint({ classId, targetStudent, point, isSend }) {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;
    console.log(targetStudent)
    if (!teacher_id) {
        return { success: false, message: "unauthorized" };
    }

    try {
        // ✅ teacher_idId를 서비스로 넘겨서 권한/검증 확장 가능
        const res = await handlePointService({
            classId,
            teacher_id: teacher_id,
            targetStudent,
            point,
            isSend,
        });

        return res; // { success: true/false, data/message }
    } catch (err) {
        // 너 스타일대로면 throw 해도 되고, 안전하게 success false로 내려도 됨.
        throw new Error(err?.message || "handlePoint failed");
    }
}