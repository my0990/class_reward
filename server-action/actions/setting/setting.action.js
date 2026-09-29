"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  updateProfileService,
  updatePasswordService,
} from "@/server-action/service/setting/setting.service";

export async function updateProfile({ profileNickname, profileState }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return { result: false, message: "로그인이 필요합니다." };
  }

  const { _id, email, userId, role } = session.user;

  try {
    return await updateProfileService({
      _id,
      email,
      userId,
      role,
      profileNickname,
      profileState,
    });
  } catch (err) {
    return {
      result: false,
      message: err?.message || "프로필 수정에 실패했습니다.",
    };
  }
}

export async function updatePassword({ currentPassword, nextPassword }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return { result: false, message: "로그인이 필요합니다." };
  }

  const { _id, email, userId, role } = session.user;

  try {
    return await updatePasswordService({
      _id,
      email,
      userId,
      role,
      currentPassword,
      nextPassword,
    });
  } catch (err) {
    return {
      result: false,
      message: err?.message || "비밀번호 변경에 실패했습니다.",
    };
  }
}
