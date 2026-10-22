import { describe, it, expect } from "vitest";
import { josa, historySentence, sentenceText } from "./historySentence.js";

const say = (o) => sentenceText(historySentence({ currency: "쿠키", amount: 10, ...o }));

describe("학급 기록 문장", () => {
  it("받침에 맞는 조사", () => {
    expect(josa("문어", "이", "가")).toBe("가");
    expect(josa("홍길동", "이", "가")).toBe("이");
    expect(josa("10원", "을", "를")).toBe("을");
    expect(josa("10쿠키", "을", "를")).toBe("를");
    expect(josa("3", "이", "가")).toBe("이"); // 삼
    expect(josa("2", "이", "가")).toBe("가"); // 이
    expect(josa("연필", "으로", "로")).toBe("로");
    expect(josa("책", "으로", "로")).toBe("으로");
    expect(josa("Tom", "이", "가")).toBe("이(가)");
  });

  it("종류별 문장", () => {
    expect(say({ kind: "donate", who: "3번 문어" })).toBe("3번 문어가 10쿠키를 기부하였습니다.");
    expect(say({ kind: "grant", who: "3번 문어 외 24명", many: true })).toBe("선생님이 3번 문어 외 24명에게 각각 10쿠키를 지급하였습니다.");
    expect(say({ kind: "take", who: "5번 홍길동" })).toBe("선생님이 5번 홍길동에게서 10쿠키를 회수하였습니다.");
    expect(say({ kind: "quest", who: "5번 홍길동" })).toBe("5번 홍길동이 퀘스트를 완료하고 10쿠키를 받았습니다.");
    expect(say({ kind: "buy", who: "3번 문어", name: "연필 구입" })).toBe("3번 문어가 연필을 10쿠키에 구입하였습니다.");
    expect(say({ kind: "buy", who: "3번 문어", name: "프로필 구입" })).toBe("3번 문어가 프로필을 10쿠키에 구입하였습니다.");
    expect(say({ kind: "use", who: "3번 문어", name: "아이템 사용 (자리 바꾸기권)" })).toBe("3번 문어가 자리 바꾸기권을 사용하였습니다.");
    expect(say({ kind: "income", who: "3번 문어", name: "이벤트" })).toBe("3번 문어가 이벤트로 10쿠키를 받았습니다.");
  });
});
