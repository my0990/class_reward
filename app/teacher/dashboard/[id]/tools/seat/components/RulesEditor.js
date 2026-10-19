"use client";
// 조건: 지난 옆자리 피하기 · 떨어뜨리기 · 고정 자리 (그룹은 설정 창의 [그룹] 탭 → GroupEditor)
import { useState } from "react";
import { deskSeats } from "@/util/seat/seatAlgorithm";
import { seatLabel } from "./SeatGrid";

export default function RulesEditor({ rules, setRules, layout, students }) {
  const [apartA, setApartA] = useState("");
  const [apartB, setApartB] = useState("");
  const [fixUser, setFixUser] = useState("");
  const [fixSeat, setFixSeat] = useState("");
  const byId = Object.fromEntries(students.map((s) => [s.userId, s]));
  const name = (u) => (byId[u] ? `${byId[u].classNumber}. ${byId[u].profileNickname}` : u);
  const seats = deskSeats(layout);

  const box = "rounded-2xl border border-orange-200 bg-white p-4";
  const select = "select select-bordered select-sm max-w-[180px]";
  const studentOptions = students.map((s) => <option key={s.userId} value={s.userId}>{name(s.userId)}</option>);

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <section className={box}>
        <label className="flex cursor-pointer items-center gap-3 text-[1.1rem] font-bold">
          <input type="checkbox" className="checkbox checkbox-warning" checked={Boolean(rules.avoidPrevPartner)} onChange={(e) => setRules({ ...rules, avoidPrevPartner: e.target.checked })} />
          지난번 옆자리였던 친구와 다시 옆자리 되지 않기
        </label>
        <p className="mt-1 text-sm text-gray-500">바로 전 자리에서 왼쪽·오른쪽에 붙어 앉았던 학생끼리는 다시 옆에 앉지 않습니다. (통로 건너편은 옆자리가 아니에요)</p>
      </section>

      <section className={box}>
        <h3 className="font-bold">고정 자리</h3>
        <p className="mb-2 text-sm text-gray-500">학생을 늘 같은 자리에 앉힙니다.</p>
        <div className="flex flex-wrap items-center gap-2">
          <select className={select} value={fixUser} onChange={(e) => setFixUser(e.target.value)}><option value="">학생 선택</option>{studentOptions}</select>
          <select className={select} value={fixSeat} onChange={(e) => setFixSeat(e.target.value)}>
            <option value="">자리 선택</option>
            {seats.map((s) => <option key={s} value={s}>{seatLabel(s)}</option>)}
          </select>
          <button
            type="button"
            className="btn btn-sm bg-orange-500 text-white"
            disabled={!fixUser || !fixSeat}
            onClick={() => {
              const fixed = Object.fromEntries(Object.entries(rules.fixed ?? {}).filter(([u, s]) => u !== fixUser && s !== fixSeat));
              setRules({ ...rules, fixed: { ...fixed, [fixUser]: fixSeat } });
              setFixUser("");
              setFixSeat("");
            }}
          >
            추가
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {Object.entries(rules.fixed ?? {}).map(([u, s]) => (
            <li key={u} className="flex items-center justify-between rounded bg-orange-50 px-2 py-1 text-sm">
              {name(u)} → {seatLabel(s)}
              <button type="button" className="text-gray-400 hover:text-red-500" onClick={() => setRules({ ...rules, fixed: Object.fromEntries(Object.entries(rules.fixed).filter(([x]) => x !== u)) })}>삭제</button>
            </li>
          ))}
        </ul>
      </section>

      <section className={box}>
        <h3 className="font-bold">떨어뜨리기</h3>
        <p className="mb-2 text-sm text-gray-500">두 학생이 앞뒤나 옆에 붙어 앉지 않게 합니다.</p>
        <div className="flex flex-wrap items-center gap-2">
          <select className={select} value={apartA} onChange={(e) => setApartA(e.target.value)}><option value="">학생 선택</option>{studentOptions}</select>
          <select className={select} value={apartB} onChange={(e) => setApartB(e.target.value)}><option value="">학생 선택</option>{studentOptions}</select>
          <button
            type="button"
            className="btn btn-sm bg-orange-500 text-white"
            disabled={!apartA || !apartB || apartA === apartB}
            onClick={() => {
              setRules({ ...rules, apart: [...(rules.apart ?? []), [apartA, apartB]] });
              setApartB("");
            }}
          >
            추가
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {(rules.apart ?? []).map(([a, b], i) => (
            <li key={`${a}-${b}-${i}`} className="flex items-center justify-between rounded bg-orange-50 px-2 py-1 text-sm">
              {name(a)} ↔ {name(b)}
              <button type="button" className="text-gray-400 hover:text-red-500" onClick={() => setRules({ ...rules, apart: rules.apart.filter((_, j) => j !== i) })}>삭제</button>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
