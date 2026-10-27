// 학급 기록 화면: 같은 순간에 여러 학생에게 같은 내용으로 처리된 기록을 한 줄로 묶는다
// (예: 선생님이 25명에게 한 번에 10씩 지급 → "3번 홍길동 외 24명 · +10")

const sameAction = (a, b) =>
  new Date(a.date).getTime() === new Date(b.date).getTime() &&
  a.name === b.name &&
  a.type === b.type &&
  Number(a.amount) === Number(b.amount) &&
  (a.memo ?? "") === (b.memo ?? "");

/** rows(최신순) → [{ key, date, name, type, amount, kind, items:[원래 줄들] }] */
export function groupHistory(rows) {
  const groups = [];
  for (const r of rows) {
    const last = groups.at(-1);
    if (last && sameAction(last.items[0], r)) last.items.push(r);
    else groups.push({ key: String(r._id), date: r.date, name: r.name, type: r.type, amount: r.amount, kind: r.kind, memo: r.memo ?? null, items: [r] });
  }
  return groups;
}

/** 묶음을 날짜별로: [{ day: "2026-10-22"(로컬), groups: [...] }] */
export function splitByDay(groups) {
  const days = [];
  for (const g of groups) {
    const d = new Date(g.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (days.at(-1)?.day !== key) days.push({ day: key, groups: [] });
    days.at(-1).groups.push(g);
  }
  return days;
}
