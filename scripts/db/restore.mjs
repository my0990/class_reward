// DB 복원 (backup.mjs로 만든 폴더에서)
//
//   npm run db:restore -- --from backups/2026-10-07_0900
//       → data_restore · user_restore · admins_restore DB로 복원 (원본은 그대로). Atlas 화면에서 비교·확인용.
//   npm run db:restore -- --from backups/2026-10-07_0900 --overwrite
//       → 원본 DB(data · user · admins)의 컬렉션을 백업 내용으로 바꿔치기. 되돌릴 수 없으니 확인 문구를 입력해야 한다.
import { readdirSync, existsSync, createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { EJSON } from "mongodb";
import { connect } from "./_common.mjs";

const args = process.argv.slice(2);
const from = args.includes("--from") ? args[args.indexOf("--from") + 1] : null;
const OVERWRITE = args.includes("--overwrite");
const CONFIRM = "복원합니다";

if (!from || !existsSync(from)) {
  console.error("사용법: npm run db:restore -- --from backups/<날짜_시각> [--overwrite]");
  process.exit(1);
}

if (OVERWRITE) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((r) => rl.question(`⚠️ 실제 DB를 백업 내용으로 덮어씁니다. 계속하려면 '${CONFIRM}'를 입력하세요: `, r));
  rl.close();
  if (answer.trim() !== CONFIRM) {
    console.log("취소했습니다.");
    process.exit(0);
  }
}

const client = await connect();
try {
  for (const dbName of readdirSync(from).filter((n) => ["data", "user", "admins"].includes(n))) {
    const target = client.db(OVERWRITE ? dbName : `${dbName}_restore`);
    for (const file of readdirSync(`${from}/${dbName}`).filter((f) => f.endsWith(".jsonl.gz"))) {
      const name = file.replace(/\.jsonl\.gz$/, "");
      const col = target.collection(name);
      await col.deleteMany({});
      const lines = createInterface({ input: createReadStream(`${from}/${dbName}/${file}`).pipe(createGunzip()) });
      let batch = [];
      let n = 0;
      for await (const line of lines) {
        if (!line) continue;
        batch.push(EJSON.parse(line, { relaxed: false }));
        if (batch.length === 1000) {
          await col.insertMany(batch, { ordered: false });
          n += batch.length;
          batch = [];
        }
      }
      if (batch.length) {
        await col.insertMany(batch, { ordered: false });
        n += batch.length;
      }
      console.log(`- ${target.databaseName}.${name}: ${n.toLocaleString()}건`);
    }
  }
  console.log(OVERWRITE ? "\n✅ 원본 DB 복원 완료 (인덱스는 npm run db:indexes -- --apply 로 다시 확인)" : "\n✅ *_restore DB로 복원 완료 (원본은 그대로)");
} finally {
  await client.close();
}
