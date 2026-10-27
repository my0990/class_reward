// 화면에서만 도는 기능 사용 알림 받기 (lib/stats/trackFeature) → admins.feature_usage
// 그 반 선생님만 (다른 반 숫자를 부풀리지 못하게). 이 기능들은 선생님 화면에만 있다.
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { withApiHandler, requireSession, parseObjectId, ApiError } from "@/lib/api/routeHelpers";
import { CLIENT_FEATURE_KEYS } from "@/lib/stats/featureList";
import { recordFeatureUse } from "@/lib/stats/featureUsage";

export const POST = withApiHandler(async (req) => {
  const text = await req.text();
  if (text.length > 500) throw new ApiError(413, "너무 큽니다.");
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new ApiError(400, "잘못된 요청입니다.");
  }
  if (!CLIENT_FEATURE_KEYS.includes(body?.feature)) throw new ApiError(400, "알 수 없는 기능입니다.");

  const { user } = await requireSession();
  const classObjectId = parseObjectId(body.classId, "classId");
  const classId = classObjectId.toHexString();

  if (user.role !== "teacher") throw new ApiError(403, "교사만 사용할 수 있습니다.");
  const owned = await (await connectDB)
    .db("data")
    .collection("classes")
    .countDocuments({ _id: classObjectId, teacher_id: ObjectId.createFromHexString(user._id) }, { limit: 1 });
  if (!owned) throw new ApiError(403, "권한이 없습니다.");

  await recordFeatureUse(body.feature, { classId });
  return new NextResponse(null, { status: 204 });
});
