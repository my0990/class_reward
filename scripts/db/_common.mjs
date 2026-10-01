// DB 스크립트 공용: .env.local에서 MONGODB_URI를 읽어 접속한다.
import { readFileSync, existsSync } from "node:fs";
import { MongoClient } from "mongodb";

function loadEnvLocal() {
  const path = new URL("../../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export async function connect() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI가 없습니다. 프로젝트 폴더의 .env.local을 확인해주세요.");
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  return client;
}

/** "100", " 1,000 " 처럼 정수로 바꿀 수 있는 문자열인지 (음수 허용 여부 선택) */
export function isIntString(value, { allowNegative = false } = {}) {
  if (typeof value !== "string") return false;
  const re = allowNegative ? /^-?\d+$/ : /^\d+$/;
  return re.test(value.trim().replace(/,/g, ""));
}

export function typeName(v) {
  if (v === null) return "null";
  if (v === undefined) return "없음";
  if (Array.isArray(v)) return "array";
  if (typeof v === "object" && v?._bsontype === "ObjectId") return "ObjectId";
  if (v instanceof Date) return "date";
  return typeof v;
}
