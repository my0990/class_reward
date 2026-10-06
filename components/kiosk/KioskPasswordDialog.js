"use client";

// 키오스크 학생 비밀번호 확인 창 (구매·아이템 사용·기부 공용)
// 부모가 document.getElementById(DIALOG_ID).showModal()로 연다.
// 비밀번호가 맞으면 onSuccess(kioskToken)을 부른다.
// 기본 비밀번호(처음 비밀번호)로 맞혔으면 새 비밀번호를 두 번 입력받아 바꾼 뒤 넘어간다.
import { useEffect, useRef, useState } from "react";
import { checkKioskPassword } from "@/server-action/actions/kiosk/kiosk.action";
import { changeKioskStudentPassword } from "@/server-action/actions/account/studentPassword.action";
import PasswordKeypad from "./PasswordKeypad";

export const KIOSK_PWD_DIALOG_ID = "my_modal_3";

export default function KioskPasswordDialog({ userData, onSuccess }) {
  const dialogRef = useRef(null);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  // check: 비밀번호 확인 → (기본 비밀번호였으면) new: 새 비밀번호 → confirm: 한 번 더
  const [stage, setStage] = useState("check");
  const [pending, setPending] = useState(null); // { kioskToken, classId, newPwd }

  const reset = () => {
    setPwd("");
    setError("");
    setTextMode(false);
    setShakeKey(0);
    setStage("check");
    setPending(null);
  };

  const shake = (message) => {
    setError(message);
    setPwd("");
    setShakeKey((k) => k + 1);
  };

  // 다른 학생을 고르면 처음부터
  useEffect(reset, [userData?.userId]);

  // 창이 닫히면(ESC, 바깥 클릭 포함) 입력 내용을 지운다
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    el.addEventListener("close", reset);
    return () => el.removeEventListener("close", reset);
  }, []);

  const onSubmit = async () => {
    if (isChecking || !pwd) return;

    // 새 비밀번호 1단계: 기억해 두고 한 번 더 입력받기
    if (stage === "new") {
      setPending((p) => ({ ...p, newPwd: pwd }));
      setPwd("");
      setError("");
      setStage("confirm");
      return;
    }

    setIsChecking(true);
    setError("");
    try {
      if (stage === "confirm") {
        if (pwd !== pending.newPwd) {
          setStage("new");
          shake("두 번 누른 비밀번호가 달라요. 처음부터 다시 눌러주세요.");
          return;
        }
        const res = await changeKioskStudentPassword({
          classId: pending.classId,
          userId: userData?.userId,
          kioskToken: pending.kioskToken,
          newPassword: pwd,
        });
        if (res?.result) {
          onSuccess(pending.kioskToken);
          return;
        }
        setStage("new");
        shake(res?.message || "비밀번호를 바꾸지 못했어요.");
        return;
      }

      const data = await checkKioskPassword({ userId: userData?.userId, userPwd: pwd });
      if (data?.result === true) {
        if (data.mustChangePassword) {
          setPending({ kioskToken: data.kioskToken, classId: data.classId });
          setPwd("");
          setStage("new");
          return;
        }
        onSuccess(data.kioskToken);
        return;
      }
      shake(data?.message || "비밀번호를 확인해주세요.");
    } catch {
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  const guide =
    stage === "new"
      ? "처음 비밀번호예요. 나만 아는 새 비밀번호를 눌러주세요 (4자리 이상)"
      : stage === "confirm"
        ? "새 비밀번호를 한 번 더 눌러주세요"
        : "비밀번호를 눌러주세요";

  return (
    <dialog id={KIOSK_PWD_DIALOG_ID} ref={dialogRef} className="modal modal-middle">
      <div className="relative w-[calc(100%-24px)] max-w-[400px] justify-self-center">
      {/* 닫기 버튼: 창(스크롤 영역) 바깥 모서리에 걸쳐 둬서 스크롤바를 가리지 않게 */}
      <form method="dialog" className="absolute right-[-10px] top-[-10px] z-10">
        <button
          aria-label="닫기"
          className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white text-orange-300 shadow ring-1 ring-orange-100 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </form>
      <div
        className="
          modal-box relative flex w-full max-w-[400px] flex-col items-center
          max-h-[calc(100dvh-24px)] overflow-x-hidden overflow-y-auto
          rounded-[36px] bg-gradient-to-b from-orange-50 to-amber-50 px-[24px] pb-[28px] pt-[28px]
          [@media(max-height:760px)]:pt-[18px] [@media(max-height:760px)]:pb-[20px]
          shadow-[0_20px_60px_rgba(251,146,60,0.25)]
        "
      >
        {/* 장식용 동그라미 */}
        <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/40" />
        <span aria-hidden="true" className="pointer-events-none absolute -left-8 top-24 h-16 w-16 rounded-full bg-orange-200/40" />

        <div className="relative">
          {userData?.profileUrl ? (
            <img
              src={userData.profileUrl}
              alt=""
              className="h-[76px] w-[76px] rounded-full border-4 border-white object-cover shadow-[0_4px_12px_rgba(251,146,60,0.35)] [@media(max-height:760px)]:h-[56px] [@media(max-height:760px)]:w-[56px]"
            />
          ) : (
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-4 border-white bg-orange-200 text-[2rem] shadow [@media(max-height:760px)]:h-[56px] [@media(max-height:760px)]:w-[56px]">🍊</div>
          )}
        </div>

        <div className="relative mt-[12px] text-center">
          <div className="text-[1.35rem] font-extrabold text-orange-600">
            {userData?.classNumber != null && <span className="mr-[6px] text-orange-300">{userData.classNumber}번</span>}
            {userData?.profileNickname}
          </div>
          <div className={`mt-[2px] text-[0.95rem] ${stage === "check" ? "text-orange-400" : "font-bold text-rose-500"}`}>{guide}</div>
        </div>

        <PasswordKeypad
          value={pwd}
          onChange={(v) => {
            setPwd(v);
            if (error) setError("");
          }}
          onSubmit={onSubmit}
          disabled={isChecking}
          isActive={() => Boolean(dialogRef.current?.open)}
          textMode={textMode}
          onToggleTextMode={() => setTextMode((v) => !v)}
          shakeKey={shakeKey}
        />

        <div className="mt-[10px] min-h-[22px] text-center text-[0.95rem] font-semibold text-rose-500" role="alert">
          {error}
        </div>
      </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button aria-label="닫기">close</button>
      </form>
    </dialog>
  );
}
