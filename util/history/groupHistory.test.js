import { describe, it, expect } from "vitest";
import { groupHistory, splitByDay } from "./groupHistory.js";

const t = (iso) => new Date(iso).toISOString();
const row = (id, date, extra = {}) => ({ _id: id, userId: `s${id}`, date: t(date), name: "선생님에게 받음", type: "입금", amount: 10, ...extra });

describe("학급 기록 묶기", () => {
  it("같은 순간·같은 내용만 한 줄로", () => {
    const g = groupHistory([
      row(1, "2026-10-22T03:00:00Z"),
      row(2, "2026-10-22T03:00:00Z"),
      row(3, "2026-10-22T03:00:00Z", { amount: 5 }), // 금액이 다르면 따로
      row(4, "2026-10-22T02:00:00Z"),
      row(5, "2026-10-22T02:00:00Z", { name: "기부", type: "출금" }),
    ]);
    expect(g.map((x) => x.items.length)).toEqual([2, 1, 1, 1]);
    expect(g[0].key).toBe("1");
  });

  it("이유(memo)가 다르면 따로, 같으면 한 줄 + 이유를 묶음에 담는다", () => {
    const g = groupHistory([
      row(1, "2026-10-22T03:00:00Z", { memo: "발표" }),
      row(2, "2026-10-22T03:00:00Z", { memo: "발표" }),
      row(3, "2026-10-22T03:00:00Z", { memo: "청소" }),
      row(4, "2026-10-22T03:00:00Z"),
    ]);
    expect(g.map((x) => [x.items.length, x.memo])).toEqual([
      [2, "발표"],
      [1, "청소"],
      [1, null],
    ]);
  });

  it("날짜별로 나눈다", () => {
    const days = splitByDay(groupHistory([row(1, "2026-10-22T03:00:00Z"), row(2, "2026-10-21T03:00:00Z")]));
    expect(days).toHaveLength(2);
    expect(days[0].groups).toHaveLength(1);
  });
});
