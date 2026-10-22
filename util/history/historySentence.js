// 학급 기록 한 줄을 문장으로: "3번 문어가 10쿠키를 기부하였습니다."
// 화면에서 '누가'(묶음이면 눌러서 펼치기)와 '금액'을 강조하려고 조각(segments)으로 돌려준다.
//   { t: "text", v } · { t: "who", v } · { t: "amount", v } · { t: "item", v }

// 숫자를 읽을 때 받침이 있는지 (0영 1일 3삼 6육 7칠 8팔)
const DIGIT_BATCHIM = new Set(["0", "1", "3", "6", "7", "8"]);

/** 앞말의 받침에 따라 조사 고르기: josa("문어", "이", "가") → "가". 알 수 없으면 "이(가)" */
export function josa(word, withBatchim, without) {
  const ch = String(word ?? "").trim().slice(-1);
  if (!ch) return `${withBatchim}(${without})`;
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    // '로'는 ㄹ받침 뒤에서도 '로' (예: 연필로)
    if (withBatchim === "으로") return jong === 0 || jong === 8 ? without : withBatchim;
    return jong === 0 ? without : withBatchim;
  }
  if (/[0-9]/.test(ch)) return DIGIT_BATCHIM.has(ch) ? withBatchim : without;
  return `${withBatchim}(${without})`;
}

const itemOf = (name, suffix) => String(name ?? "").replace(suffix, "").trim();

/**
 * kind: grant|take|buy|quest|donate|use|income|spend (utils/historyKind)
 * who: "3번 문어" 또는 "3번 문어 외 24명", many: 여러 명 묶음인지
 */
export function historySentence({ kind, who, many = false, name, amount, currency = "" }) {
  const money = `${Number(amount ?? 0).toLocaleString()}${currency}`;
  const W = { t: "who", v: who };
  const A = { t: "amount", v: money };
  const T = (v) => ({ t: "text", v });
  const I = (v) => ({ t: "item", v });
  const ga = josa(who, "이", "가");
  const reul = josa(money, "을", "를");
  const each = many ? "각각 " : "";

  switch (kind) {
    case "grant":
      return [T("선생님이 "), W, T(`에게 ${each}`), A, T(`${reul} 지급하였습니다.`)];
    case "take":
      return [T("선생님이 "), W, T(`에게서 ${each}`), A, T(`${reul} 회수하였습니다.`)];
    case "donate":
      return [W, T(`${ga} ${each}`), A, T(`${reul} 기부하였습니다.`)];
    case "quest":
      return [W, T(`${ga} 퀘스트를 완료하고 ${each}`), A, T(`${reul} 받았습니다.`)];
    case "buy": {
      const item = name === "프로필 구입" ? "프로필" : itemOf(name, / 구입$/);
      return [W, T(`${ga} `), I(item), T(`${josa(item, "을", "를")} ${each}`), A, T("에 구입하였습니다.")];
    }
    case "use": {
      const m = String(name ?? "").match(/^아이템 사용\s*[(:]\s*(.*?)\)?$/);
      const item = m?.[1] || "아이템";
      return [W, T(`${ga} `), I(item), T(`${josa(item, "을", "를")} 사용하였습니다.`)];
    }
    case "income":
      return [W, T(`${ga} `), I(name || "입금"), T(`${josa(name || "입금", "으로", "로")} ${each}`), A, T(`${reul} 받았습니다.`)];
    default:
      return [W, T(`${ga} `), I(name || "출금"), T(`${josa(name || "출금", "으로", "로")} ${each}`), A, T(`${reul} 썼습니다.`)];
  }
}

/** 조각을 그냥 글자로 (테스트·title용) */
export const sentenceText = (segs) => segs.map((s) => s.v).join("");
