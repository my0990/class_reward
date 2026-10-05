'use server'
import { authorizeTeacherClass, getTeacherId } from "@/lib/auth/actionAuth";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClassService } from "@/server-action/service/class/createClassService";

export async function createClass({className}) {
    const teacher_id = await getTeacherId();

    if (!teacher_id) {
        return { result: false, message: "교사 계정으로 로그인해야 합니다." };
    }


    try {
        const newClass = await createClassService({
            className,
            teacher_id: teacher_id,

        });
        return { result: true, message: "학급을 만들었습니다.", data: newClass };
    } catch (err) {
        return { result: false, message: err?.message || "학급 생성에 실패했습니다." };

    }
}