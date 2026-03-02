import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/database";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        role: { label: "Role", type: "text" }, // "student" | "teacher"
        id: { label: "Student ID", type: "text" }, // student 전용
        email: { label: "Email", type: "text" }, // teacher 전용
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const role = String(credentials?.role ?? "");
        const password = String(credentials?.password ?? "");
        if (!role || !password) return null;

        const db = (await connectDB).db("user");

        let user = null;

        // 🎓 학생: userId로 조회
        if (role === "student") {
          const id = String(credentials?.id ?? "").trim();
          if (!id) return null;

          user = await db.collection("users").findOne({
            role: "student",
            userId: id,
          });
        }

        // 👩‍🏫 교사: email로 조회
        if (role === "teacher") {
          const email = String(credentials?.email ?? "").trim().toLowerCase();
          if (!email) return null;

          user = await db.collection("users").findOne({
            role: "teacher",
            email,
          });
        }

        if (!user) return null;

        const hashed = user.passwordHash ?? user.password;
        if (!hashed) return null;

        const ok = await compare(password, hashed);
        if (!ok) return null;

        // ✅ role별로 필요한 최소 필드만 반환 (jwt/session에서 사용)
        if (role === "teacher") {
          return {
            _id: user._id?.toString?.() ?? String(user._id),
            role: "teacher",
            email: user.email ?? null,
            teacherId: user.teacherId ?? user.userId ?? null, // 너 DB 필드명에 맞춰 사용
            code: user.code ?? null,
          };
        }

        // student
        return {
          _id: user._id?.toString?.() ?? String(user._id),
          role: "student",
          userId: user.userId ?? null,
          classId: user.classId ?? null, // 있으면 넣고, 없으면 null
          code: user.code ?? null,
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
        token.role = user.role;

        if (user.role === "teacher") {
          token.user = {
            role: "teacher",
            email: user.email ?? null,
            _id: user._id.toString(),
          };
        } else if (user.role === "student") {
          token.user = {
            role: "student",
            userId: user.userId ?? null,
            classId: user.classId ?? null,
            _id: user._id.toString(),
          };
        }
      }
      return token;
    },

    // ✅ session에도 role별로 다르게 노출
    session: async ({ session, token }) => {
      session.user = token.user;
      session.role = token.role;
      session.code = token.code;
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