// 키오스크 기기 세션은 '기본 거절': 허락하는 곳이 아래 목록뿐인지 지킨다.
// 새 API·서버 작업에 키오스크를 허락하려면, 정말 필요한지 확인하고 이 목록에 추가할 것.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isKioskUser, isKioskOfClass, isKioskAllowedPath } from "./kioskSession.js";

const ROOT = join(import.meta.dirname, "../..");
const KIOSK_ALLOWED = [
  "app/api/auth/[...nextauth]/route.js", // 기기 연결 로그인·연결 확인
  "app/api/classData/[id]/route.js",
  "app/api/students/[id]/route.js",
  "app/api/students/[id]/version/route.js",
  "app/api/thermometer/[id]/route.js",
  "server-action/actions/account/studentPassword.action.js", // 키오스크 학생 비밀번호 변경
  "server-action/actions/kiosk/kiosk.action.js", // 학생 비밀번호 확인 → 결제 토큰
  "server-action/actions/kiosk/kioskSettings.action.js", // 설정 창
];
const PATTERN = /requireTeacherOrKiosk\(|allowKiosk:\s*true|isKioskUser\(|isKioskOfClass\(|role\s*===\s*"kiosk"/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|jsx)$/.test(name) && !/\.test\.js$/.test(name)) out.push(p);
  }
  return out;
}

describe("키오스크 세션", () => {
  const kiosk = { role: "kiosk", _id: "d1", teacher_id: "t1", classId: "c1" };

  it("자기 반 키오스크 화면만", () => {
    expect(isKioskUser(kiosk)).toBe(true);
    expect(isKioskUser({ role: "teacher", _id: "t1" })).toBe(false);
    expect(isKioskOfClass(kiosk, "c1")).toBe(true);
    expect(isKioskOfClass(kiosk, "c2")).toBe(false);
    expect(isKioskAllowedPath(kiosk, "/teacher/kiosk/c1")).toBe(true);
    expect(isKioskAllowedPath(kiosk, "/teacher/kiosk/c1/buy")).toBe(true);
    expect(isKioskAllowedPath(kiosk, "/teacher/kiosk/c10")).toBe(false);
    expect(isKioskAllowedPath(kiosk, "/teacher/dashboard/c1")).toBe(false);
    expect(isKioskAllowedPath(kiosk, "/teacher/classes")).toBe(false);
  });

  it("키오스크를 허락하는 API·서버 작업은 정해진 목록뿐 (기본 거절)", () => {
    const files = [...walk(join(ROOT, "app/api")), ...walk(join(ROOT, "server-action/actions"))];
    const found = files
      .filter((f) => PATTERN.test(readFileSync(f, "utf8")))
      .map((f) => relative(ROOT, f).split("\\").join("/"))
      .sort();
    expect(found).toEqual([...KIOSK_ALLOWED].sort());
  });
});
