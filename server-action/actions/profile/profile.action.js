'use server'
import { authorizeTeacherClass, getTeacherId } from "@/lib/auth/actionAuth";
import { createProfileImgService, updateProfileImgService, deleteProfileImgService, buyProfileImgService, selectProfileImgService, selectProfileTitleService } from "@/server-action/service/profile/profile.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resolveStudentTarget, StudentTargetError } from "@/lib/auth/studentTarget";

// 프로필 선택(사진/칭호) 대상 학생 결정
async function resolveProfileTarget({ classId, userId }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (user?.role === "student" && user.userId && user.classId && user.teacher_id) {
    return { ok: true, teacher_id: user.teacher_id, classId: user.classId, userId: user.userId };
  }
  const auth = await authorizeTeacherClass(classId);
  if (!auth.ok) return auth;
  return { ok: true, teacher_id: auth.teacher_id, classId, userId };
}

export async function createProfileImg({ createdProfileImgUrl, classId }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return { result: false, message: auth.message };
    const teacher_id = auth.teacher_id;


    const response = await createProfileImgService({
      teacher_id: teacher_id,
      classId,
      url: createdProfileImgUrl,
    });


    return {
      result: true,
      message: "프로필 이미지 등록 완료",
      data: response,
    };
  } catch (error) {
    console.error("error:", error);

    return {
      result: false,
      message: error.message || "프로필 이미지 등록 실패",
    };
  }
}

export async function updateProfileImg({ url, price, classId, urlId }) {
    try {
      const auth = await authorizeTeacherClass(classId);
      if (!auth.ok) return { result: false, message: auth.message };
      const teacher_id = auth.teacher_id;
  
  
      const response = await updateProfileImgService({
        teacher_id: teacher_id,
        classId,
        url: url,
        price: price,
        urlId: urlId
      });
  
  
      return {
        result: true,
        message: "프로필 이미지 등록 완료",
        data: response,
      };
    } catch (error) {
      console.error("error:", error);
  
      return {
        result: false,
        message: error.message || "프로필 이미지 등록 실패",
      };
    }
  }


  export async function deleteProfileImg({ classId, urlId }) {
    try {
      const auth = await authorizeTeacherClass(classId);
      if (!auth.ok) return { result: false, message: auth.message };
      const teacher_id = auth.teacher_id;
  
  
      const response = await deleteProfileImgService({
        teacher_id: teacher_id,
        classId,
        urlId: urlId
      });
  
  
      return {
        result: true,
        message: "프로필 이미지 삭제 완료",
        data: response,
      };
    } catch (error) {
      console.error("error:", error);
  
      return {
        result: false,
        message: error.message || "프로필 이미지 삭제 실패",
      };
    }
  }

  // 학생이 직접 구매: 학생 세션의 userId/classId/teacher_id만 쓴다 (다른 학생 대신 결제 방지).
  // 가격·이미지 주소·잔액은 클라이언트 값을 받지 않고 서버가 계산한다.
  export async function buyProfileImg({ classId, userId, pickedData, urlId, kioskToken }) {
    try {
      const session = await getServerSession(authOptions);

      // 학생은 본인만, 교사(키오스크)는 학생 비밀번호 확인 토큰이 있어야 한다.
      let target;
      try {
        target = resolveStudentTarget(session, { userId, classId, kioskToken });
      } catch (error) {
        if (error instanceof StudentTargetError) return { result: false, message: error.message };
        throw error;
      }

      const response = await buyProfileImgService({
        ...target,
        urlId: urlId ?? pickedData?.urlId,
      });
  
  
      return {
        result: true,
        message: "프로필 이미지 구입 완료",
        data: response,
      };
    } catch (error) {
      console.error("error:", error);
  
      return {
        result: false,
        message: error.message || "프로필 이미지 구입 실패",
      };
    }
  }

  // 학생: 본인 것만 바꾼다 (세션 값 사용, 파라미터 userId/classId 무시)
  // 교사: 자기 학급 학생만 바꿀 수 있다.
  export async function selectProfileImg({ classId, userId, url }) {
    try {
      const target = await resolveProfileTarget({ classId, userId });
      if (!target.ok) return { result: false, message: target.message };

      const response = await selectProfileImgService({
        teacher_id: target.teacher_id,
        classId: target.classId,
        userId: target.userId,
        url,
      });


      return {
        result: true,
        message: "프로필 이미지 수정 완료",
        data: response,
      };
    } catch (error) {
      console.error("error:", error);
  
      return {
        result: false,
        message: error.message || "프로필 이미지 수정 실패",
      };
    }
  }


  // 학생: 본인 것만 바꾼다 (세션 값 사용, 파라미터 userId/classId 무시)
  // 교사: 자기 학급 학생만 바꿀 수 있다.
  export async function selectProfileTitle({ classId, userId, profileTitle }) {
    try {
      const target = await resolveProfileTarget({ classId, userId });
      if (!target.ok) return { result: false, message: target.message };

      const response = await selectProfileTitleService({
        teacher_id: target.teacher_id,
        classId: target.classId,
        userId: target.userId,
        profileTitle,
      });


      return {
        result: true,
        message: "칭호 수정 완료",
        data: response,
      };
    } catch (error) {
      console.error("error:", error);
  
      return {
        result: false,
        message: error.message || "칭호 수정 실패",
      };
    }
  }