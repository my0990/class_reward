"use client";
// 프로필 메뉴의 '관리자' 항목 (ADMIN_EMAILS에 있는 선생님 계정에만 보임)
// - 관리자 모드가 꺼져 있으면: 관리자 비밀번호를 한 번 확인 → 12시간 동안 선생님 로그인 그대로 관리자 화면 사용
// - 켜져 있으면: 바로 관리자 화면으로
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { enableAdminMode } from "@/server-action/admin/adminMode.action";

const rowClass = "block w-full py-[1rem] px-[8px] ml-[6px] text-left";

export default function AdminModeItem({ active, onClose }) {
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const label = (text) => (
    <div className="flex items-center">
      <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
      <div>{text}</div>
    </div>
  );

  if (active) {
    return (
      <Link href="/admin" className={rowClass} onClick={() => onClose?.(false)}>
        {label("관리자 화면")}
      </Link>
    );
  }

  if (!asking) {
    return (
      <button type="button" className={rowClass} onClick={() => setAsking(true)}>
        {label("관리자 모드 켜기")}
      </button>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    try {
      const res = await enableAdminMode({ password });
      if (!res?.result) return void toast.error(res?.message || "확인하지 못했어요.");
      const signed = await signIn("credentials", { role: "admin-mode", token: res.token, redirect: false });
      if (!signed?.ok) return void toast.error("관리자 모드를 켜지 못했어요. 다시 시도해 주세요.");
      window.location.href = "/admin"; // 새 세션으로 깨끗하게 다시 읽는다
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 px-[14px] py-[10px]">
      <label htmlFor="admin-mode-password" className="text-[0.85rem] text-gray-500">
        관리자 비밀번호 확인 (12시간 유지)
      </label>
      <input
        id="admin-mode-password"
        type="password"
        autoFocus
        autoComplete="off"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setAsking(false), setPassword(""))}
        className="input input-bordered input-sm w-full"
      />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => (setAsking(false), setPassword(""))}>
          취소
        </button>
        <button type="submit" className="btn btn-xs border-0 bg-orange-500 text-white hover:bg-orange-600" disabled={busy || !password}>
          {busy ? "확인 중..." : "확인"}
        </button>
      </div>
    </form>
  );
}
