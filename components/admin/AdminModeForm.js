"use client";
// 관리자 이메일로 선생님 로그인을 한 상태에서 /admin에 들어오면: 이메일 없이 관리자 비밀번호만 → 관리자 모드(12시간)
import { useState } from "react";
import { signIn } from "next-auth/react";
import { enableAdminMode } from "@/server-action/admin/adminMode.action";

export default function AdminModeForm({ email }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading || !password) return;
    setLoading(true);
    setError("");
    const res = await enableAdminMode({ password });
    const signed = res?.result ? await signIn("credentials", { role: "admin-mode", token: res.token, redirect: false }) : null;
    if (signed?.ok && !signed.error) {
      window.location.href = "/admin";
      return;
    }
    setError(res?.result ? "관리자 모드를 켜지 못했어요. 다시 시도해 주세요." : res?.message || "확인하지 못했어요.");
    setPassword("");
    setLoading(false);
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">관리자 모드 켜기</h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{email}</span>(선생님 로그인 중)
            <br />
            관리자 비밀번호만 확인하면 12시간 동안 다시 로그인하지 않아요.
          </p>
        </div>
        <label className="block">
          <span className="text-sm text-slate-700">관리자 비밀번호</span>
          <input
            type="password"
            autoFocus
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
        <button type="submit" disabled={loading || !password} className="btn w-full bg-slate-900 text-white hover:bg-slate-700">
          {loading ? "확인 중…" : "관리자 모드 켜기"}
        </button>
        <a href="/teacher/classes" className="block text-center text-sm text-slate-500 hover:underline">
          선생님 화면으로 돌아가기
        </a>
      </form>
    </main>
  );
}
