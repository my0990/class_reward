"use client";

import styles from "./userinfo.module.css";
import { signOut } from "next-auth/react";
import { useRef, useEffect } from "react";
import Link from "next/link";

export default function UserInfo({
  open,
  onClose,
  profileiconRef,
  userId,
  currencyEmoji,
  currencyName,
  settingHref,
  money,
  role
}) {
  const dropDownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      const dropdownEl = dropDownRef.current;
      const profileEl = profileiconRef?.current;
      const target = e.target;

      if (!dropdownEl) return;

      const insideDropdown = dropdownEl.contains(target);
      const insideProfile = profileEl ? profileEl.contains(target) : false;

      if (!insideDropdown && !insideProfile) onClose();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, onClose, profileiconRef]);

  if (!open) return null;

  return (
    <div className="max-[600px]:hidden" ref={dropDownRef}>
      <div className={styles.speechBubble}>
        <div className="flex items-center justify-between text-[1rem]">
          <div className="py-[1rem] px-[8px] ml-[8px]">
            <span className="font-bold">{role === "teacher" ? '관리자' : userId}</span>님, 환영합니다
          </div>

          <button
            type="button"
            className="rounded-[20px] z-50 border-2 py-[4px] px-[8px] text-gray-500 border-gray-300 flex"
            onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })} 
            aria-label="로그아웃"
          >
            로그아웃
          </button>
        </div>

        <ul>
          <li className="pb-[1rem] px-[16px] border-b-2">
            <div className="flex items-center">
              <div className="mr-3">{currencyEmoji}</div>
              <div>{money} {currencyName}</div>
            </div>
          </li>

          <li>
            <Link
              href={settingHref}
              className="block py-[1rem] px-[8px] ml-[8px]"
              onClick={onClose}
            >
              <div className="flex items-center">
                <span className="ml-[8px]">설정</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}