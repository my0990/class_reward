// 학생 이름 표시 (자리 바꾸기 공용)
// - 선생님 학급: "3번 김하늘"
// - 비회원 명단: 번호만 → "3번", 이름만(hideNumber) → "김하늘", 둘 다 → "3번 김하늘"
export function studentLabel(s) {
  if (!s) return "";
  if (s.hideNumber) return s.profileNickname || `${s.classNumber}번`;
  return s.profileNickname ? `${s.classNumber}번 ${s.profileNickname}` : `${s.classNumber}번`;
}

/** userId → 표시 이름 (없는 학생이면 userId 그대로) */
export const labelOf = (byId) => (u) => (byId[u] ? studentLabel(byId[u]) : u);
