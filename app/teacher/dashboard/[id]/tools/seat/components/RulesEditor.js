"use client";
// 조건: 지난 짝 피하기 · 앞자리 · 떨어뜨리기 · 고정 자리
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
  const front = rules.front ?? { userIds: [], rows: 1 };

  const box = "rounded-2xl border border-orange-200 bg-white p-4";
  const select = "select select-bordered select-sm max-w-[180px]";
  const studentOptions = students.map((s) => <option key={s.userId} value={s.userId}>{name(s.userId)}</option>);

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <section className={box}>
        <label className="flex cursor-pointer items-center gap-3 text-[1.1rem] font-bold">
          <input type="checkbox" className="checkbox checkbox-warning" checked={Boolean(rules.avoidPrevPartner)} onChange={(e) => setRules({ ...rules, avoidPrevPartner: e.target.checked })} />
          지난 짝과 다시 짝 되지 않기
        </label>
        <p className="mt-1 text-sm text-gray-500">바로 전에 확정한 자리의 짝을 피합니다.</p>
      </section>

      <section className={box}>
        <h3 className="font-bold">앞자리 학생</h3>
        <p className="mb-2 text-sm text-gray-500">
          앞쪽
          <select className="select select-bordered select-xs mx-1" value={front.rows} onChange={(e) => setRules({ ...rules, front: { ...front, rows: Number(e.target.value) } })}>
            {[...Array(layout.rows).keys()].map((i) => <option key={i} value={i + 1}>{i + 1}</option>)}
          </select>
          줄 안에 앉힙니다. 이름을 눌러 고르세요.
        </p>
        <div className="flex flex-wrap gap-1">
          {students.map((s) => {
            const on = front.userIds.includes(s.userId);
            return (
              <button
                key={s.userId}
                type="button"
                onClick={() => setRules({ ...rules, front: { ...front, userIds: on ? front.userIds.filter((u) => u !== s.userId) : [...front.userIds, s.userId] } })}
                className={`rounded-full px-2 py-1 text-sm ${on ? "bg-orange-500 text-white" : "bg-orange-50 text-gray-600"}`}
              >
                {name(s.userId)}
              </button>
            );
          })}
        </div>
      </section>

      <section className={box}>
        <h3 className="font-bold">떨어뜨리기</h3>
        <p className="mb-2 text-sm text-gray-500">두 학생이 짝이 되거나 앞뒤·옆에 앉지 않게 합니다.</p>
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
    </div>
  );
}
