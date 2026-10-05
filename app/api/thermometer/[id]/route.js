import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireMember, parseObjectId, requireActiveClass } from "@/lib/api/routeHelpers";

const DEFAULT_THERMOMETER = {
  manualDegree: 0,       // 선생님이 직접 올린 온도
  requireCurrency: 30,   // 1도 올리는 데 필요한 화폐 수
  reward: {
    10: "", 20: "", 30: "", 40: "", 50: "",
    60: "", 70: "", 80: "", 90: "", 100: "",
  },
  donators: {},
};

// 학급 온도계 (교사 + 그 반 학생)
export const GET = withApiHandler(async (req, { params }) => {
  const { id } = await params;
  const classObjectId = parseObjectId(id, "학급 id");
  const { teacherObjectId } = await requireMember({ classId: id });
  await requireActiveClass(teacherObjectId, classObjectId);

  const db = (await connectDB).db("data");
  const thermometerData = await db.collection("thermometer").findOne({
    classId: classObjectId,
    teacher_id: teacherObjectId,
  });

  // DB에 데이터가 없으면 기본값 내려주기
  if (!thermometerData) {
    return NextResponse.json({
      ...DEFAULT_THERMOMETER,
      classId: id,
      teacher_id: teacherObjectId.toHexString(),
      isDefault: true, // 프론트에서 신규 여부 확인용
    });
  }

  // 일부 필드만 없는 경우도 안전하게 병합
  return NextResponse.json({
    ...DEFAULT_THERMOMETER,
    ...thermometerData,
    reward: { ...DEFAULT_THERMOMETER.reward, ...(thermometerData.reward || {}) },
    donators: { ...(thermometerData.donators || {}) },
  });
});
