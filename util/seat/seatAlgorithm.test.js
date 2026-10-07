import { describe, it, expect } from "vitest";
import { makeLayout, deskSeats, partnerSeat, neighborSeats, assignSeats, violations, precheck, seatId } from "./seatAlgorithm.js";

// 재현 가능한 난수
function seeded(seed = 1) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const students = (n) => Array.from({ length: n }, (_, i) => `s${i + 1}`);

describe("교실 배치", () => {
  it("짝은 같은 줄 (0,1)(2,3) 칸, 책상이 없으면 짝 없음", () => {
    const layout = makeLayout(2, 4);
    expect(partnerSeat(layout, "0-0")).toBe("0-1");
    expect(partnerSeat(layout, "0-3")).toBe("0-2");
    layout.desks[1][1] = false;
    expect(partnerSeat(layout, "1-0")).toBeNull();
    expect(deskSeats(layout)).toHaveLength(7);
  });

  it("앞뒤·옆 자리", () => {
    const layout = makeLayout(3, 3);
    expect(neighborSeats(layout, "1-1").sort()).toEqual(["0-1", "1-0", "1-2", "2-1"]);
    expect(neighborSeats(layout, "0-0").sort()).toEqual(["0-1", "1-0"]);
  });
});

describe("자리 배치", () => {
  it("모든 학생이 서로 다른 책상에 앉는다", () => {
    const layout = makeLayout(6, 6);
    const res = assignSeats(students(30), layout, {}, { rng: seeded(3) });
    expect(res.ok).toBe(true);
    expect(Object.keys(res.assignment)).toHaveLength(30);
    expect(new Set(Object.values(res.assignment)).size).toBe(30);
    for (const s of Object.keys(res.assignment)) expect(deskSeats(layout)).toContain(s);
  });

  it("고정·앞자리·떨어뜨리기·지난 짝 조건을 지킨다 (여러 번 해도)", () => {
    const layout = makeLayout(5, 6);
    const ids = students(28);
    const prev = assignSeats(ids, layout, {}, { rng: seeded(9) }).assignment;
    const rules = {
      fixed: { s1: "4-5" },
      front: { userIds: ["s2", "s3", "s4"], rows: 1 },
      apart: [["s5", "s6"], ["s7", "s8"], ["s5", "s7"]],
      avoidPrevPartner: true,
    };
    for (let seed = 1; seed <= 20; seed++) {
      const res = assignSeats(ids, layout, rules, { rng: seeded(seed), prevAssignment: prev });
      expect(res.ok).toBe(true);
      expect(violations(res.assignment, layout, rules, prev)).toEqual([]);
      expect(res.assignment["4-5"]).toBe("s1");
    }
  });

  it("미리 알 수 있는 불가능한 조건은 이유를 알려준다", () => {
    expect(precheck(students(5), makeLayout(2, 2))).toMatch(/책상이 4개/);
    expect(precheck(students(3), makeLayout(2, 2), { front: { userIds: ["s1", "s2", "s3"], rows: 1 } })).toMatch(/앞쪽 1줄/);
    const layout = makeLayout(2, 2);
    layout.desks[0][0] = false;
    expect(precheck(students(2), layout, { fixed: { s1: "0-0" } })).toMatch(/책상이 없는/);
    expect(precheck(students(2), makeLayout(2, 2), { fixed: { s1: "0-0", s2: "0-0" } })).toMatch(/같은 자리/);
  });

  it("조건을 만족할 수 없으면 실패를 알려준다 (멈추지 않음)", () => {
    // 1×2 책상에 두 학생인데 서로 떨어뜨려야 함 → 불가능
    const res = assignSeats(["a", "b"], makeLayout(1, 2), { apart: [["a", "b"]] }, { rng: seeded(1), attempts: 3 });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/찾지 못했어요/);
  });

  it("지금 없는 학생의 조건은 무시한다", () => {
    const res = assignSeats(["a", "b"], makeLayout(1, 2), { fixed: { ghost: "0-0" }, apart: [["a", "ghost"]] }, { rng: seeded(2) });
    expect(res.ok).toBe(true);
    expect(seatId(0, 0) in res.assignment).toBe(true);
  });
});
