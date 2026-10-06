// 학생 비밀번호 규칙
//
// 학생 계정은 처음 만들거나 선생님이 초기화하면 모두 같은 기본 비밀번호(DEFAULT_STUDENT_PASSWORD)다.
// 아이디는 "학급 별명 + 번호"라 쉽게 짐작할 수 있어서, 기본 비밀번호 그대로면 친구 계정에 들어갈 수 있다.
// → 기본 비밀번호로 로그인(또는 키오스크 확인)하면 먼저 새 비밀번호를 정하게 한다.
/** 학생 계정을 만들거나 초기화할 때의 비밀번호 */
export const DEFAULT_STUDENT_PASSWORD = "12345678";

export const STUDENT_PASSWORD_MIN = 4;
export const STUDENT_PASSWORD_MAX = 20;

export function isDefaultStudentPassword(password) {
  return String(password ?? "") === DEFAULT_STUDENT_PASSWORD;
}

/** 새 비밀번호 확인: 문제가 있으면 안내 문구, 괜찮으면 null */
export function checkNewStudentPassword(password, userId) {
  const p = String(password ?? "");
  if (p.length < STUDENT_PASSWORD_MIN) return `비밀번호는 ${STUDENT_PASSWORD_MIN}자리 이상으로 정해주세요.`;
  if (p.length > STUDENT_PASSWORD_MAX) return `비밀번호는 ${STUDENT_PASSWORD_MAX}자리까지 쓸 수 있어요.`;
  if (isDefaultStudentPassword(p)) return "처음 비밀번호와 다른 비밀번호로 정해주세요.";
  if (userId && p === String(userId)) return "아이디와 다른 비밀번호로 정해주세요.";
  if (/^(.)\1+$/.test(p)) return "같은 숫자(글자)만 반복하면 안 돼요.";
  return null;
}
