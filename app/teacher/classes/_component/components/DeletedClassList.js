"use client";

import { useState } from "react";

const DAY = 24 * 60 * 60 * 1000;

// 휴지통: 삭제한 학급 목록 + 복구 버튼 (영구 삭제까지 남은 날짜 표시)
export default function DeletedClassList({ classes, onRestore, isRestoring }) {
  const [open, setOpen] = useState(false);
  if (!classes?.length) return null;

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        aria-expanded={open}
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        삭제된 학급 ({classes.length})
      </button>

      {open && (
        <ul className="mt-3 divide-y rounded-xl bg-white/70">
          {classes.map((cls) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(cls.purgeAt) - Date.now()) / DAY));
            return (
              <li key={cls._id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <div className="font-semibold text-gray-600">{cls.className}</div>
                  <div className="text-sm text-gray-400">
                    학생 {cls.studentsCount ?? 0}명 · {daysLeft}일 뒤 영구 삭제
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRestore(cls)}
                  disabled={isRestoring(cls._id)}
                  className="rounded-lg border-2 border-orange-400 px-3 py-1 text-orange-500 hover:bg-orange-50 disabled:opacity-40"
                >
                  {isRestoring(cls._id) ? "복구 중..." : "복구"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
