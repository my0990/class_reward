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

  const reset = () => {
    setPwd("");
    setError("");
    setTextMode(false);
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
    } catch {
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <dialog id={KIOSK_PWD_DIALOG_ID} ref={dialogRef} className="modal modal-middle">
      <div className="modal-box flex flex-col items-center bg-orange-50 p-[24px] min-[600px]:p-[40px] dark:bg-orange-200">
        <div className="text-center text-[1.6rem]">
          <span className="bg-orange-200 px-[6px]">
            {userData?.classNumber}. {userData?.profileNickname}
          </span>
        </div>
        <div className="mt-[4px] text-gray-500">비밀번호를 눌러주세요</div>

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
        />

        <div className="mt-[12px] min-h-[24px] text-center text-red-500" role="alert">
          {error}
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button aria-label="닫기">close</button>
      </form>
    </dialog>
  );
}
