"use client";
// 비회원 자리 바꾸기: 학생 명단 만들기 (이 브라우저에만 저장)
// 방식: 번호+이름 / 번호만 / 이름만 — 번호 칸과 이름 칸을 따로 입력
// 엑셀에서 여러 줄을 복사해 칸에 붙여 넣으면 그 칸부터 아래로 채운다 (번호·이름 두 열이면 둘 다)
import { useMemo, useState } from "react";

const MAX = 100;
const MODES = [
  ["both", "번호 + 이름"],
  ["number", "번호만"],
  ["name", "이름만"],
];

const modeOf = (students) =>
  students.some((s) => s.hideNumber) ? "name" : students.length && students.every((s) => !s.profileNickname) ? "number" : "both";
const rowsOf = (students) => (students.length ? students.map((s) => ({ num: String(s.classNumber), name: s.profileNickname ?? "" })) : [{ num: "", name: "" }]);
const sameRoster = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** 입력한 줄 → 명단. userId는 번호로 정한다(n3): 명단을 고쳐도 조건·그룹이 그 번호에 남는다 */
export function buildRoster(rows, mode) {
  const out = [];
  if (mode === "name") {
    // 이름만: 적은 순서대로 1, 2, 3… (화면에는 이름만)
    for (const r of rows) {
      const name = r.name.trim().slice(0, 20);
      if (!name) continue;
      out.push({ userId: `n${out.length + 1}`, classNumber: out.length + 1, profileNickname: name, hideNumber: true });
    }
    return out.slice(0, MAX);
  }
  const used = new Set();
  const typed = rows.map((r) => Number.parseInt(r.num, 10)).filter((n) => n >= 1 && n <= 999);
  let next = 1;
  for (const r of rows) {
    const name = mode === "both" ? r.name.trim().slice(0, 20) : "";
    let n = Number.parseInt(r.num, 10);
    if (!(n >= 1 && n <= 999)) {
      if (mode === "number" || !name) continue; // 번호만인데 번호가 없으면 건너뜀
      while (used.has(next) || typed.includes(next)) next++; // 번호 없이 이름만 쓴 줄은 빈 번호를 붙임
      n = next;
    }
    if (used.has(n)) continue; // 같은 번호는 앞의 것만
    used.add(n);
    out.push({ userId: `n${n}`, classNumber: n, profileNickname: name });
  }
  return out.sort((a, b) => a.classNumber - b.classNumber).slice(0, MAX);
}

export default function RosterEditor({ students, onSave }) {
  const [mode, setMode] = useState(() => modeOf(students));
  const [rows, setRows] = useState(() => rowsOf(students));
  const [count, setCount] = useState(students.length || 25);
  const roster = useMemo(() => buildRoster(rows, mode), [rows, mode]);
  const changed = !sameRoster(roster, students.map(({ userId, classNumber, profileNickname, hideNumber }) => ({ userId, classNumber, profileNickname: profileNickname ?? "", ...(hideNumber ? { hideNumber } : {}) })));
  const showNum = mode !== "name";
  const showName = mode !== "number";

  const setCell = (i, key, value) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const addRow = () =>
    setRows((rs) => {
      if (rs.length >= MAX) return rs;
      const last = Number.parseInt(rs[rs.length - 1]?.num, 10);
      return [...rs, { num: showNum && last >= 1 ? String(last + 1) : "", name: "" }];
    });
  const removeRow = (i) => setRows((rs) => (rs.length > 1 ? rs.filter((_, j) => j !== i) : [{ num: "", name: "" }]));

  // 여러 줄 붙여넣기: 이 칸부터 아래로. 탭으로 나뉜 두 열(번호·이름)이면 둘 다 채움
  const onPaste = (i, key) => (e) => {
    const text = e.clipboardData.getData("text");
    if (!/[\n\t]/.test(text)) return; // 한 칸짜리는 그냥 붙여넣기
    e.preventDefault();
    const lines = text.replace(/\r/g, "").split("\n").filter((l, k, arr) => l.trim() || k < arr.length - 1).filter((l) => l.trim());
    setRows((rs) => {
      const next = [...rs];
      lines.forEach((line, k) => {
        const cells = line.split("\t").map((c) => c.trim());
        const at = i + k;
        if (at >= MAX) return;
        const row = { ...(next[at] ?? { num: "", name: "" }) };
        if (cells.length >= 2 && showNum && showName) {
          row.num = cells[0];
          row.name = cells[1];
        } else {
          row[key] = cells[0];
        }
        next[at] = row;
      });
      return next;
    });
  };

  const makeNumbers = () => {
    const n = Math.min(MAX, Math.max(1, Math.floor(Number(count) || 0)));
    setRows((rs) => Array.from({ length: n }, (_, i) => ({ num: String(i + 1), name: rs[i]?.name ?? "" })));
  };

  const cell = "input input-bordered input-sm w-full";
  return (
    <section className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">학생 명단</h3>
        <p className="text-xs text-gray-500">🔒 이름은 서버로 보내지 않고 이 컴퓨터(브라우저)에만 저장돼요.</p>
      </div>

      {/* 방식 고르기 */}
      <div role="radiogroup" aria-label="명단 방식" className="mb-3 inline-flex rounded-lg bg-white p-[2px]">
        {MODES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={mode === key}
            onClick={() => setMode(key)}
            className={`rounded-md px-3 py-1 text-sm font-semibold ${mode === key ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {showNum && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <input type="number" min={1} max={MAX} value={count} onChange={(e) => setCount(e.target.value)} className="input input-bordered input-sm w-20" aria-label="학생 수" />
          <button type="button" className="btn btn-sm border-0 bg-white text-gray-700 hover:bg-orange-100" onClick={makeNumbers}>
            1~{Math.min(MAX, Math.max(1, Math.floor(Number(count) || 0)))}번 번호 채우기
          </button>
        </div>
      )}

      {/* 번호 칸 · 이름 칸 */}
      <div className="max-h-[320px] overflow-y-auto rounded-xl bg-white p-2">
        <div className={`mb-1 grid gap-2 px-1 text-xs font-semibold text-gray-500 ${showNum && showName ? "grid-cols-[80px_1fr_32px]" : "grid-cols-[1fr_32px]"}`}>
          {showNum && <span>번호</span>}
          {showName && <span>이름</span>}
          <span />
        </div>
        <div className="flex flex-col gap-1">
          {rows.map((r, i) => (
            <div key={i} className={`grid items-center gap-2 ${showNum && showName ? "grid-cols-[80px_1fr_32px]" : "grid-cols-[1fr_32px]"}`}>
              {showNum && (
                <input
                  className={`${cell} text-center tabular-nums`}
                  inputMode="numeric"
                  value={r.num}
                  onChange={(e) => setCell(i, "num", e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                  onPaste={onPaste(i, "num")}
                  aria-label={`${i + 1}째 줄 번호`}
                />
              )}
              {showName && (
                <input
                  className={cell}
                  value={r.name}
                  maxLength={20}
                  onChange={(e) => setCell(i, "name", e.target.value)}
                  onPaste={onPaste(i, "name")}
                  onKeyDown={(e) => e.key === "Enter" && i === rows.length - 1 && (e.preventDefault(), addRow())}
                  placeholder={i === 0 ? "엑셀에서 여러 줄을 복사해 붙여 넣어도 돼요" : ""}
                  aria-label={`${i + 1}째 줄 이름`}
                />
              )}
              <button type="button" onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-500" aria-label="이 줄 지우기">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} disabled={rows.length >= MAX} className="mt-2 w-full rounded-lg border border-dashed border-orange-300 py-1 text-sm text-orange-600 hover:bg-orange-50">
          + 한 명 추가
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-gray-600">
          {roster.length}명{changed ? " (아직 반영 안 됨)" : ""}
        </span>
        <button type="button" disabled={!changed} className="btn btn-sm border-0 bg-orange-500 text-white hover:bg-orange-600" onClick={() => onSave(roster)}>
          명단 반영
        </button>
      </div>
    </section>
  );
}
