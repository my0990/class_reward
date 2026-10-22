import { NextResponse } from "next/server";
import { withApiHandler, requireTeacher, parseObjectId, requireActiveClass, parseIntParam } from "@/lib/api/routeHelpers";
import {
  getClassHistoryService,
  CLASS_HISTORY_KINDS,
  CLASS_HISTORY_PERIODS,
  CLASS_HISTORY_PAGE,
  CLASS_HISTORY_MAX,
} from "@/server-action/service/history/classHistory.service";

// 학급 기록 (담임 교사만): ?kinds=grant,take&userId=..&period=today|7d|all&cursor=..&limit=50
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireTeacher();
  await requireActiveClass(teacherObjectId, classObjectId);

  const q = new URL(req.url).searchParams;
  const kinds = (q.get("kinds") ?? "").split(",").filter((k) => CLASS_HISTORY_KINDS.includes(k));
  const period = CLASS_HISTORY_PERIODS.includes(q.get("period")) ? q.get("period") : "all";
  const userId = q.get("userId")?.slice(0, 100) || null;
  const limit = parseIntParam(q.get("limit"), { defaultValue: CLASS_HISTORY_PAGE, min: 1, max: CLASS_HISTORY_MAX });

  const result = await getClassHistoryService({
    teacherObjectId,
    classObjectId,
    kinds,
    userId,
    period,
    cursor: q.get("cursor"),
    limit,
  });
  return NextResponse.json(result);
});
