import { NextResponse } from "next/server";
import { withApiHandler, requireTeacher } from "@/lib/api/routeHelpers";
import { listDeletedClassesService } from "@/server-action/service/class/deleteClass.service";

// 교사의 휴지통(삭제된 학급) 목록 — 학생 수와 영구 삭제 예정일(purgeAt) 포함
export const GET = withApiHandler(async () => {
  const { teacher_id } = await requireTeacher();
  return NextResponse.json(await listDeletedClassesService({ teacher_id }));
});
