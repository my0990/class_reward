import { describe, it, expect } from "vitest";
import { getHistoryKind } from "./historyKind.js";

describe("getHistoryKind (거래 내역 종류)", () => {
  it.each([
    [{ name: "아이템 사용 (사탕)", type: "출금", amount: 0 }, "use"],
    [{ name: "아무 이름", kind: "itemUse" }, "use"],
    [{ name: "기부", type: "출금" }, "donate"],
    [{ name: "퀘스트 완료", type: "입금" }, "quest"],
    [{ name: "선생님에게 받음", type: "입금" }, "grant"],
    [{ name: "선생님에게 뺏김", type: "출금" }, "take"],
    [{ name: "사탕 구입", type: "출금" }, "buy"],
    [{ name: "프로필 구입", type: "출금" }, "buy"],
    [{ name: "알 수 없음", type: "deposit" }, "income"],
    [{ name: "알 수 없음", type: "withDrawal" }, "spend"],
    [{}, "spend"],
  ])("%j → %s", (item, kind) => {
    expect(getHistoryKind(item)).toBe(kind);
  });
});
