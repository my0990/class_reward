'use server'
import { createProfileImgService, updateProfileImgService, deleteProfileImgService, buyProfileImgService, selectProfileImgService } from "@/server-action/service/profile/profile.service";
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

  export async function buyProfileImg({ classId, userId, pickedData, balance}) {
    try {
      const session = await getServerSession(authOptions);
      const teacher_id = session?.user?.teacher_id ?? null;

  
      const response = await buyProfileImgService({
        teacher_id: teacher_id,
        classId,
        pickedData,
        userId,
        balance
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

