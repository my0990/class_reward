import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const {
  createNoticeService,
  updateNoticeService,
  setNoticePinnedService,
  deleteNoticeService,
  listNoticesForAdminService,
  NOTICE_LIMITS,
} = await import("@/server-action/service/admin/notice.service");

const mongo = setupTestMongo();
const adminEmail = "boss@test.com";
let db;

beforeEach(async () => {
  db = mongo.client.db("admins");
  await Promise.all((await db.collections()).map((c) => c.deleteMany({})));
});

const t = (s) => new Date(`2026-10-0${s}T00:00:00Z`);

describe("공지 서비스", () => {
  it("제목/내용을 확인한다", async () => {
    expect((await createNoticeService({ adminEmail, title: " ", content: "내용" })).result).toBe(false);
    expect((await createNoticeService({ adminEmail, title: "제목", content: "" })).result).toBe(false);
    expect(
      (await createNoticeService({ adminEmail, title: "x".repeat(NOTICE_LIMITS.TITLE_MAX + 1), content: "내용" })).result
    ).toBe(false);
    expect(await db.collection("notices").countDocuments()).toBe(0);
  });

  it("등록하면 앞뒤 공백을 지우고 감사 기록을 남긴다", async () => {
    const r = await createNoticeService({ adminEmail, title: "  점검 안내 ", content: " 내일 점검 " });
    expect(r.result).toBe(true);
    const n = await db.collection("notices").findOne();
    expect(n).toMatchObject({ title: "점검 안내", content: "내일 점검", pinned: false, authorEmail: adminEmail });
    expect(await db.collection("audit_log").countDocuments({ action: "notice_create" })).toBe(1);
  });

  it("고정 공지가 먼저, 그다음 최신순", async () => {
    await createNoticeService({ adminEmail, title: "오래된 고정", content: "c", pinned: true, now: t(1) });
    await createNoticeService({ adminEmail, title: "일반", content: "c", now: t(2) });
    const { data } = await createNoticeService({ adminEmail, title: "나중 고정", content: "c", now: t(3) });
    await setNoticePinnedService({ adminEmail, noticeId: data._id, pinned: true, now: t(4) });
    await createNoticeService({ adminEmail, title: "최신 일반", content: "c", now: t(5) });

    const titles = (await listNoticesForAdminService()).map((n) => n.title);
    expect(titles).toEqual(["나중 고정", "오래된 고정", "최신 일반", "일반"]);
  });

  it("고정/해제는 수정일을 바꾸지 않는다", async () => {
    const { data } = await createNoticeService({ adminEmail, title: "a", content: "b", now: t(1) });
    await setNoticePinnedService({ adminEmail, noticeId: data._id, pinned: true, now: t(2) });
    const n = await db.collection("notices").findOne();
    expect(n.pinned).toBe(true);
    expect(n.updatedAt).toEqual(t(1));
  });

  it("수정하면 updatedAt이 바뀌고 고정 상태는 그대로", async () => {
    const { data } = await createNoticeService({ adminEmail, title: "a", content: "b", pinned: true, now: t(1) });
    const r = await updateNoticeService({ adminEmail, noticeId: data._id, title: "a2", content: "b2", now: t(2) });
    expect(r.result).toBe(true);
    const n = await db.collection("notices").findOne();
    expect(n).toMatchObject({ title: "a2", content: "b2", pinned: true });
    expect(n.updatedAt).toEqual(t(2));
  });

  it("잘못된 id / 없는 공지는 실패", async () => {
    expect((await updateNoticeService({ adminEmail, noticeId: "bad", title: "a", content: "b" })).result).toBe(false);
    expect((await deleteNoticeService({ adminEmail, noticeId: "a".repeat(24) })).result).toBe(false);
    expect((await setNoticePinnedService({ adminEmail, noticeId: "a".repeat(24), pinned: true })).result).toBe(false);
  });

  it("삭제", async () => {
    const { data } = await createNoticeService({ adminEmail, title: "a", content: "b" });
    expect((await deleteNoticeService({ adminEmail, noticeId: data._id })).result).toBe(true);
    expect(await db.collection("notices").countDocuments()).toBe(0);
    expect(await db.collection("audit_log").countDocuments({ action: "notice_delete", detail: "a" })).toBe(1);
  });
});
