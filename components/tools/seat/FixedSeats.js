"use client";
// 자리 고정 (설정 창 [뀰] 탭의 숨은 버튼으로만 열림 — 학생들이 화면을 봐도 모르게)
import { labelOf } from "./studentLabel";
import { useState } from "react";
import SeatGrid, { seatLabel } from "./SeatGrid";

/** 자리 고정: 학생을 고르고 자리표에서 자리를 누른다. 섞을 때마다 그 자리 (공개 장면은 그대로라 학생들에겐 똑같이 섞인 것처럼 보임) */
export default function FixedSeats({ rules, setRules, students, layout }) {
  const [fixUser, setFixUser] = useState(""); // 고른 학생 (자리표에서 자리를 누르면 고정)
  const byId = Object.fromEntries(students.map((s) => [s.userId, s]));
  const name = labelOf(byId);
  const box = "rounded-2xl border border-orange-200 bg-white p-4";
  const select = "select select-bordered select-sm max-w-[180px]";
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
