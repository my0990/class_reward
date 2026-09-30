/**
 * DB나 입력값에서 온 숫자를 0 이상의 정수로 정규화한다.
 * - number: 0 이상의 정수일 때만 그대로 반환
 * - string: 앞뒤 공백과 천 단위 콤마를 제거한 뒤 숫자로만 이뤄져 있으면 정수로 변환 ("1,000" -> 1000)
 * - 그 외(빈 문자열, 소수, 음수, "1e3", null 등): null
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function toNonNegativeInt(value) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  if (typeof value === "string") {
    const cleaned = value.trim().replace(/,/g, "");
    if (!/^\d+$/.test(cleaned)) return null;
    const n = Number(cleaned);
    return Number.isSafeInteger(n) ? n : null;
  }

  return null;
}
