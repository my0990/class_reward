// 예전 자리 바꾸기 데이터(class_data.gridData, groupData) 지우기
// 새 자리 바꾸기는 class_data.seatPlan을 쓴다. 새 기능을 확인한 뒤에 실행하세요.
//
//   npm run db:drop-legacy-seat              ← 연습 실행: 지울 학급 수만 보여줌
//   npm run db:drop-legacy-seat -- --apply   ← 실제로 지움 (먼저 npm run db:backup 권장)
import { connect } from "./_common.mjs";

const APPLY = process.argv.includes("--apply");
const client = await connect();
try {
  const col = client.db("data").collection("class_data");
  const filter = { $or: [{ gridData: { $exists: true } }, { groupData: { $exists: true } }] };
  const n = await col.countDocuments(filter);
  if (!APPLY) {
    console.log(`# 연습 실행 — 예전 자리 데이터가 있는 학급: ${n}개\n실제로 지우려면: npm run db:drop-legacy-seat -- --apply`);
  } else {
    const r = await col.updateMany(filter, { $unset: { gridData: "", groupData: "" } });
    console.log(`✅ ${r.modifiedCount}개 학급에서 예전 자리 데이터(gridData, groupData)를 지웠습니다.`);
  }
} finally {
  await client.close();
}
