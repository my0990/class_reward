"use client";
// 선생님 비밀번호 찾기: ① 이메일 → ② 인증 코드 → ③ 새 비밀번호
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthInput from "../components/authInput";
import AuthBtn from "../components/authBtn";
import { requestPasswordReset, verifyPasswordResetCode, resetPassword } from "@/server-action/actions/auth/passwordReset.action";

const MIN = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState("email"); // email | code | password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    setMsg({ type: "", text: "" });
    try {
      await fn();
    } catch {
      setMsg({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      const res = await requestPasswordReset({ email });
      if (!res.result) {
        setMsg({ type: "error", text: res.message });
        return;
      }
      setMsg({ type: "info", text: res.message });
      setStep("code");
      setCooldown(60);
    });

  const checkCode = () =>
    run(async () => {
      const res = await verifyPasswordResetCode({ email, code });
      if (!res.result) {
        setMsg({ type: "error", text: res.message });
        return;
      }
      setResetToken(res.data.resetToken);
      setStep("password");
    });

  const savePassword = () =>
    run(async () => {
      if (pwd.next.length < MIN) return setMsg({ type: "error", text: `비밀번호는 ${MIN}자 이상 입력해주세요.` });
      if (pwd.next !== pwd.confirm) return setMsg({ type: "error", text: "두 비밀번호가 다릅니다." });
      const res = await resetPassword({ resetToken, newPassword: pwd.next });
      if (!res.result) {
        setMsg({ type: "error", text: res.message });
        return;
      }
      alert(res.message);
      router.push("/auth/login/teacher");
    });

  const onSubmit = (e) => {
    e.preventDefault();
    if (step === "email") sendCode();
    else if (step === "code") checkCode();
    else savePassword();
  };

  return (
    <form onSubmit={onSubmit} className="flex min-h-[80vh] flex-col items-center justify-center py-12">
      <div className="mx-5 w-10/12 min-[500px]:w-[400px]">
        <h1 className="mb-2 text-[1.8rem]">비밀번호 찾기</h1>
        <ol className="mb-6 flex gap-2 text-sm text-gray-400">
          {[["email", "이메일"], ["code", "인증 코드"], ["password", "새 비밀번호"]].map(([key, label], i) => (
            <li key={key} className={step === key ? "font-bold text-orange-500" : ""}>
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {step !== "password" && (
          <AuthInput
            type="email"
            placeholder="가입한 이메일을 입력해주세요"
            value={email}
            disabled={step !== "email"}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {step === "code" && (
          <>
            <AuthInput
              inputMode="numeric"
              maxLength={6}
              placeholder="메일로 받은 6자리 코드"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            <div className="-mt-2 mb-3 flex justify-between text-sm">
              <button type="button" className="text-gray-500 underline" onClick={() => { setStep("email"); setCode(""); setMsg({ type: "", text: "" }); }}>
                이메일 다시 입력
              </button>
              <button type="button" disabled={cooldown > 0 || busy} className="text-orange-500 underline disabled:text-gray-400 disabled:no-underline" onClick={sendCode}>
                {cooldown > 0 ? `${cooldown}초 후 재전송` : "코드 다시 받기"}
              </button>
            </div>
          </>
        )}

        {step === "password" && (
          <>
            <AuthInput type="password" autoComplete="new-password" placeholder={`새 비밀번호 (${MIN}자 이상)`} value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
            <AuthInput type="password" autoComplete="new-password" placeholder="새 비밀번호 확인" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
            <p className="-mt-2 mb-3 text-sm text-gray-500">비밀번호를 바꾸면 다른 기기에서도 로그아웃됩니다.</p>
          </>
        )}

        {msg.text && (
          <p role={msg.type === "error" ? "alert" : "status"} className={`mb-3 text-center ${msg.type === "error" ? "text-red-500" : "text-gray-600"}`}>
            {msg.text}
          </p>
        )}

        <AuthBtn type="submit" disabled={busy}>
          {busy ? "확인 중..." : step === "email" ? "인증 코드 받기" : step === "code" ? "확인" : "비밀번호 바꾸기"}
        </AuthBtn>

        <div className="text-center">
          <Link href="/auth/login/teacher" className="text-orange-500 hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </form>
  );
}
