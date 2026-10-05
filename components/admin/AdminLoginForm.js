"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { role: "admin", email, password, redirect: false });
    if (res?.ok && !res.error) {
      window.location.href = "/admin"; // 세션 쿠키를 새로 읽도록 전체 이동
      return;
    }
    // 잠금 메시지는 서버가 보낸 문장을 그대로, 나머지는 같은 문장으로 (어느 쪽이 틀렸는지 알려주지 않음)
    setError(res?.error && res.error !== "CredentialsSignin" ? res.error : "이메일 또는 비밀번호가 올바르지 않습니다.");
    setPassword("");
    setLoading(false);
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">관리자 로그인</h1>
          <p className="mt-1 text-sm text-slate-500">관리자 계정만 들어올 수 있습니다.</p>
        </div>
        <label className="block">
          <span className="text-sm text-slate-700">이메일</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-700">비밀번호</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered mt-1 w-full"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn w-full bg-slate-900 text-white hover:bg-slate-700">
          {loading ? "확인 중…" : "로그인"}
        </button>
      </form>
    </main>
  );
}
