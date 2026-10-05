"use server";
// 관리자 공지사항 server action — 모두 관리자 세션(getAdminEmail)부터 확인한다.
import { getAdminEmail, NOT_ADMIN_MESSAGE } from "@/lib/auth/actionAuth";
import {
  createNoticeService,
  updateNoticeService,
  setNoticePinnedService,
  deleteNoticeService,
} from "@/server-action/service/admin/notice.service";

async function run(fn) {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) return { result: false, message: NOT_ADMIN_MESSAGE };
    return await fn(adminEmail);
  } catch (err) {
    console.error("[admin notice]", err);
    return { result: false, message: "서버 오류가 발생했습니다." };
  }
}

export async function createNoticeAction({ title, content, pinned }) {
  return run((adminEmail) => createNoticeService({ adminEmail, title, content, pinned }));
}

export async function updateNoticeAction({ noticeId, title, content }) {
  return run((adminEmail) => updateNoticeService({ adminEmail, noticeId, title, content }));
}

export async function setNoticePinnedAction({ noticeId, pinned }) {
  return run((adminEmail) => setNoticePinnedService({ adminEmail, noticeId, pinned }));
}

export async function deleteNoticeAction({ noticeId }) {
  return run((adminEmail) => deleteNoticeService({ adminEmail, noticeId }));
}
