import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo, makeScope } = await import("@/test/helpers/testMongo");
const svc = await import("./kioskDevice.service.js");

const mongo = setupTestMongo();
const devices = () => mongo.client.db("user").collection("kiosk_devices");
const s = makeScope();
const other = makeScope();
const DAY = 86400000;
const t0 = new Date("2026-10-21T00:00:00Z");

beforeEach(async () => {
  await devices().deleteMany({});
});

describe("키오스크 기기 연결", () => {
  it("연결 → 쓸 수 있음 → 이름 바꾸기 → 목록", async () => {
    const r = await svc.createKioskDeviceService({ teacher_id: s.teacher_id, classId: s.classId, name: "  교실 태블릿  ", now: t0 });
    expect(r.ok).toBe(true);
    expect(await svc.findActiveKioskDeviceService(r.deviceId, { now: t0 })).toMatchObject({ name: "교실 태블릿" });

    await svc.renameKioskDeviceService({ teacher_id: s.teacher_id, deviceId: r.deviceId, name: "앞문 태블릿" });
    const list = await svc.listKioskDevicesService({ teacher_id: s.teacher_id, classId: s.classId, now: t0 });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: r.deviceId, name: "앞문 태블릿" });

    // 이름이 비면 '키오스크 n'
    const r2 = await svc.createKioskDeviceService({ teacher_id: s.teacher_id, classId: s.classId, name: "", now: t0 });
    expect((await svc.findActiveKioskDeviceService(r2.deviceId, { now: t0 })).name).toBe("키오스크 2");
  });

  it("끊으면 바로 못 씀, 다른 선생님은 못 끊음", async () => {
    const { deviceId } = await svc.createKioskDeviceService({ teacher_id: s.teacher_id, classId: s.classId, now: t0 });
    expect((await svc.revokeKioskDeviceService({ teacher_id: other.teacher_id, deviceId })).ok).toBe(false);
    expect((await svc.revokeKioskDeviceService({ teacher_id: s.teacher_id, deviceId, classId: s.classId })).ok).toBe(true);
    expect(await svc.findActiveKioskDeviceService(deviceId, { now: t0 })).toBeNull();
    expect(await svc.listKioskDevicesService({ teacher_id: s.teacher_id, classId: s.classId, now: t0 })).toEqual([]);
  });

  it(`${svc.KIOSK_IDLE_DAYS}일 동안 안 쓰면 끊긴 것으로, 쓰면(touch) 다시 연장`, async () => {
    const { deviceId } = await svc.createKioskDeviceService({ teacher_id: s.teacher_id, classId: s.classId, now: t0 });
    const later = (d) => new Date(t0.getTime() + d * DAY);
    expect(await svc.findActiveKioskDeviceService(deviceId, { now: later(80), touch: true })).not.toBeNull();
    expect(await svc.findActiveKioskDeviceService(deviceId, { now: later(160) })).not.toBeNull(); // 80일에 썼으니
    expect(await svc.findActiveKioskDeviceService(deviceId, { now: later(171) })).toBeNull();
  });

  it("학급 휴지통: 그 반 기기만 모두 끊김", async () => {
    const a = await svc.createKioskDeviceService({ teacher_id: s.teacher_id, classId: s.classId, now: t0 });
    const b = await svc.createKioskDeviceService({ teacher_id: other.teacher_id, classId: other.classId, now: t0 });
    expect(await svc.revokeClassKioskDevicesService({ teacherObjectId: s.teacherObjectId, classObjectId: s.classObjectId, now: t0 })).toBe(1);
    expect(await svc.findActiveKioskDeviceService(a.deviceId, { now: t0 })).toBeNull();
    expect(await svc.findActiveKioskDeviceService(b.deviceId, { now: t0 })).not.toBeNull();
  });

  it(`한 학급 ${svc.KIOSK_MAX_PER_CLASS}대까지`, async () => {
    for (let i = 0; i < svc.KIOSK_MAX_PER_CLASS; i++) await svc.createKioskDeviceService({ teacher_id: s.teacher_id, classId: s.classId, now: t0 });
    const r = await svc.createKioskDeviceService({ teacher_id: s.teacher_id, classId: s.classId, now: t0 });
    expect(r.ok).toBe(false);
  });

  it("잘못된 id는 조용히 실패", async () => {
    expect(await svc.findActiveKioskDeviceService("nope")).toBeNull();
    expect((await svc.createKioskDeviceService({ teacher_id: "x", classId: s.classId })).ok).toBe(false);
  });
});
