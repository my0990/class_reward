import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { ObjectId } from "mongodb";
import { recheckUser } from "@/lib/auth/sessionCheck";
import { authorizeAdmin, isAdminEmail, ADMIN_SESSION_MS } from "@/lib/auth/adminAuth";
import { assertNotLocked, recordLoginFailure, clearLoginFailures } from "@/lib/auth/loginLimit";
import { isDefaultStudentPassword } from "@/lib/auth/studentPassword";
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        role: { label: "Role", type: "text" }, // "student" | "teacher" | "admin"
        id: { label: "Student ID", type: "text" }, // student 전용
        email: { label: "Email", type: "text" }, // teacher 전용
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        
        const role = String(credentials?.role ?? "");
        const password = String(credentials?.password ?? "");
        if (!role || !password) return null;

        // 🛠️ 관리자: admins.accounts + ADMIN_EMAILS 허용 목록 (lib/auth/adminAuth)
        if (role === "admin") {
          const admin = await authorizeAdmin((await connectDB).db("admins"), {
            email: credentials?.email,
            password,
          });
          return admin ? { ...admin, role: "admin" } : null;
        }

        const db = (await connectDB).db("user");
        let user = null;
        let limitKey = null;

        // 🎓 학생: userId로 조회
        if (role === "student") {
          const id = String(credentials?.id ?? "").trim();
          if (!id) return null;
          limitKey = `student:${id}`;
          await assertNotLocked(db, limitKey); // 5번 틀리면 10분 잠금 (잠겨 있으면 안내 문구와 함께 실패)

          user = await db.collection("users").findOne({
            role: "student",
            userId: id,
            disabled: { $ne: true }, // 학급이 휴지통에 있으면 로그인 불가
          });
        }

        // 👩‍🏫 교사: email로 조회
        if (role === "teacher") {
          const email = String(credentials?.email ?? "").trim().toLowerCase();
          if (!email) return null;
          limitKey = `teacher:${email}`;
          await assertNotLocked(db, limitKey);

          user = await db.collection("users").findOne({
            role: "teacher",
            email,
            disabled: { $ne: true }, // 탈퇴 처리 중인 계정
          });
        }

        const hashed = user?.passwordHash ?? user?.password;
        const ok = hashed ? await compare(password, hashed) : false;
        if (!ok) {
          // 없는 아이디도 같이 센다 (어떤 아이디가 있는지 알려주지 않는다)
          if (limitKey) await recordLoginFailure(db, limitKey);
          return null;
        }
        if (limitKey) await clearLoginFailures(db, limitKey);

        // 관리자 대시보드의 "최근 접속" 통계용
        await db.collection("users").updateOne({ _id: user._id }, { $set: { lastSeenAt: new Date() } }).catch(() => {});

        // ✅ role별로 필요한 최소 필드만 반환 (jwt/session에서 사용)
        if (role === "teacher") {
          return {
            _id: user._id?.toString?.() ?? String(user._id),
            role: "teacher",
            email: user.email ?? null,
            teacherId: user.teacherId ?? user.userId ?? null, // 너 DB 필드명에 맞춰 사용

          };
        }

        // student
        return {
          _id: user._id?.toString?.() ?? String(user._id),
          role: "student",
          userId: user.userId ?? null,
          classId: user.classId ?? null, // 있으면 넣고, 없으면 null
          teacher_id: user.teacher_id?.toString?.() ?? null,
          // 기본 비밀번호 그대로면 먼저 새 비밀번호를 정해야 한다 (proxy가 /student/change-password로 보냄)
          mustChangePassword: isDefaultStudentPassword(password),
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {

    // ✅ JWT에 role별로 다르게 저장
    jwt: async ({ token, user }) => {

      if (user) {
        // 로그인한 시각: 이후에 비밀번호가 바뀌면(passwordChangedAt) 이 세션은 로그아웃된다
        token.authAt = Date.now();

        if (user.role === "teacher") {
          token.user = {
            role: "teacher",
            email: user.email ?? null,
            _id: user._id.toString(),
            teacher_id: user._id.toString()
          };
        } else if (user.role === "student") {
          token.user = {
            role: "student",
            userId: user.userId ?? null,
            classId: user.classId ?? null,
            _id: user._id.toString(),
            teacher_id: user.teacher_id?.toString() ?? null,
            mustChangePassword: Boolean(user.mustChangePassword),
          };
        } else if (user.role === "admin") {
          token.user = {
            role: "admin",
            email: user.email,
            _id: user._id,
            expiresAt: Date.now() + ADMIN_SESSION_MS, // 관리자는 12시간 뒤 다시 로그인
          };
        }
      }

      // 계정이 아직 있는지는 5분에 한 번만 DB로 확인한다 (lib/auth/sessionCheck)
      await recheckUser(token, {
        justSignedIn: Boolean(user),
        // 확인하는 김에 lastSeenAt(최근 접속)도 갱신한다 → 5분에 한 번 쓰기
        findUserById: async (id) => {
          const client = await connectDB;
          const _id = ObjectId.createFromHexString(id);
          const $set = { lastSeenAt: new Date() };
          if (token.user.role === "admin") {
            if (!isAdminEmail(token.user.email)) return null; // ADMIN_EMAILS에서 빠짐
            return client.db("admins").collection("accounts").findOneAndUpdate(
              { _id }, { $set }, { projection: { _id: 1 } }
            );
          }
          const found = await client.db("user").collection("users").findOneAndUpdate(
            { _id, disabled: { $ne: true } },
            { $set },
            { projection: { _id: 1, passwordChangedAt: 1 } }
          );
          // 이 세션 로그인 이후에 비밀번호가 바뀌었으면 (비밀번호 찾기·변경) 로그아웃
          if (found?.passwordChangedAt && found.passwordChangedAt.getTime() > (token.authAt ?? 0)) return null;
          return found;
        },
      });

      return token;
    },

    // ✅ session에도 role별로 다르게 노출
    session: async ({ session, token }) => {
      if (token.invalidUser) {
        return null;
      }
      if (token.user?.role === "admin" && Date.now() > (token.user.expiresAt ?? 0)) {
        return null;
      }
      session.user = token.user;
      session.role = token.user.role;
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };