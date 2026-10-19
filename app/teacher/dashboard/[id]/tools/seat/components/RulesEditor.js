"use client";
// 조건: 지난 짝 피하기 · 그룹(앉을 수 있는 자리) · 떨어뜨리기 · 고정 자리
import { useState } from "react";
import { deskSeats } from "@/util/seat/seatAlgorithm";
import { seatLabel } from "./SeatGrid";
import GroupEditor from "./GroupEditor";

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
          지난 짝과 다시 짝 되지 않기
        </label>
        <p className="mt-1 text-sm text-gray-500">바로 전에 확정한 자리의 짝을 피합니다.</p>
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

      <section className={`${box} md:col-span-2`}>
        <h3 className="font-bold">그룹</h3>
        <p className="mb-3 text-sm text-gray-500">
          그룹을 만들고 학생을 넣은 뒤, 그 그룹 학생이 앉을 수 있는 자리를 고르세요. 한 학생이 여러 그룹에 들어가면 모든 그룹 자리가 겹치는 곳에만 앉습니다.
        </p>
        <GroupEditor groups={rules.groups ?? []} setGroups={(groups) => setRules({ ...rules, groups })} layout={layout} students={students} name={name} />
      </section>
    </div>
  );
}
