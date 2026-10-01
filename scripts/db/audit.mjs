// DB 점검 (읽기 전용 — 아무것도 바꾸지 않는다)
//
//   node scripts/db/audit.mjs
//
// 개수만 출력한다. 학생 이름·아이디 같은 개인정보는 출력하지 않는다.
import { connect, isIntString, typeName } from "./_common.mjs";

const client = await connect();
const data = client.db("data");
const user = client.db("user");

const out = [];
const section = (title) => out.push(`\n## ${title}`);
const row = (label, value, note = "") =>
  out.push(`- ${label}: ${value}${note ? `  (${note})` : ""}`);

// 문자열 값 분류: 정수로 바꿀 수 있는 것 / 없는 것
function bucket() {
  return { total: 0, number: 0, convertible: 0, broken: 0, missing: 0, otherTypes: {} };
}
function classify(b, v, opts) {
  b.total++;
  if (typeof v === "number") b.number++;
  else if (v === undefined || v === null) b.missing++;
  else if (isIntString(v, opts)) b.convertible++;
  else if (typeof v === "string") b.broken++;
  else b.otherTypes[typeName(v)] = (b.otherTypes[typeName(v)] ?? 0) + 1;
}
function report(label, b) {
  const extra = Object.keys(b.otherTypes).length ? `, 기타 ${JSON.stringify(b.otherTypes)}` : "";
  row(
    label,
    `전체 ${b.total} / 숫자 ${b.number} / 문자열(변환 가능) ${b.convertible} / 문자열(변환 불가) ${b.broken} / 비어있음 ${b.missing}${extra}`
  );
}

try {
  // ---------------- class_data ----------------
  section("학급 데이터 (data.class_data)");
  const itemPrice = bucket(), itemStock = bucket(), profilePrice = bucket();
  let classCount = 0;
  for await (const c of data.collection("class_data").find({}, { projection: { itemList: 1, profileImgStorage: 1 } })) {
    classCount++;
    for (const it of c.itemList ?? []) {
      classify(itemPrice, it?.itemPrice);
      classify(itemStock, it?.itemStock);
    }
    for (const p of Object.values(c.profileImgStorage ?? {})) classify(profilePrice, p?.price);
  }
  row("학급 수", classCount);
  report("마켓 아이템 가격", itemPrice);
  report("마켓 아이템 재고", itemStock);
  report("프로필 이미지 가격", profilePrice);

  // ---------------- user_data ----------------
  section("학생/교사 데이터 (data.user_data)");
  const money = bucket(), exp = bucket(), invPrice = bucket();
  const idTypes = { teacher_id: {}, classId: {} };
  let students = 0, teachers = 0;
  for await (const u of data.collection("user_data").find(
    {},
    { projection: { role: 1, money: 1, exp: 1, itemList: 1, teacher_id: 1, classId: 1 } }
  )) {
    if (u.role === "teacher") { teachers++; continue; }
    students++;
    classify(money, u.money, { allowNegative: true });
    classify(exp, u.exp);
    for (const it of u.itemList ?? []) classify(invPrice, it?.itemPrice);
    for (const k of ["teacher_id", "classId"]) {
      const t = typeName(u[k]);
      idTypes[k][t] = (idTypes[k][t] ?? 0) + 1;
    }
  }
  row("학생 수 / 교사 수", `${students} / ${teachers}`);
  report("학생 잔액(money)", money);
  report("학생 경험치(exp)", exp);
  report("인벤토리 아이템 가격", invPrice);
  row("학생 teacher_id 형식", JSON.stringify(idTypes.teacher_id));
  row("학생 classId 형식", JSON.stringify(idTypes.classId));

  // ---------------- history ----------------
  section("거래 기록 (data.history)");
  const amount = bucket(), balance = bucket();
  const hIdTypes = { teacher_id: {}, classId: {} };
  const kinds = {};
  let hCount = 0, oldest = null, newest = null;
  for await (const h of data.collection("history").find(
    {},
    { projection: { amount: 1, balance: 1, type: 1, teacher_id: 1, classId: 1, date: 1 } }
  )) {
    hCount++;
    classify(amount, h.amount);
    classify(balance, h.balance, { allowNegative: true });
    kinds[h.type ?? "없음"] = (kinds[h.type ?? "없음"] ?? 0) + 1;
    for (const k of ["teacher_id", "classId"]) {
      const t = typeName(h[k]);
      hIdTypes[k][t] = (hIdTypes[k][t] ?? 0) + 1;
    }
    if (h.date instanceof Date) {
      if (!oldest || h.date < oldest) oldest = h.date;
      if (!newest || h.date > newest) newest = h.date;
    }
  }
  row("기록 수", hCount);
  row("기간", oldest ? `${oldest.toISOString().slice(0, 10)} ~ ${newest.toISOString().slice(0, 10)}` : "없음");
  report("금액(amount)", amount);
  report("잔액(balance)", balance);
  row("종류(type) 분포", JSON.stringify(kinds));
  row("teacher_id 형식", JSON.stringify(hIdTypes.teacher_id));
  row("classId 형식", JSON.stringify(hIdTypes.classId));

  // ---------------- quest / thermometer ----------------
  section("퀘스트·온도계");
  const qReward = bucket(), qExp = bucket();
  for await (const q of data.collection("quest").find({}, { projection: { questReward: 1, questExp: 1 } })) {
    classify(qReward, q.questReward);
    classify(qExp, q.questExp);
  }
  report("퀘스트 보상", qReward);
  report("퀘스트 경험치", qExp);
  const tReq = bucket();
  for await (const t of data.collection("thermometer").find({}, { projection: { requireCurrency: 1 } })) {
    classify(tReq, t.requireCurrency);
  }
  report("온도계 1도당 쿠키 수", tReq);
  row("온도계 1도당 쿠키 수가 0 이하", await data.collection("thermometer").countDocuments({ requireCurrency: { $lte: 0 } }));

  // ---------------- 중복 ----------------
  section("중복 확인 (중복 금지 인덱스를 만들기 전 확인)");
  const dup = async (col, match, key) => {
    const r = await col
      .aggregate([{ $match: match }, { $group: { _id: `$${key}`, n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } }, { $count: "groups" }])
      .toArray();
    return r[0]?.groups ?? 0;
  };
  row("로그인 계정(user.users) 학생 아이디 중복", await dup(user.collection("users"), { role: "student" }, "userId"), "0이어야 정상");
  row("로그인 계정(user.users) 교사 이메일 중복", await dup(user.collection("users"), { role: "teacher" }, "email"), "0이어야 정상");
  row("학생 데이터(data.user_data) 아이디 중복", await dup(data.collection("user_data"), { role: "student" }, "userId"), "0이어야 정상");
  const usersOnly = await user.collection("users").countDocuments({ role: "student" });
  row("로그인 계정 학생 수 / 학생 데이터 수", `${usersOnly} / ${students}`, "다르면 한쪽에만 있는 계정이 있음");

  // ---------------- 인덱스 ----------------
  section("인덱스 (TTL 인덱스가 있으면 자동 삭제 중)");
  const targets = [
    [data, ["class_data", "user_data", "history", "quest", "classes", "thermometer"]],
    [user, ["users", "email_verifications", "kiosk_pwd_attempts", "email_send_log"]],
  ];
  for (const [db, names] of targets) {
    const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
    for (const name of names) {
      if (!existing.has(name)) { row(`${db.databaseName}.${name}`, "컬렉션 없음"); continue; }
      const idx = await db.collection(name).indexes();
      const desc = idx
        .map((i) => {
          const keys = Object.entries(i.key).map(([k, v]) => `${k}:${v}`).join(",");
          const flags = [i.unique ? "중복금지" : "", i.expireAfterSeconds !== undefined ? `⚠️TTL ${i.expireAfterSeconds}초 후 삭제` : ""]
            .filter(Boolean)
            .join(" ");
          return `{${keys}}${flags ? " " + flags : ""}`;
        })
        .join("  ");
      row(`${db.databaseName}.${name}`, desc);
    }
  }

  console.log("# DB 점검 결과 (읽기 전용, 변경 없음)\n" + `실행 시각: ${new Date().toISOString()}` + out.join("\n"));
} finally {
  await client.close();
}
