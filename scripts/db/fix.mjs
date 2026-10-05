// DB 데이터 정리 (문자열 숫자 → 정수, 문자열 id → ObjectId 등)
//
//   node scripts/db/fix.mjs           ← 연습 실행(dry-run): 무엇을 바꿀지 보여주기만 함
//   node scripts/db/fix.mjs --apply   ← 실제로 변경
//
// - 여러 번 실행해도 안전하다 (이미 숫자/ObjectId인 값은 건너뛴다).
// - 숫자로 바꿀 수 없는 값("abc" 등)은 건드리지 않고 목록만 보여준다.
// - 배열 안의 값은 해당 항목 하나만 조건부로 바꾼다. 실행 중 학생이 구매해도 재고·잔액을 덮어쓰지 않는다.
import { connect, isIntString } from "./_common.mjs";

const APPLY = process.argv.includes("--apply");
const DEFAULT_REQUIRE_CURRENCY = 30; // 온도계 화면이 설정이 없을 때 보여주던 기본값
const UNPRICED_PROFILE_IMG = 99999; // 새 프로필 이미지를 등록할 때 넣는 "가격 미정" 값

const toInt = (s) => Number(String(s).trim().replace(/,/g, ""));
const SAFE_KEY = /^[A-Za-z0-9_-]+$/; // DB 필드 경로에 넣어도 안전한 키

const client = await connect();
const data = client.db("data");

const log = [];
const plan = (label, n) => log.push(`- ${label}: ${n}건`);
const broken = {}; // 변환 불가 값 → 개수 (값만 모은다, 개인정보 없음)
const noteBroken = (where, v) => {
  const k = `${where}: ${JSON.stringify(v)}`;
  broken[k] = (broken[k] ?? 0) + 1;
};

async function run(label, ops) {
  plan(label, ops.length);
  if (!APPLY || ops.length === 0) return;
  let modified = 0;
  for (let i = 0; i < ops.length; i += 500) {
    const r = await ops[0].col.bulkWrite(ops.slice(i, i + 500).map((o) => o.op), { ordered: false });
    modified += r.modifiedCount;
  }
  log.push(`  → 변경됨 ${modified}건`);
}

try {
  // 1) 마켓 아이템 가격·재고 (class_data.itemList)
  {
    const col = data.collection("class_data");
    const ops = [];
    for await (const c of col.find({}, { projection: { itemList: 1, profileImgStorage: 1 } })) {
      for (const it of c.itemList ?? []) {
        for (const field of ["itemPrice", "itemStock"]) {
          const v = it?.[field];
          if (typeof v !== "string") continue;
          if (!isIntString(v) || it.itemId == null) { noteBroken(`마켓 ${field}`, v); continue; }
          ops.push({
            col,
            op: {
              updateOne: {
                filter: { _id: c._id },
                update: { $set: { [`itemList.$[e].${field}`]: toInt(v) } },
                arrayFilters: [{ "e.itemId": it.itemId, [`e.${field}`]: v }],
              },
            },
          });
        }
      }
    }
    await run("마켓 아이템 가격/재고 문자열 → 정수", ops);
  }

  // 2) 프로필 이미지 가격 (class_data.profileImgStorage.<id>.price)
  {
    const col = data.collection("class_data");
    const ops = [];
    let emptyProfilePrice = 0;
    for await (const c of col.find({ profileImgStorage: { $exists: true } }, { projection: { profileImgStorage: 1 } })) {
      for (const [key, p] of Object.entries(c.profileImgStorage ?? {})) {
        const v = p?.price;
        if (typeof v !== "string") continue;
        const path = `profileImgStorage.${key}.price`;
        // 가격이 빈 문자열이면 "아직 가격 미정"으로 보고, 새 이미지 등록 때와 같은 99999(사실상 판매 안 함)로 채운다.
        if (v.trim() === "" && SAFE_KEY.test(key)) {
          emptyProfilePrice++;
          ops.push({ col, op: { updateOne: { filter: { _id: c._id, [path]: v }, update: { $set: { [path]: UNPRICED_PROFILE_IMG } } } } });
          continue;
        }
        if (!isIntString(v) || !SAFE_KEY.test(key)) { noteBroken("프로필 이미지 가격", v); continue; }
        ops.push({ col, op: { updateOne: { filter: { _id: c._id, [path]: v }, update: { $set: { [path]: toInt(v) } } } } });
      }
    }
    await run(`프로필 이미지 가격 문자열 → 정수 (그중 비어있어서 ${UNPRICED_PROFILE_IMG}으로 채움: ${emptyProfilePrice})`, ops);
  }

  // 3) 학생 인벤토리 아이템 가격 (user_data.itemList)
  {
    const col = data.collection("user_data");
    const ops = [];
    for await (const u of col.find({ "itemList.itemPrice": { $type: "string" } }, { projection: { itemList: 1 } })) {
      for (const it of u.itemList ?? []) {
        const v = it?.itemPrice;
        if (typeof v !== "string") continue;
        if (!isIntString(v) || it.itemId == null) { noteBroken("인벤토리 itemPrice", v); continue; }
        ops.push({
          col,
          op: {
            updateOne: {
              filter: { _id: u._id },
              update: { $set: { "itemList.$[e].itemPrice": toInt(v) } },
              arrayFilters: [{ "e.itemId": it.itemId, "e.itemPrice": v }],
            },
          },
        });
      }
    }
    await run("인벤토리 아이템 가격 문자열 → 정수", ops);
  }

  // 4) 온도계 1도당 쿠키 수 (문자열 → 정수, 비어있으면 기본값 30)
  {
    const col = data.collection("thermometer");
    const ops = [];
    let missing = 0;
    for await (const t of col.find({}, { projection: { requireCurrency: 1 } })) {
      const v = t.requireCurrency;
      if (v === undefined || v === null || v === "") {
        missing++;
        ops.push({ col, op: { updateOne: { filter: { _id: t._id, requireCurrency: v ?? null }, update: { $set: { requireCurrency: DEFAULT_REQUIRE_CURRENCY } } } } });
      } else if ((typeof v === "string" && isIntString(v) && toInt(v) <= 0) || (typeof v === "number" && v <= 0)) {
        // 0이면 1도 계산이 0으로 나누기가 되어 기부가 실패한다 → 기본값 30
        missing++;
        ops.push({ col, op: { updateOne: { filter: { _id: t._id, requireCurrency: v }, update: { $set: { requireCurrency: DEFAULT_REQUIRE_CURRENCY } } } } });
      } else if (typeof v === "string") {
        if (!isIntString(v)) { noteBroken("온도계 requireCurrency", v); continue; }
        ops.push({ col, op: { updateOne: { filter: { _id: t._id, requireCurrency: v }, update: { $set: { requireCurrency: toInt(v) } } } } });
      }
    }
    await run(`온도계 1도당 쿠키 수 정리 (그중 비어있거나 0이라서 ${DEFAULT_REQUIRE_CURRENCY}으로 채움: ${missing})`, ops);
  }

  // 5) 거래 기록 (history) — 건수가 많아서 DB 안에서 한 번에 변환한다
  {
    const col = data.collection("history");
    const cleanedAmount = { $replaceAll: { input: { $trim: { input: "$amount" } }, find: ",", replacement: "" } };
    const jobs = [
      ["거래 기록 amount 문자열 → 정수", { amount: { $type: "string" } },
        [{ $set: { amount: { $convert: { input: cleanedAmount, to: "int", onError: "$amount", onNull: "$amount" } } } }]],
      ["거래 기록 teacher_id 문자열 → ObjectId", { teacher_id: { $type: "string" } },
        [{ $set: { teacher_id: { $convert: { input: "$teacher_id", to: "objectId", onError: "$teacher_id", onNull: "$teacher_id" } } } }]],
      ["거래 기록 classId 문자열 → ObjectId", { classId: { $type: "string" } },
        [{ $set: { classId: { $convert: { input: "$classId", to: "objectId", onError: "$classId", onNull: "$classId" } } } }]],
      ["거래 기록 종류 deposit → 입금", { type: "deposit" }, { $set: { type: "입금" } }],
      ["거래 기록 종류 withDrawal → 출금", { type: "withDrawal" }, { $set: { type: "출금" } }],
    ];
    for (const [label, filter, update] of jobs) {
      const n = await col.countDocuments(filter);
      plan(label, n);
      if (APPLY && n > 0) {
        const r = await col.updateMany(filter, update);
        log.push(`  → 변경됨 ${r.modifiedCount}건`);
      }
    }
    // DB 안의 $convert(to: "int")는 21억이 넘는 값을 바꾸지 못한다. 남은 것은 하나씩 숫자로 바꾼다.
    const leftOps = [];
    for await (const h of col.find({ amount: { $type: "string" } }, { projection: { amount: 1 } })) {
      if (isIntString(h.amount)) {
        leftOps.push({ col, op: { updateOne: { filter: { _id: h._id, amount: h.amount }, update: { $set: { amount: toInt(h.amount) } } } } });
      } else {
        noteBroken("거래 기록 amount", h.amount);
      }
    }
    if (leftOps.length) await run("거래 기록 amount 중 큰 숫자 → 숫자", leftOps);
  }

  console.log(
    `# DB 정리 ${APPLY ? "실제 적용 결과" : "연습 실행(dry-run) — 아무것도 바뀌지 않았습니다"}\n` +
      `실행 시각: ${new Date().toISOString()}\n\n## 작업\n` +
      log.join("\n") +
      "\n\n## 숫자로 바꿀 수 없어서 건너뛴 값 (직접 확인 필요)\n" +
      (Object.keys(broken).length
        ? Object.entries(broken).map(([k, n]) => `- ${k} → ${n}건`).join("\n")
        : "- 없음") +
      (APPLY ? "" : "\n\n실제로 적용하려면: node scripts/db/fix.mjs --apply")
  );
} finally {
  await client.close();
}
