'use server'
import { createProfileImgService, updateProfileImgService, deleteProfileImgService, buyProfileImgService, selectProfileImgService, selectProfileTitleService } from "@/server-action/service/profile/profile.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createProfileImg({ createdProfileImgUrl, classId }) {
  try {
    const session = await getServerSession(authOptions);
    const teacher_id = session?.user?._id ?? null;


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
      const session = await getServerSession(authOptions);
      const teacher_id = session?.user?._id ?? null;
  
  
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
      const session = await getServerSession(authOptions);
      const teacher_id = session?.user?._id ?? null;
  
  
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
  export async function buyProfileImg({ classId, userId, pickedData, urlId }) {
    try {
      const session = await getServerSession(authOptions);
      const user = session?.user;

      let target;
      if (user?.role === "student" && user.userId && user.classId && user.teacher_id) {
        target = { teacher_id: user.teacher_id, classId: user.classId, userId: user.userId };
      } else if (user?.role === "teacher" && user.teacher_id) {
        target = { teacher_id: user.teacher_id, classId, userId };
      } else {
        return { result: false, message: "로그인이 필요합니다." };
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

  export async function selectProfileImg({ classId, userId, url}) {
    try {
      const session = await getServerSession(authOptions);
      const teacher_id = session?.user?.teacher_id ?? null;

  
      const response = await selectProfileImgService({
        teacher_id: teacher_id,
        classId,
        url,
        userId,

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


  export async function selectProfileTitle({ classId, userId, profileTitle}) {
    try {
      const session = await getServerSession(authOptions);
      const teacher_id = session?.user?.teacher_id ?? null;

  
      const response = await selectProfileTitleService({
        teacher_id: teacher_id,
        classId,
        profileTitle,
        userId,

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