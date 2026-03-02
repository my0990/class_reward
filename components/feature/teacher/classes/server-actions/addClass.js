'use server'

import { createClass } from "@/lib/services/classService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function addClass(formData) {
    const session = await getServerSession(authOptions);
    const teacher = session?.user?.userId ?? null;

    if (!teacher) {
        return { success: false, message: "unauthorized" };
    }

    const className = formData.get("className");

    try {
        const newClass = await createClass({
            className,
            teacherId: teacher,

        });
        return { success: true, data: newClass };
    } catch {
        return { success: false, message: "학급 생성 실패" };
    }
}