// 키오스크 기기 연결 (user.kiosk_devices)
//
// 교실 기기에서 「이 기기를 키오스크로 연결」을 누르면 연결 기록이 하나 생기고,
// 그 기기는 선생님 로그인 대신 '이 반 키오스크' 세션(role: "kiosk")으로 바뀐다.
// 키오스크 세션은 그 반 키오스크 기능만 쓸 수 있다 (선생님 기능은 원래 권한이 없음).
//
// 문서: { _id, teacher_id, classId, name, createdAt, lastSeenAt, revokedAt? }
// - 끊으면(revokedAt) 그 기기는 다음 확인 때 로그아웃된다 (결제 시작 때는 매번 확인)
// - 오래 안 쓰면(KIOSK_IDLE_DAYS) 끊긴 것으로 본다
// - 학급을 휴지통에 넣으면 그 반 기기는 모두 끊긴다
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

export const KIOSK_NAME_MAX = 20;
export const KIOSK_MAX_PER_CLASS = 10;
export const KIOSK_IDLE_DAYS = 90;
const DAY = 24 * 60 * 60 * 1000;

const devices = async () => (await connectDB).db("user").collection("kiosk_devices");
const oid = (v) => {
  try {
    return v instanceof ObjectId ? v : ObjectId.createFromHexString(String(v));
  } catch {
    return null;
  }
};
const cleanName = (name, fallback) => String(name ?? "").trim().slice(0, KIOSK_NAME_MAX) || fallback;

/** 쓰는 중인(끊기지 않은) 기기 조건 */
function activeFilter(now) {
  return { revokedAt: { $exists: false }, lastSeenAt: { $gte: new Date(now.getTime() - KIOSK_IDLE_DAYS * DAY) } };
}

/** 새 기기 연결. 학급 확인(교사 소유·휴지통 아님)은 action에서 한다. → { ok, deviceId } */
export async function createKioskDeviceService({ teacher_id, classId, name, now = new Date() }) {
  const teacherObjectId = oid(teacher_id);
  const classObjectId = oid(classId);
  if (!teacherObjectId || !classObjectId) return { ok: false, message: "잘못된 요청입니다." };
  const col = await devices();
  const count = await col.countDocuments({ teacher_id: teacherObjectId, classId: classObjectId, ...activeFilter(now) });
  if (count >= KIOSK_MAX_PER_CLASS) {
    return { ok: false, message: `한 학급에 키오스크 기기는 ${KIOSK_MAX_PER_CLASS}대까지 연결할 수 있어요. 선생님 화면 설정에서 안 쓰는 기기를 끊어 주세요.` };
  }
  const { insertedId } = await col.insertOne({
    teacher_id: teacherObjectId,
    classId: classObjectId,
    name: cleanName(name, `키오스크 ${count + 1}`),
    createdAt: now,
    lastSeenAt: now,
  });
  return { ok: true, deviceId: insertedId.toHexString() };
}

/** 쓸 수 있는 기기면 문서, 아니면 null. touch=true면 마지막 사용 시각도 갱신 */
export async function findActiveKioskDeviceService(deviceId, { now = new Date(), touch = false } = {}) {
  const _id = oid(deviceId);
  if (!_id) return null;
  const col = await devices();
  const filter = { _id, ...activeFilter(now) };
  if (!touch) return col.findOne(filter);
  return col.findOneAndUpdate(filter, { $set: { lastSeenAt: now } }, { returnDocument: "after" });
}

/** 학급의 연결된 기기 목록 (선생님 화면) */
export async function listKioskDevicesService({ teacher_id, classId, now = new Date() }) {
  const col = await devices();
  const list = await col
    .find({ teacher_id: oid(teacher_id), classId: oid(classId), ...activeFilter(now) }, { projection: { name: 1, createdAt: 1, lastSeenAt: 1 } })
    .sort({ createdAt: 1 })
    .toArray();
  return list.map((d) => ({ id: d._id.toHexString(), name: d.name, createdAt: d.createdAt, lastSeenAt: d.lastSeenAt }));
}

/** 기기 이름 바꾸기 */
export async function renameKioskDeviceService({ teacher_id, deviceId, name }) {
  const col = await devices();
  const r = await col.updateOne(
    { _id: oid(deviceId), teacher_id: oid(teacher_id), revokedAt: { $exists: false } },
    { $set: { name: cleanName(name, "키오스크") } }
  );
  return r.matchedCount ? { ok: true } : { ok: false, message: "연결된 기기를 찾을 수 없어요." };
}

/** 연결 끊기 (그 선생님의 기기만) */
export async function revokeKioskDeviceService({ teacher_id, deviceId, classId, now = new Date() }) {
  const col = await devices();
  const filter = { _id: oid(deviceId), teacher_id: oid(teacher_id), revokedAt: { $exists: false } };
  if (classId) filter.classId = oid(classId);
  const r = await col.updateOne(filter, { $set: { revokedAt: now } });
  return r.matchedCount ? { ok: true } : { ok: false, message: "이미 끊긴 기기예요." };
}

/** 학급의 기기를 모두 끊기 (학급 휴지통) */
export async function revokeClassKioskDevicesService({ teacherObjectId, classObjectId, now = new Date() }, { session } = {}) {
  const col = await devices();
  const r = await col.updateMany(
    { teacher_id: teacherObjectId, classId: classObjectId, revokedAt: { $exists: false } },
    { $set: { revokedAt: now } },
    session ? { session } : undefined
  );
  return r.modifiedCount;
}
