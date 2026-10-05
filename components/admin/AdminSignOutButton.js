"use client";
import { signOut } from "next-auth/react";

// 로그아웃하면 관리자 영역을 완전히 벗어나 첫 화면(선생님/학생 로그인)으로 간다
export default function AdminSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })}
      className="btn btn-sm btn-ghost"
    >
      로그아웃
    </button>
  );
}
