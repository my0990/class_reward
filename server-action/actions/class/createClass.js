'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClassService } from "@/server-action/service/class/createClassService";

export async function createClass({className}) {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;

    if (!teacher_id) {
        return { success: false, message: "unauthorized" };
    }


    try {
        const newClass = await createClassService({
            className,
            teacher_id: teacher_id,

        });
        return { success: true, data: newClass };
    } catch (err) {
        throw new Error(err.message)

    }
}