"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { getWithdrawSummary, withdrawTeacher } from "@/server-action/actions/account/withdraw.action";

const CONFIRM_TEXT = "탈퇴합니다"; // withdraw.service.js의 WITHDRAW_CONFIRM_TEXT와 같게

// 회원 탈퇴 확인 창: 삭제될 개수 안내 → 현재 비밀번호 + '탈퇴합니다' 입력 → 즉시 영구 삭제 후 로그아웃
export default function WithdrawModal({ modalId, setModalId }) {
  const isOpen = modalId === "WITHDRAW";
  const [summary, setSummary] = useState(null);
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPassword("");
    setTyped("");
    setError("");
    setSummary(null);
    getWithdrawSummary().then((res) => res?.result && setSummary(res.data)).catch(() => {});
  }, [isOpen]);

  const canSubmit = password !== "" && typed.trim() === CONFIRM_TEXT && !isWorking;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setIsWorking(true);
    setError("");
    const res = await withdrawTeacher({ password, confirmText: typed }).catch(() => null);
    if (res?.result) {
      alert(res.message);
      await signOut({ callbackUrl: `${window.location.origin}/` });
      return;
    }
    setError(res?.message ?? "탈퇴 처리 중 오류가 발생했습니다.");
    setIsWorking(false);
  }

  return (
    <ModalTemplate id="WITHDRAW" modalId={modalId} setModalId={setModalId} className="w-[calc(100%-32px)] max-w-[460px]">
      {({ close }) => (
        <form className="p-6" onSubmit={onSubmit}>
          <h2 className="mb-4 text-xl font-bold">회원 탈퇴</h2>

          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-700">
            {summary ? (
              <>
                학급 <b>{summary.classes}개</b>(삭제된 학급 포함)와 학생 계정 <b>{summary.students}개</b>, 잔액·아이템·퀘스트·거래 기록이{" "}
                <b>모두 즉시 삭제</b>됩니다.
              </>
            ) : (
              <>모든 학급과 학생 계정, 잔액·아이템·퀘스트·거래 기록이 <b>모두 즉시 삭제</b>됩니다.</>
            )}
            <br />
            삭제된 정보는 <b>복구할 수 없습니다.</b> 학생들도 더 이상 로그인할 수 없습니다.
          </div>

          <label htmlFor="withdrawPassword" className="mb-1 block text-sm text-gray-600">
            현재 비밀번호
          </label>
          <input
            id="withdrawPassword"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3 w-full border p-2"
          />

          <label htmlFor="withdrawConfirm" className="mb-1 block text-sm text-gray-600">
            확인을 위해 <b>{CONFIRM_TEXT}</b>를 입력하세요
          </label>
          <input
            id="withdrawConfirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            placeholder={CONFIRM_TEXT}
            className="mb-3 w-full border p-2"
          />

          {error && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className="rounded bg-gray-300 px-4 py-2">
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded bg-red-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isWorking ? "탈퇴 처리 중..." : "탈퇴"}
            </button>
          </div>
        </form>
      )}
    </ModalTemplate>
  );
}
