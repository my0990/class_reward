"use client";
// 관리자 모드(선생님 로그인 + 관리자 권한)일 때 관리자 화면 오른쪽 위: 관리자 권한만 끄고 선생님 화면으로
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { disableAdminMode } from "@/server-action/admin/adminMode.action";

export default function AdminModeOffButton() {
  const [busy, setBusy] = useState(false);
  const off = async () => {
    setBusy(true);
    try {
      const res = await disableAdminMode();
      const signed = res?.result ? await signIn("credentials", { role: "admin-mode", token: res.token, redirect: false }) : null;
      if (!signed?.ok) return void toast.error(res?.message || "관리자 모드를 끄지 못했어요.");
      window.location.href = "/teacher/classes";
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" onClick={off} disabled={busy} className="btn btn-sm btn-ghost">
      {busy ? "끄는 중..." : "관리자 모드 끄기"}
    </button>
  );
}
