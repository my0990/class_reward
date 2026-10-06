// DB 백업: data · user · admins 전체를 내 컴퓨터에 파일로 저장
//
//   npm run db:backup
//
// - backups/<날짜_시각>/<db>/<컬렉션>.jsonl.gz 로 저장 (ObjectId·날짜가 그대로 보존되는 EJSON 형식)
// - 학생·교사 개인정보가 들어 있으므로 backups 폴더는 git에 올리지 않는다(.gitignore). 외부에 공유하지 말 것.
// - 화면에는 개수만 출력한다.
// - 복원은 scripts/db/restore.mjs (기본은 원본을 건드리지 않고 *_restore DB로 복원)
import { createWriteStream, mkdirSync } from "node:fs";
import { createGzip } from "node:zlib";
import { once } from "node:events";
import { BSON } from "mongodb"; // EJSON: ObjectId·날짜를 그대로 보존하는 JSON
const { EJSON } = BSON;
import { connect } from "./_common.mjs";

const DBS = ["data", "user", "admins"];
const pad = (n) => String(n).padStart(2, "0");
const d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
const root = new URL(`../../backups/${stamp}/`, import.meta.url);

const client = await connect();
let total = 0;
try {
  console.log(`# DB 백업 → backups/${stamp}\n`);
  for (const dbName of DBS) {
    const db = client.db(dbName);
    const dir = new URL(`${dbName}/`, root);
    mkdirSync(dir, { recursive: true });
    const cols = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
    for (const name of cols) {
      const gz = createGzip();
      const out = createWriteStream(new URL(`${name}.jsonl.gz`, dir));
      gz.pipe(out);
      let n = 0;
      for await (const doc of db.collection(name).find()) {
        if (!gz.write(EJSON.stringify(doc, { relaxed: false }) + "\n")) await once(gz, "drain");
        n++;
      }
      gz.end();
      await once(out, "finish");
      total += n;
      console.log(`- ${dbName}.${name}: ${n.toLocaleString()}건`);
    }
  }
  console.log(`\n✅ 완료: 문서 ${total.toLocaleString()}건 (개인정보가 들어 있으니 안전한 곳에 보관하세요)`);
} finally {
  await client.close();
}
