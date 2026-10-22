import { describe, it, expect } from "vitest";
import { compressNumbers, summarizeSelection } from "./selectionSummary.js";

describe("선택 학생 요약", () => {
  it("이어지는 번호는 3개부터 묶는다", () => {
    expect(compressNumbers([5, 1, 2, 3, 8, 10, 11])).toBe("1~3, 5, 8, 10, 11");
    expect(compressNumbers(["12", "13", "14", "14"])).toBe("12~14");
    expect(compressNumbers([])).toBe("");
  });

  it("인원에 따라 보여주는 방식", () => {
    const s = (n) => ({ userId: `u${n}`, label: `${n}번 학생${n}`, classNumber: n });
    expect(summarizeSelection([s(1), s(2), s(3)], 25).mode).toBe("names");
    expect(summarizeSelection([s(1), s(2), s(3), s(7)], 25)).toEqual({ mode: "numbers", count: 4, numbers: "1~3, 7", others: [] });
    expect(summarizeSelection([s(1), s(2), s(3), s(4)], 4).mode).toBe("all");
    // 번호 없는 학생은 이름으로 따로
    expect(summarizeSelection([s(1), s(2), s(3), { userId: "x", label: "새학생" }], 25)).toMatchObject({ numbers: "1~3", others: ["새학생"] });
  });
});
