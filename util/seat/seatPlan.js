// 자리 바꾸기 데이터 정리·기록 계산 (서버 저장과 비회원 브라우저 저장이 같이 쓴다 — DB를 모름)
import { LAYOUT_LIMITS, GROUP_COLORS, deskSeats, normalizeRules } from "@/util/seat/seatAlgorithm";

export const GROUP_MAX = 20;
const GROUP_NAME_MAX = 20;

export const SEAT_HISTORY_MAX = 5;

/** 교실 배치 검사 → 정리된 layout 또는 { error } */
export function cleanLayout(layout) {
  const rows = Number(layout?.rows);
  const cols = Number(layout?.cols);
  const ok = (n) => Number.isInteger(n) && n >= LAYOUT_LIMITS.MIN && n <= LAYOUT_LIMITS.MAX;
  if (!ok(rows) || !ok(cols)) return { error: `줄과 칸은 ${LAYOUT_LIMITS.MIN}~${LAYOUT_LIMITS.MAX} 사이로 정해 주세요.` };
  const desks = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => Boolean(layout?.desks?.[r]?.[c])));
  return { layout: { rows, cols, desks } };
}

/** 조건 검사: 이 학급 학생만, 책상이 있는 자리만 남긴다 */
export function cleanRules(rules, layout, studentIds) {
  const seats = new Set(deskSeats(layout));
  const fixed = {};
  for (const [u, s] of Object.entries(rules?.fixed ?? {})) if (studentIds.has(u) && seats.has(s)) fixed[u] = s;
  // 그룹: 이 학급 학생만, 책상이 있는 자리만, 중복 없이 (예전 front → '앞자리' 그룹)
  const groups = [];
  const groupIds = new Set();
  for (const [i, g] of normalizeRules(rules ?? {}, layout).groups.entries()) {
    if (groups.length >= GROUP_MAX || !g || typeof g !== "object") continue;
    let id = String(g.id ?? "").slice(0, 40) || `g${i}`;
    while (groupIds.has(id)) id += "_";
    groupIds.add(id);
    const color = Number.isInteger(g.color) && g.color >= 0 && g.color < GROUP_COLORS.length ? g.color : i % GROUP_COLORS.length;
    groups.push({
      id,
      name: String(g.name ?? "").trim().slice(0, GROUP_NAME_MAX) || `그룹 ${groups.length + 1}`,
      color,
      userIds: [...new Set((g.userIds ?? []).filter((u) => studentIds.has(u)))],
      seats: [...new Set((g.seats ?? []).filter((sid) => seats.has(sid)))],
    });
  }
  const apart = [];
  const seen = new Set();
  for (const pair of rules?.apart ?? []) {
    const [a, b] = Array.isArray(pair) ? pair : [];
    if (!studentIds.has(a) || !studentIds.has(b) || a === b) continue;
    const key = [a, b].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    apart.push([a, b]);
  }
  const excluded = [...new Set((rules?.excluded ?? []).filter((u) => studentIds.has(u)))];
  return { fixed, groups, apart, avoidPrevPartner: Boolean(rules?.avoidPrevPartner), excluded };
}

/** 새 자리 저장 → { current, history } (replace면 지금 자리만 바꾸고 기록에 안 넣음) */
export function pushSeatRecord(plan, record, { replace = false } = {}) {
  const prev = plan?.history ?? [];
  const history = plan?.current && !replace ? [plan.current, ...prev].slice(0, SEAT_HISTORY_MAX) : prev;
  return { current: record, history };
}

/** 기록 하나 지우기 (at = confirmedAt) → { current, history } 또는 null(없는 기록). 지금 자리를 지우면 바로 전 기록이 지금 자리 */
export function removeSeatRecord(plan, at) {
  const time = new Date(at).getTime();
  if (!at || Number.isNaN(time)) return null;
  const same = (r) => r?.confirmedAt && new Date(r.confirmedAt).getTime() === time;
  const current = plan?.current ?? null;
  const history = plan?.history ?? [];
  if (same(current)) return { current: history[0] ?? null, history: history.slice(1) };
  if (history.some(same)) return { current, history: history.filter((r) => !same(r)) };
  return null;
}
