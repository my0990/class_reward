import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { compare, hash } from "bcryptjs";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo } = await import("@/test/helpers/testMongo");
const svc = await import("./teacherAccount.service.js");
const { changeTeacherTempPasswordService } = await import("@/server-action/service/account/teacherPassword.service.js");

const mongo = setupTestMongo();
const NOW = new Date("2026-10-27T03:00:00Z");
const EMAIL = "teacher@test.com";
const ADMIN = "boss@test.com";
const user = () => mongo.client.db("user");
const admins = () => mongo.client.db("admins");

let teacherId;
beforeEach(async () => {
  for (const db of [user(), admins()]) {
    const cols = await db.collections();
    await Promise.all(cols.map((c) => c.deleteMany({})));
  }
  teacherId = new ObjectId();
  await user().collection("users").insertOne({ _id: teacherId, role: "teacher", email: EMAIL, passwordHash: await hash("oldpassword", 4), createdAt: NOW });
});

describe("계정 상태 보기", () => {
  it("없는 이메일: 계정 없음 + 메일 발송 기록만", async () => {
    await user().collection("email_send_log").insertOne({ email: "nobody@test.com", sentAt: NOW });
    const r = await svc.lookupTeacherAccountService({ email: " NoBody@Test.com ", now: NOW });
    expect(r).toMatchObject({ ok: true, found: false, email: "nobody@test.com", mail: { sent24h: 1, limited: false } });
    expect(r.account).toBeUndefined();
  });

  it("학급·학생 수, 잠김, 메일 한도, 코드 상태를 보여주고 비밀번호 해시는 내보내지 않는다", async () => {
    const data = mongo.client.db("data");
    await data.collection("classes").insertMany([{ teacher_id: teacherId }, { teacher_id: teacherId, deletedAt: NOW }]);
    await user().collection("users").insertMany([
      { role: "student", teacher_id: teacherId, userId: "s1" },
      { role: "student", teacher_id: teacherId, userId: "s2" },
    ]);
    await user().collection("login_attempts").insertOne({ key: `teacher:${EMAIL}`, failCount: 0, lockedUntil: new Date(NOW.getTime() + 60_000) });
    await user().collection("email_send_log").insertMany(Array.from({ length: 5 }, (_, i) => ({ email: EMAIL, sentAt: new Date(NOW.getTime() - i * 1000) })));
    await user().collection("password_resets").insertOne({ email: EMAIL, expiresAt: new Date(NOW.getTime() + 60_000), attemptsLeft: 3, createdAt: NOW });

    const r = await svc.lookupTeacherAccountService({ email: EMAIL, now: NOW });
    expect(r.found).toBe(true);
    expect(r.account).toMatchObject({ classes: 1, trashedClasses: 1, students: 2, disabled: false, mustChangePassword: false });
    expect(r.login.lockedUntil).not.toBeNull();
    expect(r.mail).toMatchObject({ sent24h: 5, limited: true });
    expect(r.resetCode).toMatchObject({ alive: true, attemptsLeft: 3 });
    expect(JSON.stringify(r)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });

  it("잘못된 이메일 형식은 거절", async () => {
    expect((await svc.lookupTeacherAccountService({ email: "abc" })).ok).toBe(false);
  });
});

describe("잠금·메일 제한 풀기", () => {
  it("로그인 잠금을 풀고 기록을 남긴다", async () => {
    await user().collection("login_attempts").insertOne({ key: `teacher:${EMAIL}`, failCount: 4 });
    const r = await svc.unlockTeacherLoginService({ adminEmail: ADMIN, email: EMAIL, now: NOW });
    expect(r.ok).toBe(true);
    expect(await user().collection("login_attempts").countDocuments()).toBe(0);
    expect(await admins().collection("audit_log").findOne({ action: "teacher_unlock" })).toMatchObject({ adminEmail: ADMIN, target: EMAIL });
  });

  it("최근 24시간 이 이메일의 발송 기록만 지운다", async () => {
    await user().collection("email_send_log").insertMany([
      { email: EMAIL, sentAt: NOW },
      { email: EMAIL, sentAt: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { email: "other@test.com", sentAt: NOW },
    ]);
    await svc.clearTeacherEmailLimitService({ adminEmail: ADMIN, email: EMAIL, now: NOW });
    expect(await user().collection("email_send_log").countDocuments()).toBe(2);
  });
});

describe("임시 비밀번호", () => {
  it("임시 비밀번호로 바꾸고, 다음 로그인 때 변경 필요 + 다른 기기 로그아웃 + 잠금·코드 정리", async () => {
    await user().collection("login_attempts").insertOne({ key: `teacher:${EMAIL}`, failCount: 3 });
    await user().collection("password_resets").insertOne({ email: EMAIL, expiresAt: NOW, attemptsLeft: 5 });

    const r = await svc.issueTeacherTempPasswordService({ adminEmail: ADMIN, email: EMAIL, now: NOW });
    expect(r.ok).toBe(true);
    expect(r.tempPassword).toMatch(/^[A-Za-z2-9]{10}$/);
    expect(r.tempPassword).toMatch(/\d/);

    const t = await user().collection("users").findOne({ _id: teacherId });
    expect(await compare(r.tempPassword, t.passwordHash)).toBe(true);
    expect(t.mustChangePassword).toBe(true);
    expect(t.passwordChangedAt).toEqual(NOW);
    expect(await user().collection("login_attempts").countDocuments()).toBe(0);
    expect(await user().collection("password_resets").countDocuments()).toBe(0);
    const log = await admins().collection("audit_log").findOne({ action: "teacher_temp_password" });
    expect(JSON.stringify(log)).not.toContain(r.tempPassword);
  });

  it("탈퇴 처리 중이거나 없는 계정은 거절", async () => {
    expect((await svc.issueTeacherTempPasswordService({ adminEmail: ADMIN, email: "x@test.com", now: NOW })).ok).toBe(false);
    await user().collection("users").updateOne({ _id: teacherId }, { $set: { disabled: true } });
    expect((await svc.issueTeacherTempPasswordService({ adminEmail: ADMIN, email: EMAIL, now: NOW })).ok).toBe(false);
  });

  it("선생님이 새 비밀번호를 정하면 임시 상태가 풀린다 (임시 비밀번호와 같으면 거절)", async () => {
    const { tempPassword } = await svc.issueTeacherTempPasswordService({ adminEmail: ADMIN, email: EMAIL, now: NOW });
    const id = String(teacherId);
    expect((await changeTeacherTempPasswordService({ teacher_id: id, newPassword: "short" })).ok).toBe(false);
    expect((await changeTeacherTempPasswordService({ teacher_id: id, newPassword: tempPassword })).ok).toBe(false);

    const later = new Date(NOW.getTime() + 60_000);
    expect((await changeTeacherTempPasswordService({ teacher_id: id, newPassword: "newpassword1", now: later })).ok).toBe(true);
    const t = await user().collection("users").findOne({ _id: teacherId });
    expect(t.mustChangePassword).toBeUndefined();
    expect(await compare("newpassword1", t.passwordHash)).toBe(true);
    expect(t.passwordChangedAt).toEqual(later);

    // 이미 바꿨으면 다시 못 씀
    expect((await changeTeacherTempPasswordService({ teacher_id: id, newPassword: "another123" })).ok).toBe(false);
  });
});

describe("임시 비밀번호 만들기", () => {
  it("헷갈리는 글자(0 O 1 l I)가 없다", () => {
    for (let i = 0; i < 200; i++) expect(svc.generateTempPassword()).not.toMatch(/[0O1lI]/);
  });
});

describe("반 고유 아이디로 선생님 찾기", () => {
  it("고유 아이디나 학생 아이디(끝 숫자)로 이메일을 찾고 기록을 남긴다", async () => {
    const data = mongo.client.db("data");
    const classId = new ObjectId();
    await data.collection("classes").insertOne({ _id: classId, teacher_id: teacherId, className: "6학년 2반" });
    await data.collection("class_data").insertOne({ classId, teacher_id: teacherId, className: "6학년 2반", uniqueNickname: "해바라기" });

    const a = await svc.findTeacherByClassNicknameService({ adminEmail: ADMIN, keyword: " 해바라기 ", now: NOW });
    expect(a).toMatchObject({ ok: true, email: EMAIL, className: "6학년 2반", matchedBy: "class", classDeleted: false });

    const b = await svc.findTeacherByClassNicknameService({ adminEmail: ADMIN, keyword: "해바라기12", now: NOW });
    expect(b).toMatchObject({ ok: true, email: EMAIL, matchedBy: "student" });

    expect(await admins().collection("audit_log").countDocuments({ action: "teacher_find_by_class" })).toBe(2);
    expect((await svc.findTeacherByClassNicknameService({ adminEmail: ADMIN, keyword: "없는반" })).ok).toBe(false);
  });
});
