"use client";
// 화폐 지급·회수 창: 이유 입력 (선택) + 자주 쓰는 이유 버튼
// - 최근에 쓴 이유를 반마다·지급/회수마다 이 기기에 기억해서 앞에 보여준다 (localStorage)
// - 같은 버튼을 다시 누르면 지운다
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePointInputContext } from "./PointInputContext";

export const MEMO_MAX = 30; // 서버(handlePointService)와 같은 값
const SHOW = 6;
const KEEP = 12;
const DEFAULTS = {
  send: ["발표", "도움", "청소", "숙제", "칭찬"],
  take: ["지각", "숙제 안 함", "정리 안 함", "약속 안 지킴"],
};

const storageKey = (classId, isSend) => `kkyul:point-reasons:${classId}:${isSend ? "send" : "take"}`;

function readRecent(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** 처리에 성공한 이유를 최근 목록 맨 앞에 */
export function rememberReason(classId, isSend, memo) {
  const m = String(memo ?? "").trim();
  if (!classId || !m) return;
  try {
    const key = storageKey(classId, isSend);
    const next = [m, ...readRecent(key).filter((x) => x !== m)].slice(0, KEEP);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* 저장 못 해도 괜찮음 */
  }
}

export default function ReasonInput({ isSend }) {
  const { id: classId } = useParams();
  const { display, actions } = usePointInputContext();
  const memo = display.memo ?? "";
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(readRecent(storageKey(classId, isSend)));
  }, [classId, isSend]);

  const chips = [...new Set([...recent, ...DEFAULTS[isSend ? "send" : "take"]])].slice(0, SHOW);

  return (
    <div className="mb-3">
      <input
        type="text"
        value={memo}
        maxLength={MEMO_MAX}
        onChange={(e) => actions.setMemo(e.target.value)}
        placeholder="이유 (선택)"
        aria-label="이유 (선택)"
        enterKeyHint="done"
        className="h-[40px] w-full rounded-xl bg-white/95 px-[12px] text-[1rem] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
      />
      {/* 한 줄로, 넘치면 옆으로 밀어서 보기 (창 높이가 늘지 않게) */}
      <div className="mt-[6px] flex gap-[6px] overflow-x-auto pb-[2px] [scrollbar-width:none]">
        {chips.map((c) => {
          const on = memo.trim() === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => actions.setMemo(on ? "" : c)}
              aria-pressed={on}
              className={`shrink-0 rounded-full px-[10px] py-[3px] text-[0.85rem] font-medium ${
                on ? "bg-white text-gray-900" : "bg-white/25 text-white hover:bg-white/40"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
