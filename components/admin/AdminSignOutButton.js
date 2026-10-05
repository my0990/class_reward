"use client";
import { signOut } from "next-auth/react";

export default function AdminSignOutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="btn btn-sm btn-ghost">
      로그아웃
    </button>
  );
}
