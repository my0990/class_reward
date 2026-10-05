// DB 인덱스 정리
//
//   node scripts/db/indexes.mjs           ← 연습 실행: 만들/바꿀 인덱스와 중복 데이터만 보여줌
//   node scripts/db/indexes.mjs --apply   ← 실제로 적용
//
// - 거래 기록 30일 자동 삭제(TTL) 인덱스는 그대로 둔다 (건드리지 않음).
// - "중복 금지" 인덱스는 중복 데이터가 0건일 때만 만든다. 중복이 있으면 건너뛰고 알려준다.
// - 같은 필드에 이미 일반 인덱스가 있으면, 그것을 지우고 중복 금지 인덱스로 바꾼다.
import { connect } from "./_common.mjs";

const APPLY = process.argv.includes("--apply");
const client = await connect();
const data = client.db("data");
const user = client.db("user");

// 빈 문자열/없는 값은 중복 검사에서 제외 (학생은 email이 없고, 교사는 userId가 없을 수 있다)
const nonEmpty = (field) => ({ [field]: { $gt: "" } });

const PLAN = [
  // [db, 컬렉션, 키, 옵션, 설명]
  [data, "user_data", { userId: 1 }, { unique: true, partialFilterExpression: nonEmpty("userId"), name: "userId_unique" }, "학생 아이디 중복 금지"],
  [data, "user_data", { teacher_id: 1, classId: 1, userId: 1 }, {}, "학급별 학생 조회"],
  [data, "history", { userId: 1, date: -1 }, {}, "학생 거래 내역 조회 (최신순)"],
  [data, "class_data", { teacher_id: 1, classId: 1 }, {}, "학급 정보 조회"],
  [data, "class_data", { uniqueNickname: 1 }, { unique: true, partialFilterExpression: nonEmpty("uniqueNickname"), name: "uniqueNickname_unique" }, "학급 고유 별명 중복 금지"],
  [data, "thermometer", { teacher_id: 1, classId: 1 }, {}, "학급 온도계 조회"],
  [user, "users", { userId: 1 }, { unique: true, partialFilterExpression: nonEmpty("userId"), name: "userId_unique" }, "로그인 아이디 중복 금지"],
  [user, "users", { email: 1 }, { unique: true, partialFilterExpression: nonEmpty("email"), name: "email_unique" }, "교사 이메일 중복 금지"],
  [user, "email_verifications", { email: 1 }, { unique: true, name: "email_unique" }, "인증 요청 이메일당 1개"],
  [user, "kiosk_pwd_attempts", { teacher_id: 1, userId: 1 }, { unique: true, name: "teacher_user_unique" }, "키오스크 비밀번호 시도 기록"],
  [user, "kiosk_pwd_attempts", { updatedAt: 1 }, { expireAfterSeconds: 24 * 60 * 60, name: "updatedAt_ttl_1d" }, "키오스크 시도 기록 하루 뒤 자동 삭제"],
];

const sameKey = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const lines = [];

async function duplicateCount(col, key, partial) {
  const fields = Object.keys(key);
  const group = Object.fromEntries(fields.map((f) => [f.replace(/\./g, "_"), `$${f}`]));
  const r = await col
    .aggregate([
      ...(partial ? [{ $match: partial }] : []),
      { $group: { _id: group, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
      { $count: "groups" },
    ])
    .toArray();
  return r[0]?.groups ?? 0;
}

try {
  for (const [db, name, key, options, label] of PLAN) {
    const col = db.collection(name);
    const where = `${db.databaseName}.${name} {${Object.entries(key).map(([k, v]) => `${k}:${v}`).join(",")}}`;
    const existing = (await db.listCollections({ name }).toArray()).length ? await col.indexes() : [];
    const sameKeyIdx = existing.filter((i) => sameKey(i.key, key));

    // 이미 원하는 형태로 있음
    const done = sameKeyIdx.find(
      (i) => !!i.unique === !!options.unique && (options.expireAfterSeconds === undefined || i.expireAfterSeconds === options.expireAfterSeconds)
    );
    if (done) {
      lines.push(`- ✅ ${label}: 이미 있음 (${where})`);
      continue;
    }

    if (options.unique) {
      const dups = await duplicateCount(col, key, options.partialFilterExpression);
      if (dups > 0) {
        lines.push(`- ⚠️ ${label}: 중복 ${dups}건이 있어서 건너뜀 (${where}) — 중복을 먼저 정리해야 함`);
        continue;
      }
    }

    const toDrop = sameKeyIdx.filter((i) => i.name !== "_id_");
    const dropNote = toDrop.length ? ` (기존 일반 인덱스 ${toDrop.map((i) => i.name).join(", ")}를 바꿈)` : "";

    if (!APPLY) {
      lines.push(`- ➕ ${label}: 만들 예정${dropNote} (${where})`);
      continue;
    }

    for (const i of toDrop) await col.dropIndex(i.name);
    await col.createIndex(key, options);
    lines.push(`- ✅ ${label}: 만들었음${dropNote} (${where})`);
  }

  const ttl = (await data.collection("history").indexes()).find((i) => i.expireAfterSeconds !== undefined);
  lines.push(
    `\n거래 기록 자동 삭제: ${ttl ? `유지 (${Math.round(ttl.expireAfterSeconds / 86400)}일)` : "없음"} — 이 스크립트는 건드리지 않습니다.`
  );

  console.log(
    `# DB 인덱스 ${APPLY ? "적용 결과" : "연습 실행(dry-run) — 아무것도 바뀌지 않았습니다"}\n` +
      `실행 시각: ${new Date().toISOString()}\n\n` +
      lines.join("\n") +
      (APPLY ? "" : "\n\n실제로 적용하려면: npm run db:indexes -- --apply")
  );
} finally {
  await client.close();
}
