import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireTeacher, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";
import { refreshQuestCycles } from "@/server-action/service/quest/quest.service";
import { closeAlreadyDoneRequests } from "@/server-action/service/request/request.service";

// 학급 퀘스트 목록 (교사)
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireTeacher();
  await requireActiveClass(teacherObjectId, classObjectId);

  const db = (await connectDB).db("data");
  await refreshQuestCycles(db, { teacher_id: teacherObjectId, classId: classObjectId }); // 일일·주간 퀘스트 회차가 바뀌었으면 먼저 비움
  await closeAlreadyDoneRequests(db, { teacher_id: teacherObjectId, classId: classObjectId }); // 이미 완료한 학생의 신청은 처리 완료로
  const quests = await db
    .collection("quest")
    .find({ teacher_id: teacherObjectId, classId: classObjectId }, { projection: { code: 0 } })
    // 정렬 규칙 (README "순서 규칙" 참고)
    // - order: 교사가 드래그로 정한 순서 (0, 1, 2…)
    // - 새로 만든 퀘스트는 order가 없다 → MongoDB 오름차순 정렬에서 "없는 값"은 숫자보다 앞이라 맨 위에 나온다 (의도된 동작)
    // - order가 없는 것끼리는 최신순
    .sort({ order: 1, time: -1 })
    .toArray();

  // 승인 대기: 키오스크에서 학생이 완료를 신청했지만 아직 승인 센터에서 처리하지 않은 학생 (이번 회차 것만)
  const pending = await db
    .collection("requests")
    .find({ teacher_id: teacherObjectId, classId: classObjectId, type: "quest", status: "pending" }, { projection: { targetId: 1, userId: 1, cycleKey: 1 } })
    .toArray();
  const cycleOf = new Map(quests.map((q) => [String(q._id), q.cycleKey ?? null]));
  const pendingByQuest = new Map();
  for (const p of pending) {
    const k = String(p.targetId);
    if (!cycleOf.has(k) || (p.cycleKey ?? null) !== cycleOf.get(k)) continue; // 지난 회차 신청은 빼고
    if (!pendingByQuest.has(k)) pendingByQuest.set(k, []);
    pendingByQuest.get(k).push(p.userId);
  }

  return NextResponse.json(quests.map((q) => ({ ...q, pending: pendingByQuest.get(String(q._id)) ?? [] })));
});
