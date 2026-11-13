"use client";
// 조건: 지난 옆자리 피하기 · 떨어뜨리기 · 자리 고정 (그룹은 설정 창의 [그룹] 탭 → GroupEditor)
import { useState } from "react";
import SeatGrid, { seatLabel } from "./SeatGrid";

export default function RulesEditor({ rules, setRules, students, layout }) {
  const [apartA, setApartA] = useState("");
  const [apartB, setApartB] = useState("");
  const [fixUser, setFixUser] = useState(""); // 자리 고정: 고른 학생 (자리표에서 자리를 누르면 고정)
  const byId = Object.fromEntries(students.map((s) => [s.userId, s]));
  const name = (u) => (byId[u] ? `${byId[u].classNumber}.${byId[u].profileNickname ? ` ${byId[u].profileNickname}` : "번"}` : u);

  const box = "rounded-2xl border border-orange-200 bg-white p-4";
  const select = "select select-bordered select-sm max-w-[180px]";
  const studentOptions = students.map((s) => <option key={s.userId} value={s.userId}>{name(s.userId)}</option>);

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={box}>
        <label className="flex cursor-pointer items-center gap-3 text-[1.1rem] font-bold">
          <input type="checkbox" className="checkbox checkbox-warning" checked={Boolean(rules.avoidPrevPartner)} onChange={(e) => setRules({ ...rules, avoidPrevPartner: e.target.checked })} />
          지난번 옆자리였던 친구와 다시 옆자리 되지 않기
        </label>
        <p className="mt-1 text-sm text-gray-500">바로 전 자리에서 왼쪽·오른쪽에 붙어 앉았던 학생끼리는 다시 옆에 앉지 않습니다. (통로 건너편은 옆자리가 아니에요)</p>
      </section>


      <section className={box}>
        <h3 className="font-bold">떨어뜨리기</h3>
        <p className="mb-2 text-sm text-gray-500">두 학생이 앞뒤·옆·대각선으로 붙어 앉지 않게 합니다.</p>
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

      {layout && <FixedSeats rules={rules} setRules={setRules} students={students} layout={layout} byId={byId} name={name} fixUser={fixUser} setFixUser={setFixUser} select={select} box={box} />}
    </div>
  );
}

/** 자리 고정: 학생을 고르고 자리표에서 자리를 누른다. 섞을 때마다 그 자리 (공개 장면은 그대로라 학생들에겐 똑같이 섞인 것처럼 보임) */
function FixedSeats({ rules, setRules, students, layout, byId, name, fixUser, setFixUser, select, box }) {
  const fixed = rules.fixed ?? {};
  const bySeat = Object.fromEntries(Object.entries(fixed).filter(([u]) => byId[u]).map(([u, s]) => [s, u]));
  const marks = Object.fromEntries(Object.keys(bySeat).map((s) => [s, "📌"]));
  const setFixed = (next) => setRules({ ...rules, fixed: next });

  const onSeat = (sid) => {
    if (fixUser) {
      // 고른 학생을 이 자리에 (이 자리에 있던 다른 학생 고정은 풀림)
      const next = Object.fromEntries(Object.entries(fixed).filter(([u, s]) => u !== fixUser && s !== sid));
      next[fixUser] = sid;
      setFixed(next);
      setFixUser("");
    } else if (bySeat[sid]) {
      // 학생을 안 고르고 고정된 자리를 누르면 풀기
      const { [bySeat[sid]]: _, ...rest } = fixed;
      setFixed(rest);
    }
  };

  const list = Object.entries(fixed).filter(([u]) => byId[u]).sort((a, b) => byId[a[0]].classNumber - byId[b[0]].classNumber);

  return (
    <section className={box}>
      <h3 className="font-bold">자리 고정</h3>
      <p className="mb-2 text-sm text-gray-500">
        고정한 학생은 섞을 때마다 그 자리에 앉아요. 자리가 한 칸씩 공개되는 모습은 그대로예요. (시력·청력 등으로 꼭 필요한 자리)
      </p>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <select className={select} value={fixUser} onChange={(e) => setFixUser(e.target.value)}>
          <option value="">학생 선택</option>
          {students.map((s) => (
            <option key={s.userId} value={s.userId}>
              {name(s.userId)}
              {fixed[s.userId] ? ` (📌 ${seatLabel(fixed[s.userId])})` : ""}
            </option>
          ))}
        </select>
        <span className={`text-sm ${fixUser ? "font-semibold text-orange-600" : "text-gray-400"}`}>
          {fixUser ? "👇 아래 자리표에서 앉힐 자리를 누르세요" : "학생을 고른 뒤 자리를 누르세요 · 📌 자리를 누르면 고정이 풀려요"}
        </span>
      </div>
      <div className="flex h-[260px] w-full justify-center [container-type:size]">
        <SeatGrid layout={layout} assignment={bySeat} students={byId} size="fit" onSeatClick={onSeat} marks={marks} selected={fixUser ? fixed[fixUser] ?? null : null} />
      </div>
      {list.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {list.map(([u, s]) => (
            <li key={u} className="flex items-center gap-2 rounded bg-orange-50 px-2 py-1 text-sm">
              📌 {name(u)} → {seatLabel(s)}
              <button
                type="button"
                className="text-gray-400 hover:text-red-500"
                onClick={() => {
                  const { [u]: _, ...rest } = fixed;
                  setFixed(rest);
                }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
