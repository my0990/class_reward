"use server";
import { authorizeTeacherClass, getTeacherId } from "@/lib/auth/actionAuth";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { handlePointService } from "@/server-action/service/class/handlePointService";
export async function handlePoint({ classId, targetStudent, point, isSend }) {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) {
        return { success: false, message: auth.message };
    }
    const teacher_id = auth.teacher_id;

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