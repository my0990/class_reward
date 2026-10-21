// 키오스크 기기 세션 (role: "kiosk")
// 키오스크 세션은 선생님 권한이 없다: requireTeacher·authorizeTeacherClass·getTeacherId는 role이 "teacher"일 때만
// 통과하므로 기본으로 모두 거절된다. 키오스크를 허락하는 곳은 아래 함수를 쓰는 곳뿐이다
// (lib/auth/kioskSession.test.js가 그 목록을 지킨다).
export const KIOSK_PAIR_PURPOSE = "kiosk-pair"; // 기기 연결 직후 키오스크 로그인용 (2분)
export const KIOSK_SETTINGS_PURPOSE = "kiosk-settings"; // 설정 창 비밀번호 확인 후 (창을 닫으면 버림)

export const isKioskUser = (user) => user?.role === "kiosk" && Boolean(user._id && user.teacher_id && user.classId);

/** 키오스크 세션이 이 학급의 키오스크인가 */
export const isKioskOfClass = (user, classId) => isKioskUser(user) && String(user.classId) === String(classId);

/** 키오스크 기기가 갈 수 있는 화면인가 (자기 반 키오스크 화면만) */
export function kioskHomePath(user) {
  return `/teacher/kiosk/${user.classId}`;
}
export function isKioskAllowedPath(user, pathname) {
  const home = kioskHomePath(user);
  return pathname === home || pathname.startsWith(`${home}/`);
}
