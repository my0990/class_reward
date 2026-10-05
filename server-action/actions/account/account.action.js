'use server'
import { authorizeTeacherClass, getTeacherId } from "@/lib/auth/actionAuth";
import { createStudentAccountService, deleteStudentAccountService, resetPwdService, checkUniqueNicknameService } from "@/server-action/service/account/account.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// updatedStudentArr, uniqueNickname은 더 이상 쓰지 않는다 (서버가 DB에서 읽고 계산한다).
export async function createStudentAccount({ accountArr, classId }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };

    const response = await createStudentAccountService({
      teacher_id: auth.teacher_id,
      classId,
      accountArr,
    });

    const { created, skipped } = response;
    if (created.length === 0) {
      return { result: false, message: `이미 만들어진 계정입니다. (${skipped.join(", ")}번)`, data: response };
    }

    return {
      result: true,
      message:
        `${created.length}개 계정을 만들었습니다.` +
        (skipped.length ? ` (이미 있어서 건너뛴 번호: ${skipped.join(", ")})` : ""),
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
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };
    const teacher_id = auth.teacher_id;


    const response = await deleteStudentAccountService({
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

export async function resetPwd({ student, classId }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };
    const teacher_id = auth.teacher_id;


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


export async function checkUniqueNickname({ uniqueNickname, classId }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, error: auth.message };
    const teacher_id = auth.teacher_id;

    const response = await checkUniqueNicknameService({
      teacher_id,
      classId,
      uniqueNickname,
    });

    return response;
  } catch (error) {
    console.error("checkUniqueNickname error:", error);

    return {
      result: false,
      error: error.message || "별명 등록에 실패했습니다.",
    };
  }
}
