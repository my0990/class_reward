"use client";

// 키오스크 학생 비밀번호 확인 창 (구매·아이템 사용·기부 공용)
// 부모가 document.getElementById(DIALOG_ID).showModal()로 연다.
// 비밀번호가 맞으면 onSuccess(kioskToken)을 부른다.
import { useEffect, useRef, useState } from "react";
import { checkKioskPassword } from "@/server-action/actions/kiosk/kiosk.action";
import PasswordKeypad from "./PasswordKeypad";

export const KIOSK_PWD_DIALOG_ID = "my_modal_3";

export default function KioskPasswordDialog({ userData, onSuccess }) {
  const dialogRef = useRef(null);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const reset = () => {
    setPwd("");
    setError("");
    setTextMode(false);
    setShakeKey(0);
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
    setIsChecking(true);
    setError("");
    try {
      const data = await checkKioskPassword({ userId: userData?.userId, userPwd: pwd });
      if (data?.result === true) {
        onSuccess(data.kioskToken);
        return;
      }
      setError(data?.message || "비밀번호를 확인해주세요.");
      setPwd("");
      setShakeKey((k) => k + 1);
    } catch {
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <dialog id={KIOSK_PWD_DIALOG_ID} ref={dialogRef} className="modal modal-middle">
      <div
        className="
          modal-box relative flex max-w-[400px] flex-col items-center
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
          <span className="absolute -bottom-1 -right-1 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[1rem] shadow">🔒</span>
        </div>

        <div className="relative mt-[12px] text-center">
          <div className="text-[1.35rem] font-extrabold text-orange-600">
            {userData?.classNumber != null && <span className="mr-[6px] text-orange-300">{userData.classNumber}번</span>}
            {userData?.profileNickname}
          </div>
          <div className="mt-[2px] text-[0.95rem] text-orange-400">비밀번호를 눌러주세요</div>
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

      <form method="dialog" className="modal-backdrop">
        <button aria-label="닫기">close</button>
      </form>
    </dialog>
  );
}
