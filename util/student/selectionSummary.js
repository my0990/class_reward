// 화폐 지급 창: 선택한 학생을 짧게 보여주기
//   1~3명 → 이름까지 / 4명 이상 → "12명 · 1~5, 8, 10번" / 반 전체 → "전체 25명"

export const NAME_LIMIT = 3; // 이 인원까지는 이름까지 보여준다

/** [1,2,3,5,7,8] → "1~3, 5, 7, 8" (두 개 이어진 번호는 묶지 않는다) */
export function compressNumbers(nums) {
  const sorted = [...new Set(nums.map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    if (j - i >= 2) parts.push(`${sorted[i]}~${sorted[j]}`);
    else for (let k = i; k <= j; k++) parts.push(String(sorted[k]));
    i = j + 1;
  }
  return parts.join(", ");
}

/**
 * students: [{ userId, label, classNumber }]
 * → { mode: "names" | "numbers" | "all", count, numbers, others }
 *   numbers: 번호 요약 ("1~5, 8"), others: 번호가 없는 학생 이름들
 */
export function summarizeSelection(students, totalCount) {
  const count = students.length;
  const withNum = students.filter((s) => s.classNumber != null && s.classNumber !== "");
  const others = students.filter((s) => !(s.classNumber != null && s.classNumber !== "")).map((s) => s.label);
  const numbers = compressNumbers(withNum.map((s) => s.classNumber));
  let mode = "numbers";
  if (count <= NAME_LIMIT) mode = "names";
  else if (totalCount && count === totalCount) mode = "all";
  return { mode, count, numbers, others };
}
