"use server";
// 키오스크 설정 창 (키오스크 첫 화면 오른쪽 위 톱니)
//
// - 설정 창을 열려면 선생님 비밀번호를 입력한다. 5번 틀리면 10분 동안 설정 창을 열 수 없다.
//   틀린 횟수는 기기마다 따로 센다 → 학생이 일부러 틀려도 선생님의 다른 작업이나 다른 기기는 막히지 않는다.
//   (아직 연결 안 한 기기는 '선생님+학급' 단위로 센다)
// - 맞으면 설정 토큰(10분)을 주고, 창 안의 작업(연결·이름 바꾸기·연결 끊기)은 이 토큰으로 한다. 창을 닫으면 버린다.
// - 선생님 로그인 기기: 「이 기기를 키오스크로 연결」 → 연결 토큰(2분)을 받아 키오스크로 다시 로그인
// - 연결된 기기: 기기 이름 바꾸기, 연결 끊기
// - 두 경우 모두: 첫 화면 메뉴(학급 온도계·퀘스트) 보이기/숨기기 (학급 설정이라 이 반 모든 키오스크에 적용)
// - 선생님 화면(학급 설정): 연결된 기기 목록·원격 끊기
import { logError } from "@/lib/errorLog/errorLog";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { authorizeTeacherClass } from "@/lib/auth/actionAuth";
import { verifyTeacherPassword, lockedSeconds } from "@/lib/auth/teacherPassword";
import { createSignedToken, readSignedToken } from "@/lib/auth/signedToken";
import { isKioskOfClass, KIOSK_PAIR_PURPOSE, KIOSK_SETTINGS_PURPOSE } from "@/lib/auth/kioskSession";
import { KIOSK_TOGGLE_MENUS, cleanKioskMenus, isKioskMenuOn } from "@/util/kiosk/kioskMenus";
import {
  createKioskDeviceService,
  findActiveKioskDeviceService,
  listKioskDevicesService,
  renameKioskDeviceService,
  revokeKioskDeviceService,
} from "@/server-action/service/kiosk/kioskDevice.service";

const SETTINGS_TTL_MS = 10 * 60 * 1000;
const PAIR_TTL_MS = 2 * 60 * 1000;
const fail = (message, extra = {}) => ({ result: false, message, ...extra });

/** 이 기기가 누구인지: 선생님 로그인 기기(teacher) / 이 반에 연결된 기기(kiosk) */
async function contextOf(classId) {
  const user = (await getServerSession(authOptions))?.user;
  if (isKioskOfClass(user, classId)) {
    return { mode: "kiosk", teacher_id: user.teacher_id, deviceId: user._id, lockKey: `kiosk-settings:d:${user._id}` };
  }
  if (user?.role === "teacher") {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return null;
    return { mode: "teacher", teacher_id: auth.teacher_id, deviceId: null, lockKey: `kiosk-settings:t:${auth.teacher_id}:${classId}` };
  }
  return null;
}

/** 설정 토큰 확인 → ctx (같은 기기·같은 학급에서 받은 것만) */
async function settingsContext(classId, settingsToken) {
  const ctx = await contextOf(classId);
  const data = readSignedToken(KIOSK_SETTINGS_PURPOSE, settingsToken);
  if (!ctx || !data || data.c !== String(classId) || data.k !== ctx.lockKey) return null;
  return ctx;
}

/** 설정 버튼 상태: 잠겨 있으면 남은 초 */
export async function kioskSettingsStatus({ classId }) {
  try {
    const ctx = await contextOf(classId);
    if (!ctx) return fail("권한이 없습니다.");
    const userDb = (await connectDB).db("user");
    return { result: true, mode: ctx.mode, lockedSec: await lockedSeconds(userDb, ctx.lockKey) };
  } catch (error) {
    logError("kioskSettingsStatus error:", error);
    return fail("설정 상태를 확인하지 못했어요.");
  }
}

/** 설정 창 열기: 선생님 비밀번호 확인 → 설정 토큰 + 창에 보여 줄 정보 */
export async function unlockKioskSettings({ classId, password }) {
  try {
    const ctx = await contextOf(classId);
    if (!ctx) return fail("권한이 없습니다.");
    const client = await connectDB;
    const userDb = client.db("user");

    const pw = await verifyTeacherPassword(userDb, ObjectId.createFromHexString(ctx.teacher_id), password, new Date(), { lockKey: ctx.lockKey });
    if (!pw.ok) return fail(pw.message, { lockedSec: await lockedSeconds(userDb, ctx.lockKey) });

    const cls = await client
      .db("data")
      .collection("classes")
      .findOne({ _id: ObjectId.createFromHexString(classId) }, { projection: { className: 1 } });
    const classData = await client
      .db("data")
      .collection("class_data")
      .findOne(
        { teacher_id: ObjectId.createFromHexString(ctx.teacher_id), classId: ObjectId.createFromHexString(classId) },
        { projection: { kioskMenus: 1 } }
      );
    const kioskMenus = Object.fromEntries(KIOSK_TOGGLE_MENUS.map(({ key }) => [key, isKioskMenuOn(classData, key)]));
    let device = null;
    if (ctx.mode === "kiosk") {
      const d = await findActiveKioskDeviceService(ctx.deviceId);
      if (!d) return fail("이 기기의 키오스크 연결이 끊겼어요.", { revoked: true });
      device = { name: d.name, createdAt: d.createdAt };
    }
    return {
      result: true,
      settingsToken: createSignedToken(KIOSK_SETTINGS_PURPOSE, { c: String(classId), k: ctx.lockKey }, { ttlMs: SETTINGS_TTL_MS }),
      info: { mode: ctx.mode, className: cls?.className ?? "", device, kioskMenus },
    };
  } catch (error) {
    logError("unlockKioskSettings error:", error);
    return fail("비밀번호를 확인하지 못했어요. 다시 시도해주세요.");
  }
}

/** 선생님 로그인 기기 → 이 반 키오스크로 연결. 받은 pairToken으로 signIn("credentials", { role: "kiosk", token }) */
export async function pairKioskDevice({ classId, settingsToken, name }) {
  try {
    const ctx = await settingsContext(classId, settingsToken);
    if (!ctx) return fail("시간이 지났어요. 설정 창을 다시 열어 주세요.");
    if (ctx.mode !== "teacher") return fail("이미 키오스크로 연결된 기기예요.");
    const res = await createKioskDeviceService({ teacher_id: ctx.teacher_id, classId, name });
    if (!res.ok) return fail(res.message);
    return { result: true, pairToken: createSignedToken(KIOSK_PAIR_PURPOSE, { d: res.deviceId }, { ttlMs: PAIR_TTL_MS }) };
  } catch (error) {
    logError("pairKioskDevice error:", error);
    return fail("기기를 연결하지 못했어요.");
  }
}

/** 첫 화면 메뉴 보이기/숨기기 (이 반 모든 키오스크에 적용) */
export async function setKioskMenus({ classId, settingsToken, menus }) {
  try {
    const ctx = await settingsContext(classId, settingsToken);
    if (!ctx) return fail("시간이 지났어요. 설정 창을 다시 열어 주세요.");
    const clean = cleanKioskMenus(menus);
    if (Object.keys(clean).length === 0) return fail("바꿀 메뉴가 없어요.");
    const set = Object.fromEntries(Object.entries(clean).map(([k, v]) => [`kioskMenus.${k}`, v]));
    const r = await (await connectDB)
      .db("data")
      .collection("class_data")
      .updateOne({ teacher_id: ObjectId.createFromHexString(ctx.teacher_id), classId: ObjectId.createFromHexString(classId) }, { $set: set });
    if (r.matchedCount === 0) return fail("학급 정보를 찾을 수 없어요.");
    return { result: true };
  } catch (error) {
    logError("setKioskMenus error:", error);
    return fail("메뉴 설정을 저장하지 못했어요.");
  }
}

/** 연결된 기기: 이름 바꾸기 */
export async function renameThisKioskDevice({ classId, settingsToken, name }) {
  try {
    const ctx = await settingsContext(classId, settingsToken);
    if (!ctx || ctx.mode !== "kiosk") return fail("시간이 지났어요. 설정 창을 다시 열어 주세요.");
    const res = await renameKioskDeviceService({ teacher_id: ctx.teacher_id, deviceId: ctx.deviceId, name });
    return res.ok ? { result: true, message: "기기 이름을 바꿨어요." } : fail(res.message);
  } catch (error) {
    logError("renameThisKioskDevice error:", error);
    return fail("이름을 바꾸지 못했어요.");
  }
}

/** 연결된 기기: 연결 끊기 (그다음 화면에서 signOut) */
export async function unpairThisKioskDevice({ classId, settingsToken }) {
  try {
    const ctx = await settingsContext(classId, settingsToken);
    if (!ctx || ctx.mode !== "kiosk") return fail("시간이 지났어요. 설정 창을 다시 열어 주세요.");
    await revokeKioskDeviceService({ teacher_id: ctx.teacher_id, deviceId: ctx.deviceId, classId });
    return { result: true, message: "키오스크 연결을 끊었어요." };
  } catch (error) {
    logError("unpairThisKioskDevice error:", error);
    return fail("연결을 끊지 못했어요.");
  }
}

/** 선생님 화면: 이 반에 연결된 기기 목록 */
export async function listKioskDevices({ classId }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return fail(auth.message);
    const list = await listKioskDevicesService({ teacher_id: auth.teacher_id, classId });
    return {
      result: true,
      data: list.map((d) => ({ ...d, createdAt: d.createdAt?.toISOString?.() ?? null, lastSeenAt: d.lastSeenAt?.toISOString?.() ?? null })),
    };
  } catch (error) {
    logError("listKioskDevices error:", error);
    return fail("기기 목록을 불러오지 못했어요.");
  }
}

/** 선생님 화면: 원격으로 연결 끊기 */
export async function revokeKioskDevice({ classId, deviceId }) {
  try {
    const auth = await authorizeTeacherClass(classId);
    if (!auth.ok) return fail(auth.message);
    const res = await revokeKioskDeviceService({ teacher_id: auth.teacher_id, deviceId, classId });
    return res.ok ? { result: true, message: "연결을 끊었어요. 그 기기는 곧 로그아웃됩니다." } : fail(res.message);
  } catch (error) {
    logError("revokeKioskDevice error:", error);
    return fail("연결을 끊지 못했어요.");
  }
}
