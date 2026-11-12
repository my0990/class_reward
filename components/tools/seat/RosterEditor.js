"use client";
// 비회원 자리 바꾸기: 학생 명단 넣기 (이 브라우저에만 저장)
// 한 줄에 한 명 "번호 이름" · 이름 없이 번호만 · 또는 "1~25번 만들기"
import { useState } from "react";
import { parseRoster, rosterToText } from "./useGuestSeatStore";

export default function RosterEditor({ students, onSave }) {
  const [text, setText] = useState(() => rosterToText(students));
  const [count, setCount] = useState(students.length || 25);
  const parsed = parseRoster(text);
  const changed = rosterToText(parsed) !== rosterToText(students);

  return (
    <section className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">학생 명단</h3>
        <p className="text-xs text-gray-500">🔒 이름은 서버로 보내지 않고 이 컴퓨터(브라우저)에만 저장돼요.</p>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-600">번호만 쓰기:</span>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="input input-bordered input-sm w-20"
          aria-label="학생 수"
        />
        <button
          type="button"
          className="btn btn-sm border-0 bg-white text-gray-700 hover:bg-orange-100"
          onClick={() => {
            const n = Math.min(100, Math.max(1, Math.floor(Number(count) || 0)));
            setText(Array.from({ length: n }, (_, i) => String(i + 1)).join("\n"));
          }}
        >
          1~{Math.min(100, Math.max(1, Math.floor(Number(count) || 0)))}번 만들기
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={"한 줄에 한 명씩 (엑셀에서 붙여 넣어도 돼요)\n1 김하늘\n2 이바다\n3 (이름 없이 번호만 써도 돼요)"}
        className="textarea textarea-bordered w-full font-mono text-sm leading-6"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-gray-600">
          {parsed.length}명{parsed.length !== students.length || changed ? " (아직 반영 안 됨)" : ""}
        </span>
        <button
          type="button"
          disabled={!changed}
          className="btn btn-sm border-0 bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => onSave(parsed)}
        >
          명단 반영
        </button>
      </div>
    </section>
  );
}
