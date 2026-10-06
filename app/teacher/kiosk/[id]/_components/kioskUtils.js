// 키오스크 공용 계산 (화면 없이 테스트할 수 있게 분리)

/** 누적 경험치로 레벨 계산 (레벨마다 필요 경험치가 commonDifference씩 늘어나는 등차수열) */
export function getLevel(exp = 0, startExp = 100, commonDifference = 10) {
  const k = Math.floor(
    (-2 * startExp +
      commonDifference +
      Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * exp)) /
      (2 * commonDifference)
  );
  const sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);
  return sumK > exp ? k : k + 1;
}

/** "쿠키가 모자랍니다" / "호박이 모자랍니다" (받침에 따라 이/가) */
export function notEnoughMessage(currencyName = "화폐") {
  const code = currencyName.charCodeAt(currencyName.length - 1) - 44032;
  const hasJongseong = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${currencyName}${hasJongseong ? "이" : "가"} 모자랍니다.`;
}
