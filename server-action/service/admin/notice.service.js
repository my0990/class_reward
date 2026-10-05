// 공지사항 관리 (관리자 전용) — admins.notices
//
// 문서: { title, content, pinned, pinnedAt, createdAt, updatedAt, authorEmail }
// 정렬: 고정 공지 먼저(고정한 순서 최신순) → 나머지는 작성일 최신순 (NOTICE_SORT)
// 권한 확인은 server-action/admin/notice.action.js에서 하고, 여기서는 adminEmail을 받기만 한다.
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { writeAuditLog } from "@/lib/auth/adminAuth";

export const NOTICE_LIMITS = { TITLE_MAX: 100, CONTENT_MAX: 10000 };
export const NOTICE_SORT = { pinned: -1, pinnedAt: -1, createdAt: -1 };

const HEX24 = /^[0-9a-f]{24}$/i;

async function adminsDb() {
  return (await connectDB).db("admins");
}

function validate({ title, content }) {
  const t = String(title ?? "").trim();
  const c = String(content ?? "").trim();
  if (!t) return { error: "제목을 입력해주세요." };
  if (!c) return { error: "내용을 입력해주세요." };
  if (t.length > NOTICE_LIMITS.TITLE_MAX) return { error: `제목은 ${NOTICE_LIMITS.TITLE_MAX}자까지 쓸 수 있습니다.` };
  if (c.length > NOTICE_LIMITS.CONTENT_MAX) return { error: `내용은 ${NOTICE_LIMITS.CONTENT_MAX}자까지 쓸 수 있습니다.` };
  return { title: t, content: c };
}

function toId(id) {
  return typeof id === "string" && HEX24.test(id) ? ObjectId.createFromHexString(id) : null;
}

export function serializeNotice(n) {
  return {
    _id: n._id.toString(),
    title: n.title,
    content: n.content,
    pinned: Boolean(n.pinned),
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
    updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : null,
  };
}

export async function listNoticesForAdminService() {
  const db = await adminsDb();
  const notices = await db.collection("notices").find().sort(NOTICE_SORT).limit(200).toArray();
  return notices.map(serializeNotice);
}

export async function createNoticeService({ adminEmail, title, content, pinned = false, now = new Date() }) {
  const v = validate({ title, content });
  if (v.error) return { result: false, message: v.error };

  const db = await adminsDb();
  const doc = {
    title: v.title,
    content: v.content,
    pinned: Boolean(pinned),
    pinnedAt: pinned ? now : null,
    authorEmail: adminEmail,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await db.collection("notices").insertOne(doc);
  await writeAuditLog(db, { adminEmail, action: "notice_create", target: insertedId.toString(), detail: v.title, now });
  return { result: true, message: "공지를 등록했습니다.", data: { _id: insertedId.toString() } };
}

export async function updateNoticeService({ adminEmail, noticeId, title, content, now = new Date() }) {
  const _id = toId(noticeId);
  if (!_id) return { result: false, message: "잘못된 공지입니다." };
  const v = validate({ title, content });
  if (v.error) return { result: false, message: v.error };

  const db = await adminsDb();
  const r = await db
    .collection("notices")
    .updateOne({ _id }, { $set: { title: v.title, content: v.content, updatedAt: now } });
  if (!r.matchedCount) return { result: false, message: "공지를 찾을 수 없습니다." };

  await writeAuditLog(db, { adminEmail, action: "notice_update", target: noticeId, detail: v.title, now });
  return { result: true, message: "공지를 수정했습니다." };
}

/** 고정/해제. 수정일(updatedAt)은 바꾸지 않는다 (교사 화면에 "수정됨"이 뜨지 않게) */
export async function setNoticePinnedService({ adminEmail, noticeId, pinned, now = new Date() }) {
  const _id = toId(noticeId);
  if (!_id) return { result: false, message: "잘못된 공지입니다." };

  const db = await adminsDb();
  const r = await db
    .collection("notices")
    .updateOne({ _id }, { $set: { pinned: Boolean(pinned), pinnedAt: pinned ? now : null } });
  if (!r.matchedCount) return { result: false, message: "공지를 찾을 수 없습니다." };

  await writeAuditLog(db, { adminEmail, action: pinned ? "notice_pin" : "notice_unpin", target: noticeId, now });
  return { result: true, message: pinned ? "맨 위에 고정했습니다." : "고정을 풀었습니다." };
}

export async function deleteNoticeService({ adminEmail, noticeId, now = new Date() }) {
  const _id = toId(noticeId);
  if (!_id) return { result: false, message: "잘못된 공지입니다." };

  const db = await adminsDb();
  const notice = await db.collection("notices").findOneAndDelete({ _id });
  if (!notice) return { result: false, message: "공지를 찾을 수 없습니다." };

  await writeAuditLog(db, { adminEmail, action: "notice_delete", target: noticeId, detail: notice.title, now });
  return { result: true, message: "공지를 삭제했습니다." };
}
