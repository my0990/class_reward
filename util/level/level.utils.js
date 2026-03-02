// utils/exp/calculateLevel.js
export function calculateLevel({ exp, startExp = 100, commonDifference = 10 }) {
    const safeExp = Number(exp ?? 0);
    if (commonDifference <= 0) return 1;
  
    const k = Math.floor(
      (-2 * startExp +
        commonDifference +
        Math.sqrt(
          (2 * startExp - commonDifference) ** 2 +
            8 * commonDifference * safeExp
        )) /
        (2 * commonDifference)
    );
  
    const sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);
    return sumK > safeExp ? k : k + 1;
  }