'use server'
import { createStudentAccountService, deleteStudentAccountService, resetPwdService } from "@/server-action/service/account/account.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function createStudentAccount({
  accountArr,
  updatedStudentArr,
  uniqueNickname,
  classId,
}) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;

    if (!Array.isArray(accountArr) || accountArr.length === 0) {
      throw new Error("생성할 계정을 선택해주세요.");
    }

    const response = await createStudentAccountService({
      teacher_id: teacher_id,
      classId,
      accountArr,
      updatedStudentArr,
      uniqueNickname,
    });

    //   revalidatePath(`/dashboard/teacher/${classId}`);

    return {
      result: true,
      message: "생성 완료",
      data: response,
    };
  } catch (error) {
    console.error("createStudentAccountsAction error:", error);

    return {
      result: false,
      message: error.message || "계정 생성 실패",
    };
  }
}

export async function deleteStudentAccount({ student, classNumber, classId }) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;


    const response = await deleteStudentAccountService({
      teacher_id: teacher_id,
      classId,
      student,
      classNumber,
    });

    //   revalidatePath(`/dashboard/teacher/${classId}`);

    return {
      result: true,
      message: "삭제 완료",
      data: response,
    };
  } catch (error) {
    console.error("createStudentAccountsAction error:", error);

    return {
      result: false,
      message: error.message || "계정 삭제 실패",
    };
  }
}

export async function resetPwd({ student, classId }) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;


    const response = await resetPwdService({
      teacher_id: teacher_id,
      classId,
      student,
    });

    //   revalidatePath(`/dashboard/teacher/${classId}`);

    return {
      result: true,
      message: "삭제 완료",
      data: response,
    };
  } catch (error) {
    console.error("createStudentAccountsAction error:", error);

    return {
      result: false,
      message: error.message || "계정 삭제 실패",
    };
  }
}