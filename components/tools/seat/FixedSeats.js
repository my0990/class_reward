"use client";
// 자리 고정 (설정 창 [뀰] 탭에서 코드를 맞게 넣어야 열림 — 학생들이 화면을 봐도 모르게)
// 자리를 누르면 그 자리 옆에 학생 목록 → 학생을 누르면 그 자리에 고정 (자리표에 이름이 보임). 고정된 자리는 목록에서 '비우기'
import { useEffect, useRef, useState } from "react";
import SeatGrid from "./SeatGrid";
import { labelOf } from "./studentLabel";

export default function FixedSeats({ rules, setRules, students, layout }) {
  const [open, setOpen] = useState(null); // { sid, x, y } 학생 목록을 띄운 자리
  const wrapRef = useRef(null);
  const byId = Object.fromEntries(students.map((s) => [s.userId, s]));
  const name = labelOf(byId);
  const fixed = rules.fixed ?? {};
  const bySeat = Object.fromEntries(Object.entries(fixed).filter(([u]) => byId[u]).map(([u, s]) => [s, u]));
  const setFixed = (next) => setRules({ ...rules, fixed: next });

  // 자리를 누르면 그 자리 아래(공간이 없으면 위)에 목록
  const onSeat = (sid) => {
    if (open?.sid === sid) return setOpen(null);
    const wrap = wrapRef.current?.getBoundingClientRect();
    const el = wrapRef.current?.querySelector(`[data-seat="${sid}"]`)?.getBoundingClientRect();
    if (!wrap || !el) return;
    setOpen({ sid, x: el.left + el.width / 2 - wrap.left, top: el.bottom - wrap.top + 6, bottom: wrap.bottom - el.top + 6, up: el.top - wrap.top > wrap.height / 2 });
  };

  const pick = (u) => {
    const sid = open.sid;
    // 이 학생이 다른 자리에 고정돼 있었거나 이 자리에 다른 학생이 있었으면 그건 풀린다
    const next = Object.fromEntries(Object.entries(fixed).filter(([v, s]) => v !== u && s !== sid));
    if (u) next[u] = sid;
    setFixed(next);
    setOpen(null);
  };

  // 바깥을 누르거나 Esc → 목록만 닫기 (설정 창은 그대로)
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!e.target.closest?.("[data-fix-menu]") && !e.target.closest?.("[data-seat]")) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  return (
    <section className="rounded-2xl border border-orange-200 bg-white p-4">
      <h3 className="mb-2 font-bold">자리 고정</h3>
      <div ref={wrapRef} className="relative">
        <div className="flex h-[min(420px,50vh)] w-full justify-center [container-type:size]">
          <SeatGrid layout={layout} assignment={bySeat} students={byId} size="fit" onSeatClick={onSeat} selected={open?.sid ?? null} />
        </div>

        {open && (
          <div
            data-fix-menu
            onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setOpen(null))}
            className="absolute z-20 w-[220px] -translate-x-1/2 rounded-xl border border-orange-200 bg-white p-2 shadow-xl"
            style={{ left: Math.min(Math.max(open.x, 110), (wrapRef.current?.clientWidth ?? 220) - 110), ...(open.up ? { bottom: open.bottom } : { top: open.top }) }}
          >
            {bySeat[open.sid] && (
              <button type="button" onClick={() => pick(null)} className="mb-1 w-full rounded-lg px-2 py-1 text-left text-sm text-red-500 hover:bg-red-50">
                비우기
              </button>
            )}
            <ul className="max-h-[240px] overflow-y-auto overscroll-contain">
              {students.map((s) => {
                const here = bySeat[open.sid] === s.userId;
                return (
                  <li key={s.userId}>
                    <button
                      type="button"
                      autoFocus={here}
                      onClick={() => pick(s.userId)}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-sm hover:bg-orange-50 ${here ? "bg-orange-100 font-bold" : ""}`}
                    >
                      <span className="truncate">{name(s.userId)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
