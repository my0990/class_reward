// 관리자 계정 만들기 / 비밀번호 바꾸기
//
//   npm run admin:create -- --email you@example.com            ← 새로 만들기
//   npm run admin:create -- --email you@example.com --reset    ← 이미 있으면 비밀번호 바꾸기
//
// - 이메일은 .env.local(그리고 Vercel)의 ADMIN_EMAILS에 먼저 넣어야 한다.
// - 비밀번호는 화면에 보이지 않게 두 번 입력받는다 (명령어 기록에 남지 않음). 10자 이상.
// - 저장 위치: admins.accounts (교사 계정 user.users와 별개라서 같은 이메일이어도 된다)
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import { connect } from "../db/_common.mjs";

const MIN_LEN = 10;
const args = process.argv.slice(2);
const emailArg = args[args.indexOf("--email") + 1];
const RESET = args.includes("--reset");
const email = String(args.includes("--email") ? emailArg ?? "" : "").trim().toLowerCase();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("사용법: npm run admin:create -- --email you@example.com [--reset]");
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (s) => {
      if (!muted) rl.output.write(s);
      else if (s.includes("\n") || s.includes("\r")) rl.output.write("\n");
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

const client = await connect(); // .env.local도 여기서 읽는다
try {
  const allow = String(process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allow.includes(email)) {
    console.error(
      `ADMIN_EMAILS에 ${email}이(가) 없습니다.\n` +
        `.env.local에 아래 줄을 넣고 다시 실행해주세요 (배포 서버는 Vercel 환경 변수에도):\n\n  ADMIN_EMAILS=${email}\n`
    );
    process.exitCode = 1;
  } else {
    const accounts = client.db("admins").collection("accounts");
    await accounts.createIndex({ email: 1 }, { unique: true, name: "email_unique" });
    const existing = await accounts.findOne({ email }, { projection: { _id: 1 } });

    if (existing && !RESET) {
      console.error("이미 관리자 계정이 있습니다. 비밀번호를 바꾸려면 끝에 --reset 을 붙여주세요.");
      process.exitCode = 1;
    } else {
      const pw1 = await askHidden(`새 비밀번호 (${MIN_LEN}자 이상, 화면에 안 보임): `);
      const pw2 = await askHidden("비밀번호 확인: ");
      if (pw1 !== pw2) {
        console.error("두 비밀번호가 다릅니다.");
        process.exitCode = 1;
      } else if (pw1.length < MIN_LEN) {
        console.error(`비밀번호는 ${MIN_LEN}자 이상이어야 합니다.`);
        process.exitCode = 1;
      } else {
        const now = new Date();
        const passwordHash = await bcrypt.hash(pw1, 12);
        if (existing) {
          await accounts.updateOne({ _id: existing._id }, { $set: { passwordHash, updatedAt: now } });
          await client.db("admins").collection("admin_login_attempts").deleteOne({ email }); // 잠금도 풀기
          console.log(`✅ ${email} 관리자 비밀번호를 바꿨습니다.`);
        } else {
          await accounts.insertOne({ email, passwordHash, createdAt: now, updatedAt: now });
          console.log(`✅ ${email} 관리자 계정을 만들었습니다. /admin/login 에서 로그인하세요.`);
        }
        await client.db("admins").collection("audit_log").insertOne({
          at: now,
          adminEmail: email,
          action: existing ? "account_reset" : "account_create",
          target: null,
          detail: "admin:create 스크립트",
        });
      }
    }
  }
} finally {
  await client.close();
}
