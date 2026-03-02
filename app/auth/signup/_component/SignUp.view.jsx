'use client'
import AuthBtn from "./authBtn"
import AuthInput from "./authInput"
import Link from "next/link"
import PrivacyCheckModal from "./PrivacyCheckModal"
import { useMemo, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { teacherSignupAction } from "@/server-action/actions/auth/signup"
export default function SignUpView() {
    const router = useRouter();

    const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);

    // form
    const [form, setForm] = useState({
        email: "",
        emailCode: "",
        pwd: "",
        pwdCheck: "",
    });

    // errors
    const [error, setError] = useState("");

    // ✅ 이메일 인증 상태
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quota, setQuota] = useState(null); // optional

    const emailOk = useMemo(() => {
        const email = String(form.email ?? "").trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, [form.email]);

    const codeOk = useMemo(() => /^\d{6}$/.test(String(form.emailCode ?? "").trim()), [form.emailCode]);

    const canSendCode = useMemo(() => emailOk && !isSendingCode, [emailOk, isSendingCode]);
    const canVerifyCode = useMemo(() => emailOk && codeOk && !isVerifyingCode, [emailOk, codeOk, isVerifyingCode]);

    const onChange = (e) => {
        const { name, value } = e.target;

        // 이메일이 바뀌면 인증 상태 리셋
        if (name === "email") {
            setIsEmailVerified(false);
            setQuota(null);
        }

        setForm((prev) => ({ ...prev, [name]: value }));
        setError(""); // 입력 시 에러 메시지 초기화(선택)
    };

    const validateBeforeSubmit = () => {
        if (!form.email) return "이메일을 입력하세요";
        if (!emailOk) return "이메일 형식으로 입력해주세요";

        if (!form.emailCode) return "이메일 인증 코드를 입력하세요";
        if (!codeOk) return "인증 코드는 6자리 숫자입니다";
        if (!isEmailVerified) return "이메일 인증을 완료해주세요";

        if (!form.pwd) return "비밀번호를 입력하세요";
        if (!form.pwdCheck) return "비밀번호를 한번 더 입력해주세요";
        if (form.pwd !== form.pwdCheck) return "비밀번호가 일치하지 않습니다";
        if (String(form.pwd).length < 8) return "비밀번호는 8자 이상 입력해주세요";

        if (!isPrivacyChecked) return "개인정보 수집에 동의해주세요";

        return "";
    };

    const onSendEmailCode = async () => {
        if (!canSendCode) return;

        setIsSendingCode(true);
        setError("");
        try {
            const res = await fetch("/api/email/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email }),
            });
            const data = await res.json();

            if (!data?.success) {
                setError(data?.message ?? "인증 코드 전송 실패");
                return;
            }

            if (data?.quota) setQuota(data.quota);
            alert("인증 코드를 전송했습니다");
        } catch (err) {
            console.error(err);
            setError("네트워크 오류");
        } finally {
            setIsSendingCode(false);
        }
    };

    const onVerifyEmailCode = async () => {
        if (!canVerifyCode) return;

        setIsVerifyingCode(true);
        setError("");
        try {
            const res = await fetch("/api/email/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, code: form.emailCode }),
            });
            const data = await res.json();

            if (!data?.success) {
                setIsEmailVerified(false);
                setError(data?.message ?? "인증 실패");
                return;
            }

            setIsEmailVerified(true);
            alert("이메일 인증 완료");
        } catch (err) {
            console.error(err);
            setError("네트워크 오류");
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const msg = validateBeforeSubmit();
        if (msg) {
            setError(msg);
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const data = await teacherSignupAction({
              email: form.email,
              password: form.pwd,
            });
        
            if (!data?.success) {
              setError(data?.message ?? "회원가입 실패");
              return;
            }
        
            const loginRes = await signIn("credentials", {
              email: form.email,
              password: form.pwd,
              redirect: false,
            });
        
            if (!loginRes?.ok) {
              alert(loginRes?.error ?? "회원가입은 완료됐지만 로그인 실패");
              router.push("../auth/login/teacher");
              return;
            }
        
            router.push("/");
          } catch (err) {
            console.error(err);
            setError("네트워크 오류");
          } finally {
            setIsSubmitting(false);
          }
    };

    return (
        <form type="POST" onSubmit={onSubmit}>
            <div className="w-full flex flex-col items-center mt-[80px]">
                <div className="w-10/12 min-[500px]:w-[400px] mx-5 ">
                    <div className="text-[3rem] ">
                        선생님 회원가입
                    </div>
                    <div className="mb-5 text-[1.2rem] text-gray-400">
                        선생님만 가입해주세요
                    </div>

                    {/* 이메일 + 코드 보내기 */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1">
                            <AuthInput placeholder="이메일을 입력해주세요" name="email" onChange={onChange} />
                        </div>
                        <button
                            type="button"
                            onClick={onSendEmailCode}
                            disabled={!canSendCode}
                            className="btn bg-orange-500 dark:hover:bg-orange-300 border-0 text-white whitespace-nowrap"
                        >
                            {isSendingCode ? "전송중" : "코드전송"}
                        </button>
                    </div>

                    {/* 이메일 인증코드 + 확인 */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1">
                            <AuthInput placeholder="이메일 인증코드(6자리)" disabled={isEmailVerified} name="emailCode" onChange={onChange} />
                        </div>

                        <button
                            type="button"
                            onClick={onVerifyEmailCode}
                            disabled={!canVerifyCode || isEmailVerified}
                            className="btn bg-black dark:hover:bg-zinc-700 border-0 text-white whitespace-nowrap "
                            style={{ background: isEmailVerified ? "green" : null, cursor: isEmailVerified ? "default" : null }}
                        >
                            {isEmailVerified ?
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                : isVerifyingCode ? "확인중" : "코드확인"}
                        </button>
                    </div>



                    {/* quota(옵션) */}
                    {/* {quota && (
            <div className="text-[0.95rem] text-gray-400 mt-2 text-center">
              오늘 남은 메일: {quota?.daily?.remaining} / {quota?.daily?.limit} · 이번달 남은 메일: {quota?.monthly?.remaining} / {quota?.monthly?.limit}
            </div>
          )} */}

                    {/* 비밀번호 */}
                    <div className="mb-4 mt-4">
                        <AuthInput placeholder="비밀번호를 입력해주세요" type="password" name="pwd" onChange={onChange} />
                    </div>
                    <div className="mb-4">
                        <AuthInput placeholder="비밀번호를 한번 더 입력해주세요" type="password" name="pwdCheck" onChange={onChange} />
                    </div>

                    {/* 에러 */}
                    <div className="text-red-500 text-center">{error}</div>

                    {/* 개인정보 동의 */}
                    <div className="mb-[16px] mt-4 flex items-center gap-2">
                        <input
                            id="privacyCheck"
                            type="checkbox"
                            checked={isPrivacyChecked}
                            onChange={(e) => setIsPrivacyChecked(e.target.checked)}
                        />

                        <label
                            htmlFor="privacyCheck"
                            className="text-[1.2rem] cursor-pointer"
                        >
                            개인정보 수집에 동의합니다
                        </label>

                        <button
                            type="button"
                            onClick={() => document.getElementById('privacyCheckModal').showModal()}
                            className="text-blue-600 underline text-[1.1rem]"
                        >
                            내용 보기
                        </button>
                    </div>

                    <PrivacyCheckModal setIsPrivacyChecked={setIsPrivacyChecked} />

                    <AuthBtn className="text-blue-100 mb-[0px]">
                        {isSubmitting ? "가입중..." : "회원가입"}
                    </AuthBtn>

                    <div className="flex flex-col w-full border-opacity-50">
                        <div className="divider">OR</div>
                    </div>

                    <Link href="../login/teacher">
                        <button className={`btn btn-block bg-orange-500 dark:hover:bg-orange-300  mb-4 text-lg  border-0 text-white`}>
                            로그인
                        </button>
                    </Link>

                </div>
            </div>
        </form>
    )
}