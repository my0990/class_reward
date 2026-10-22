// 일일·주간 퀘스트: 회차가 바뀌면 완료 명단이 비워지고, 지난 회차 신청은 보상만
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", async () => (await import("@/test/helpers/testMongo")).mongodbMock);
const { setupTestMongo, makeScope, seedStudent, getStudent } = await import("@/test/helpers/testMongo");
const quest = await import("./quest.service.js");
const req = await import("@/server-action/service/request/request.service");

const mongo = setupTestMongo();
const s = makeScope();
const ctx = { teacherObjectId: s.teacher_id, classObjectId: s.classId };
const teacher = { role: "teacher", teacherId: s.teacher_id };
const quests = () => mongo.db.collection("quest");
let qid;

beforeEach(async () => {
  await seedStudent(mongo.db, s, { userId: "a", money: 0, exp: 0 });
  await seedStudent(mongo.db, s, { userId: "b", money: 0, exp: 0 });
  const r = await quest.createQuestService({ teacher_id: s.teacher_id, classId: s.classId, questName: "줄넘기", questGoal: "100번", questReward: 5, questTitle: "줄넘기왕", repeat: "daily" });
  qid = r.questId;
});

// 하루가 지난 것처럼: 회차 표시를 예전 날짜로
const pretendYesterday = () => quests().updateOne({}, { $set: { cycleKey: "2000-01-01" } });

describe("회차 표시", () => {
  it("일일은 한국 날짜, 주간은 그 주 월요일, 일반은 없음", () => {
    const now = new Date("2026-10-22T15:30:00Z"); // 한국 10/23(금) 00:30
    expect(quest.cycleKeyOf("daily", now)).toBe("2026-10-23");
    expect(quest.cycleKeyOf("weekly", now)).toBe("w2026-10-19");
    expect(quest.cycleKeyOf("none", now)).toBeNull();
    expect(quest.cycleKeyOf("monthly", now)).toBeNull();
  });
});

describe("일일 퀘스트", () => {
  it("칭호는 저장되지 않는다", async () => {
    expect(await quests().findOne({})).toMatchObject({ repeat: "daily", questTitle: "" });
  });

  it("다음 날이 되면 완료 명단이 비워져 다시 할 수 있다", async () => {
    await req.createQuestRequestService({ ...ctx, userId: "a", questId: qid });
    await req.decideRequestsService({ ...ctx, actor: teacher, requestIds: (await mongo.db.collection("requests").find().toArray()).map((r) => String(r._id)), decision: "approve" });
    expect((await quests().findOne({})).finished).toEqual(["a"]);
    await expect(req.createQuestRequestService({ ...ctx, userId: "a", questId: qid })).rejects.toThrow("이미 완료한");

    await pretendYesterday();
    const [q] = await req.listKioskQuestsService(ctx);
    expect(q.finished).toEqual([]);
    await req.createQuestRequestService({ ...ctx, userId: "a", questId: qid }); // 오늘 것 다시 신청 가능
    expect((await getStudent(mongo.db, "a")).titles ?? []).toEqual([]); // 칭호 없음
  });

  it("어제 신청을 오늘 승인하면 보상만 주고 오늘 완료 명단에는 넣지 않는다", async () => {
    await req.createQuestRequestService({ ...ctx, userId: "b", questId: qid });
    await mongo.db.collection("requests").updateOne({}, { $set: { cycleKey: "2000-01-01" } }); // 어제 신청한 것처럼

    // 키오스크: 어제 신청은 오늘 '확인 중'으로 치지 않고, 오늘 것도 신청할 수 있다
    expect((await req.listKioskQuestsService(ctx))[0].pending).toEqual([]);
    const [row] = await req.listRequestsService({ ...ctx, status: "pending" });
    expect(row.target).toMatchObject({ stale: true, repeat: "daily", alreadyDone: false });

    const summary = await req.decideRequestsService({ ...ctx, actor: teacher, requestIds: [row._id], decision: "approve" });
    expect(summary).toMatchObject({ lateCycle: 1, approved: 0 });
    expect((await getStudent(mongo.db, "b")).money).toBe(5);
    expect((await quests().findOne({})).finished).toEqual([]);
    await req.createQuestRequestService({ ...ctx, userId: "b", questId: qid });
  });

  it("일반 퀘스트로 바꾸면 더는 비워지지 않는다", async () => {
    await quests().updateOne({}, { $set: { finished: ["a"] } });
    await quest.editQuestService({ teacher_id: s.teacher_id, classId: s.classId, questId: qid, questName: "줄넘기", questGoal: "100번", questTitle: "왕", repeat: "none" });
    expect(await quests().findOne({})).toMatchObject({ repeat: "none", cycleKey: null, questTitle: "왕", finished: ["a"] });
    await quest.refreshQuestCycles(mongo.db, { teacher_id: s.teacherObjectId, classId: s.classObjectId }, new Date("2030-01-01"));
    expect((await quests().findOne({})).finished).toEqual(["a"]);
  });
});
