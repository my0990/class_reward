'use client';

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Typewriter from "typewriter-effect";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import AuthInput from "../../components/authInput";
import AuthBtn from "../../components/authBtn";
import lottieJson from "@/public/tangerine.json";

export default function AuthPage({ role }) {
  const router = useRouter();
  const Lottie = useMemo(
    () => dynamic(() => import("react-lottie-player"), { ssr: false }),
    []
  );

  const isTeacher = role === "teacher";

  const [form, setForm] = useState({
    id: "", // student: userId / teacher: email 입력칸(그대로 id state로 유지)
    pwd: "",
  });

  const [touched, setTouched] = useState({
    id: false,
    pwd: false,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(""); // 입력 시작하면 상단 에러 초기화
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const id = String(form.id ?? "").trim();
    const pwd = String(form.pwd ?? "");

    if (!id) return isTeacher ? "이메일을 입력해주세요" : "아이디를 입력하세요";
    if (isTeacher && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) return "이메일 형식이 올바르지 않습니다";
    if (!pwd) return "비밀번호를 입력하세요";

    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 전체 폼 제출 시엔 전부 touched 처리
    setTouched({ id: true, pwd: true });

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // ✅ NextAuth authorize에서 role에 따라 id/email로 분기하도록 바꿨으니,
      // teacher면 email로, student면 id로 보내야 함.
      const payload = isTeacher
        ? { role: "teacher", email: form.id.trim(), password: form.pwd }
        : { role: "student", id: form.id.trim(), password: form.pwd };

      const res = await signIn("credentials", {
        ...payload,
        redirect: false,
      });

      if (!res?.ok) {
        // 기본 에러는 CredentialsSignin으로 오는 경우가 많음
        setError("아이디/이메일 또는 비밀번호가 올바르지 않습니다");
        return;
      }

      // 로그인 성공 후 이동
      router.push(isTeacher ? "/teacher/classes" : "/");
      router.refresh();
    } catch (err) {
      setError("네트워크 오류");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 인풋별 간단한 인라인 에러(원하면 유지/삭제 가능)
  const idInlineError =
    touched.id && !String(form.id ?? "").trim()
      ? (isTeacher ? "이메일을 입력해주세요" : "아이디를 입력하세요")
      : touched.id && isTeacher && String(form.id ?? "").trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.id).trim())
      ? "이메일 형식이 올바르지 않습니다"
      : "";

  const pwdInlineError =
    touched.pwd && !String(form.pwd ?? "")
      ? "비밀번호를 입력하세요"
      : "";

  return (
    <form onSubmit={onSubmit}>
      <div className="w-full h-screen flex flex-col items-center justify-center min-h-[800px]">
        <div className="w-10/12 min-[500px]:w-[400px] mx-5">
          <div className="text-[1.8rem] min-[500px]:text-[2rem] text-center caret-orange-500">
            <Typewriter
              options={{
                strings: ["안녕하세요", "학급 보상 관리 시스템", "[뀰]입니다", "...........", "뀰!!!!!!!"],
                autoStart: true,
                wrapperClassName: "typeWriter",
                cursorClassName: "typeWriterCursor",
                loop: true,
              }}
            />
          </div>

          <div className="relative w-[80vw] h-[80vw] min-[400px]:w-[300px] min-[400px]:h-[300px] overflow-hidden border-orange-400 mx-auto rounded-full flex items-center justify-center">
            <div className="absolute min-[500px]:w-[500px] min-[500px]:h-[500px] w-[400px]">
              <Lottie loop animationData={lottieJson} play />
            </div>
          </div>

          <div>
            <h1 className="text-[1.8rem] mb-[8px]">
              {isTeacher ? "선생님" : "학생"} 로그인
            </h1>

            {/* ID / Email */}
            <AuthInput
              placeholder={isTeacher ? "이메일을 입력해주세요" : "아이디를 입력해주세요"}
              name="id"
              value={form.id}
              onChange={onChange}
              onBlur={onBlur}
            />
            {idInlineError ? (
              <div className="text-red-500 text-center mt-2">{idInlineError}</div>
            ) : null}

            {/* Password */}
            <AuthInput
              placeholder="비밀번호를 입력해주세요"
              name="pwd"
              type="password"
              value={form.pwd}
              onChange={onChange}
              onBlur={onBlur}
            />
            {pwdInlineError ? (
              <div className="text-red-500 text-center mt-2">{pwdInlineError}</div>
            ) : null}

            {/* 공통 에러(서버/로그인 실패 등) */}
            {error ? (
              <div className="text-red-500 text-center mt-3 mb-3">{error}</div>
            ) : (
              <div className="mb-3" />
            )}

            <AuthBtn className="text-blue-100 mb-[0px]" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "로그인중..." : "로그인"}
            </AuthBtn>

            {isTeacher ? (
              <div className="text-center mt-[8px]">
                아이디가 없으세요?{" "}
                <Link href="/auth/signup">
                  <span className="text-orange-500 cursor-pointer hover:underline">회원가입</span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}