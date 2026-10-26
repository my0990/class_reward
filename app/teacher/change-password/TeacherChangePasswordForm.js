"use client";
// 선생님 임시 비밀번호 → 새 비밀번호. 바꾸면 새 비밀번호로 다시 로그인해서 학급 목록으로.
import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import AuthInput from "@/app/auth/components/authInput";
import AuthBtn from "@/app/auth/components/authBtn";
import { changeMyTempPassword } from "@/server-action/actions/account/teacherPassword.action";

const MIN = 8;

export default function TeacherChangePasswordForm({ email }) {
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (pwd.next.length < MIN) return setError(`비밀번호는 ${MIN}자 이상 입력해주세요.`);
    if (pwd.next !== pwd.confirm) return setError("두 비밀번호가 다릅니다.");
    setBusy(true);
    setError("");
    const res = await changeMyTempPassword({ newPassword: pwd.next }).catch(() => null);
    if (!res?.result) {
      setError(res?.message ?? "비밀번호를 바꾸지 못했습니다.");
      setBusy(false);
      return;
    }
    // 세션에 남은 '비밀번호 바꾸기 필요' 표시를 지우려고 새 비밀번호로 다시 로그인한다
    const login = await signIn("credentials", { role: "teacher", email, password: pwd.next, redirect: false });
    if (login?.ok && !login.error) {
      window.location.href = "/teacher/classes";
    } else {
      await signOut({ callbackUrl: `${window.location.origin}/auth/login/teacher` });
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex min-h-dvh flex-col items-center justify-center bg-orange-50 px-5">
      <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow">
        <div className="text-center text-5xl" aria-hidden="true">🔑</div>
        <h1 className="mt-3 text-center text-[1.6rem] font-bold">새 비밀번호를 정해주세요</h1>
        <p className="mb-5 mt-2 text-center text-gray-500">
          임시 비밀번호로 로그인하셨어요.
          <br />앞으로 쓸 비밀번호를 정해주세요. ({MIN}자 이상)
        </p>
        <AuthInput type="password" autoComplete="new-password" placeholder="새 비밀번호" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
        <AuthInput type="password" autoComplete="new-password" placeholder="새 비밀번호 확인" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
        {error && <p role="alert" className="mb-3 text-center text-red-500">{error}</p>}
        <AuthBtn type="submit" disabled={busy || !pwd.next || !pwd.confirm}>{busy ? "바꾸는 중..." : "비밀번호 바꾸기"}</AuthBtn>
        <button type="button" onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })} className="w-full text-center text-sm text-gray-400 underline">
          로그아웃
        </button>
      </div>
    </form>
  );
}
