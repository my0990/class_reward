import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupTestMongo, makeScope, seedStudent, seedClassData } from "@/test/helpers/testMongo";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { saveSeatSetupService, confirmSeatsService, deleteSeatRecordService, SEAT_HISTORY_MAX } = await import("./seat.service.js");
const { makeLayout } = await import("@/util/seat/seatAlgorithm.js");

const mongo = setupTestMongo();
const scope = makeScope();
const args = { teacher_id: scope.teacher_id, classId: scope.classId };
const plan = async () => (await mongo.db.collection("class_data").findOne({ classId: scope.classObjectId })).seatPlan;

beforeEach(async () => {
  await seedClassData(mongo.db, scope);
  for (const u of ["a", "b", "c"]) await seedStudent(mongo.db, scope, { userId: u });
});

describe("자리 바꾸기 저장", () => {
  it("교실 배치 범위를 확인한다", async () => {
    expect((await saveSeatSetupService({ ...args, layout: { rows: 0, cols: 3 } })).ok).toBe(false);
    expect((await saveSeatSetupService({ ...args, layout: { rows: 11, cols: 3 } })).ok).toBe(false);
  });

  it("조건에서 다른 반 학생·책상 없는 자리·중복을 걸러 저장한다", async () => {
    const layout = makeLayout(2, 2);
    layout.desks[1][1] = false;
    const res = await saveSeatSetupService({
      ...args,
      layout,
      rules: {
        fixed: { a: "0-0", b: "1-1", outsider: "0-1" },
        front: { userIds: ["c", "c", "outsider"], rows: 9 },
        apart: [["a", "b"], ["b", "a"], ["a", "a"], ["a", "outsider"]],
        avoidPrevPartner: 1,
      },
    });
    expect(res.ok).toBe(true);
    const saved = await plan();
    // 예전 앞자리(front)는 '앞자리' 그룹으로 (책상 있는 앞 2줄 자리)
    expect(saved.rules).toEqual({
      fixed: { a: "0-0" },
      groups: [{ id: "front", name: "앞자리", color: 0, userIds: ["c"], seats: ["0-0", "0-1", "1-0"] }],
      apart: [["a", "b"]],
      avoidPrevPartner: true,
      excluded: [],
    });
    expect(saved.layout.desks[1][1]).toBe(false);
  });

  it("확정: 모든 학생이 책상에 한 번씩 있어야 하고, 이전 자리는 기록으로 (최대 5번)", async () => {
    await saveSeatSetupService({ ...args, layout: makeLayout(2, 2), rules: {} });
    expect((await confirmSeatsService({ ...args, assignment: { "0-0": "a", "0-1": "b" } })).ok).toBe(false); // c 없음
    expect((await confirmSeatsService({ ...args, assignment: { "0-0": "a", "0-1": "a", "1-0": "c" } })).ok).toBe(false); // 중복
    expect((await confirmSeatsService({ ...args, assignment: { "0-0": "a", "0-1": "b", "5-5": "c" } })).ok).toBe(false); // 없는 자리

    for (let i = 0; i < SEAT_HISTORY_MAX + 2; i++) {
      const res = await confirmSeatsService({ ...args, assignment: { "0-0": "a", "0-1": "b", "1-0": "c" }, now: new Date(2026, 0, i + 1) });
      expect(res.ok).toBe(true);
    }
    const saved = await plan();
    expect(saved.current.confirmedAt).toEqual(new Date(2026, 0, SEAT_HISTORY_MAX + 2));
    expect(saved.history).toHaveLength(SEAT_HISTORY_MAX);
    expect(saved.history[0].confirmedAt).toEqual(new Date(2026, 0, SEAT_HISTORY_MAX + 1)); // 최신이 앞
  });

  it("그룹: 이름·색·학생·자리를 정리해 저장 (한 학생이 여러 그룹 가능)", async () => {
    const layout = makeLayout(2, 2);
    layout.desks[1][1] = false;
    await saveSeatSetupService({
      ...args,
      layout,
      rules: {
        groups: [
          { id: "x", name: "  창가  ", color: 3, userIds: ["a", "a", "outsider"], seats: ["0-1", "1-1", "9-9", "0-1"] },
          { id: "x", name: "", color: 99, userIds: ["a", "b"], seats: [] },
          "이상한 값",
        ],
      },
    });
    const { groups } = (await plan()).rules;
    expect(groups).toEqual([
      { id: "x", name: "창가", color: 3, userIds: ["a"], seats: ["0-1"] },
      { id: "x_", name: "그룹 2", color: 1, userIds: ["a", "b"], seats: [] },
    ]);
  });

  it("다시 섞기(replace)는 지금 자리만 바꾸고 기록에 넣지 않음", async () => {
    await saveSeatSetupService({ ...args, layout: makeLayout(2, 2), rules: {} });
    const a = { "0-0": "a", "0-1": "b", "1-0": "c" };
    const b = { "0-0": "b", "0-1": "c", "1-0": "a" };
    await confirmSeatsService({ ...args, assignment: a, now: new Date(2026, 0, 1) });
    await confirmSeatsService({ ...args, assignment: b, now: new Date(2026, 0, 2) }); // 새 자리 → a는 기록으로
    await confirmSeatsService({ ...args, assignment: a, replace: true, now: new Date(2026, 0, 3) }); // 다시 섞기
    const saved = await plan();
    expect(saved.current.assignment).toEqual(a);
    expect(saved.history).toHaveLength(1);
    expect(saved.history[0].confirmedAt).toEqual(new Date(2026, 0, 1));
  });

  it("뺀 학생(excluded)은 자리 없이 저장할 수 있다", async () => {
    await saveSeatSetupService({ ...args, layout: makeLayout(2, 2), rules: { excluded: ["c", "c", "outsider"] } });
    expect((await plan()).rules.excluded).toEqual(["c"]);
    expect((await confirmSeatsService({ ...args, assignment: { "0-0": "a", "0-1": "b" } })).ok).toBe(true);
    expect((await confirmSeatsService({ ...args, assignment: { "0-0": "a", "0-1": "b", "1-0": "c" } })).ok).toBe(false); // 뺀 학생이 들어 있음
    expect((await confirmSeatsService({ ...args, assignment: { "0-0": "a" } })).ok).toBe(false); // b 빠짐
  });

  it("기록 지우기: 지난 자리는 빠지고, 지금 자리를 지우면 가장 최근 지난 자리가 지금 자리로", async () => {
    await saveSeatSetupService({ ...args, layout: makeLayout(2, 2), rules: {} });
    const a = { "0-0": "a", "0-1": "b", "1-0": "c" };
    const d = (n) => new Date(2026, 0, n);
    for (const n of [1, 2, 3]) await confirmSeatsService({ ...args, assignment: a, now: d(n) });
    expect((await plan()).current.layout).toEqual(makeLayout(2, 2)); // 저장할 때 배치도 같이

    expect((await deleteSeatRecordService({ ...args, at: d(1).toISOString() })).ok).toBe(true);
    let p = await plan();
    expect(p.history.map((r) => r.confirmedAt)).toEqual([d(2)]);

    await deleteSeatRecordService({ ...args, at: d(3).toISOString() }); // 지금 자리
    p = await plan();
    expect(p.current.confirmedAt).toEqual(d(2));
    expect(p.history).toEqual([]);

    expect((await deleteSeatRecordService({ ...args, at: d(9).toISOString() })).ok).toBe(false);
    expect((await deleteSeatRecordService({ ...args, at: "이상한 값" })).ok).toBe(false);
  });

  it("교실 배치 없이 확정하면 안내", async () => {
    expect((await confirmSeatsService({ ...args, assignment: {} })).message).toMatch(/교실 배치/);
  });
});
