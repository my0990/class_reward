// 자리 바꾸기 계산 (화면·DB와 분리된 순수 함수 → 단위 테스트)
//
// 교실 배치(layout)
//   { rows, cols, desks: boolean[rows][cols] }   true = 책상 있음 / false = 통로·빈칸
//   자리 id = "줄-칸" (0부터, 0줄이 칠판 바로 앞)
//   옆자리 = 같은 줄에서 바로 왼쪽·오른쪽 책상 (통로를 사이에 두면 옆자리 아님)
//
// 조건(rules)
//   fixed:  { [userId]: seatId }           고정 자리
//   groups: [{ id, name, color, userIds: [], seats: [seatId] }]
//           그룹 학생은 그룹 자리 중 하나에만 앉는다. 여러 그룹이면 모든 그룹 자리가 겹치는 곳에만.
//           자리를 하나도 고르지 않은 그룹은 아직 조건이 아닌 것으로 본다. 그룹 자리에 다른 학생이 앉는 건 막지 않는다.
//   (예전) front: { userIds, rows } 앞쪽 n줄 → normalizeRules가 '앞자리' 그룹으로 바꾼다
//   apart:  [[userIdA, userIdB], ...]      앞뒤·옆자리 금지
//   avoidPrevPartner: boolean               바로 전 배치에서 옆자리였던 학생과 다시 옆자리 금지
//                                           (이름은 예전 '지난 짝 피하기' 그대로. 2칸·3칸씩 붙은 책상 모두에 맞음)
//
// 결과: { ok: true, assignment: { [seatId]: userId } } 또는 { ok: false, reason }

export const LAYOUT_LIMITS = { MIN: 1, MAX: 10 };

export const seatId = (r, c) => `${r}-${c}`;
export function parseSeatId(id) {
  const [r, c] = String(id).split("-").map(Number);
  return { r, c };
}

export function makeLayout(rows, cols, fill = true) {
  return { rows, cols, desks: Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill)) };
}

/** 책상이 있는 자리 id 목록 (앞줄부터) */
export function deskSeats(layout) {
  const out = [];
  for (let r = 0; r < layout.rows; r++) for (let c = 0; c < layout.cols; c++) if (layout.desks?.[r]?.[c]) out.push(seatId(r, c));
  return out;
}

const isDesk = (layout, r, c) => r >= 0 && c >= 0 && r < layout.rows && c < layout.cols && Boolean(layout.desks?.[r]?.[c]);

/** 짝 자리 id (없으면 null) */
export function partnerSeat(layout, id) {
  const { r, c } = parseSeatId(id);
  const pc = c % 2 === 0 ? c + 1 : c - 1;
  return isDesk(layout, r, pc) ? seatId(r, pc) : null;
}

/** 앞뒤·옆 자리 id 목록 */
export function neighborSeats(layout, id) {
  const { r, c } = parseSeatId(id);
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([rr, cc]) => isDesk(layout, rr, cc)).map(([rr, cc]) => seatId(rr, cc));
}

/** 옆자리(같은 줄 바로 왼쪽·오른쪽 책상) id 목록 */
export function sideSeats(layout, id) {
  const { r, c } = parseSeatId(id);
  return [c - 1, c + 1].filter((cc) => isDesk(layout, r, cc)).map((cc) => seatId(r, cc));
}

/** 배치 결과에서 옆자리 관계: userId → Set(옆자리 userId) */
export function sideMatesOf(layout, assignment = {}) {
  const map = {};
  for (const [id, userId] of Object.entries(assignment)) {
    for (const n of sideSeats(layout, id)) if (assignment[n]) (map[userId] ??= new Set()).add(assignment[n]);
  }
  return map;
}

/** (예전) 짝 관계: userId → 짝 userId */
export function partnersOf(layout, assignment = {}) {
  const map = {};
  for (const [id, userId] of Object.entries(assignment)) {
    const p = partnerSeat(layout, id);
    if (p && assignment[p]) map[userId] = assignment[p];
  }
  return map;
}

export const GROUP_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6", "#eab308", "#ef4444"];

/** 예전 '앞자리 학생'(front)을 '앞자리' 그룹으로 바꾼다. groups가 없으면 []로 */
export function normalizeRules(rules = {}, layout) {
  const { front, ...rest } = rules ?? {};
  const groups = Array.isArray(rest.groups) ? rest.groups : [];
  if (!front?.userIds?.length || !layout) return { ...rest, groups };
  const rows = Math.max(1, Number(front.rows) || 1);
  const seats = deskSeats(layout).filter((sid) => parseSeatId(sid).r < rows);
  const frontGroup = { id: "front", name: "앞자리", color: 0, userIds: [...front.userIds], seats };
  return { ...rest, groups: [frontGroup, ...groups.filter((g) => g.id !== "front")] };
}

/** 그룹 조건이 있는 학생: userId → { seats: Set(겹치는 자리), groups: [그룹 이름] } */
export function groupLimits(groups = [], ids) {
  const out = {};
  for (const g of groups) {
    if (!g?.seats?.length) continue; // 자리를 안 고른 그룹은 조건 아님
    const gs = new Set(g.seats);
    for (const u of g.userIds ?? []) {
      if (ids && !ids.has(u)) continue;
      const cur = out[u];
      if (!cur) out[u] = { seats: gs, groups: [g.name] };
      else out[u] = { seats: new Set([...cur.seats].filter((sid) => gs.has(sid))), groups: [...cur.groups, g.name] };
    }
  }
  return out;
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 섞기 전에 바로 알 수 있는 문제 (없으면 null) */
export function precheck(studentIds, layout, rules = {}, { nameOf = (u) => u } = {}) {
  rules = normalizeRules(rules, layout);
  const seats = deskSeats(layout);
  const seatSet = new Set(seats);
  if (studentIds.length === 0) return "학생이 없습니다.";
  if (seats.length < studentIds.length) return `책상이 ${seats.length}개라 학생 ${studentIds.length}명이 모두 앉을 수 없어요. 책상을 더 켜 주세요.`;

  const ids = new Set(studentIds);
  const used = new Set();
  for (const [userId, sid] of Object.entries(rules.fixed ?? {})) {
    if (!ids.has(userId)) continue; // 지금 없는 학생의 조건은 무시
    const { r, c } = parseSeatId(sid);
    if (!isDesk(layout, r, c)) return `고정 자리 중 책상이 없는 곳이 있어요. 고정 자리를 다시 정해 주세요.`;
    if (used.has(sid)) return "같은 자리에 두 학생이 고정되어 있어요.";
    used.add(sid);
  }

  const limits = groupLimits(rules.groups, ids);
  for (const [u, lim] of Object.entries(limits)) {
    const fixedSeat = rules.fixed?.[u];
    if (fixedSeat) {
      if (!lim.seats.has(fixedSeat)) return `${nameOf(u)} 학생의 고정 자리가 그룹(${lim.groups.join(", ")}) 자리 밖이에요.`;
      continue;
    }
    const free = [...lim.seats].filter((sid) => seatSet.has(sid) && !used.has(sid));
    if (free.length === 0) {
      return lim.groups.length > 1
        ? `${nameOf(u)} 학생이 속한 그룹(${lim.groups.join(", ")})의 자리가 겹치는 곳이 없어요.`
        : `'${lim.groups[0]}' 그룹에 앉을 자리가 남아 있지 않아요.`;
    }
  }
  for (const g of rules.groups ?? []) {
    if (!g?.seats?.length) continue;
    const members = (g.userIds ?? []).filter((u) => ids.has(u) && !rules.fixed?.[u]);
    const free = g.seats.filter((sid) => seatSet.has(sid) && !used.has(sid));
    if (members.length > free.length) return `'${g.name}' 그룹 학생은 ${members.length}명인데 앉을 자리는 ${free.length}개예요.`;
  }
  return null;
}

/**
 * 조건을 지키며 무작위로 자리를 정한다.
 * @param {string[]} studentIds
 * @param {{ rng?: () => number, prevAssignment?: object, attempts?: number }} opts
 */
export function assignSeats(studentIds, layout, rules = {}, { rng = Math.random, prevAssignment = null, attempts = 30, nameOf } = {}) {
  rules = normalizeRules(rules, layout);
  const problem = precheck(studentIds, layout, rules, { nameOf });
  if (problem) return { ok: false, reason: problem };

  const ids = new Set(studentIds);
  const seats = deskSeats(layout);
  const fixed = Object.fromEntries(Object.entries(rules.fixed ?? {}).filter(([u]) => ids.has(u)));
  const limits = groupLimits(rules.groups, ids);

  // 서로 떨어져야 하는 짝: userId → Set
  const apart = {};
  const addApart = (a, b) => {
    (apart[a] ??= new Set()).add(b);
    (apart[b] ??= new Set()).add(a);
  };
  for (const [a, b] of rules.apart ?? []) if (ids.has(a) && ids.has(b) && a !== b) addApart(a, b);

  const prevSide = rules.avoidPrevPartner && prevAssignment ? sideMatesOf(layout, prevAssignment) : {};

  const fixedSeats = new Set(Object.values(fixed));
  const allowedSeats = (userId) => {
    if (fixed[userId]) return [fixed[userId]];
    const lim = limits[userId]?.seats;
    return seats.filter((s) => !fixedSeats.has(s) && (!lim || lim.has(s)));
  };
  const allowedCount = Object.fromEntries(studentIds.map((u) => [u, allowedSeats(u).length]));

  const fits = (userId, sid, at) => {
    // 지난번 옆자리였던 학생과 다시 옆자리 X (양쪽 다 확인: 나중에 앉는 학생 쪽에서 걸러진다)
    if (prevSide[userId]) for (const n of sideSeats(layout, sid)) if (at[n] && prevSide[userId].has(at[n])) return false;
    // 떨어뜨리기: 앞뒤·옆자리 X
    if (apart[userId]) for (const n of neighborSeats(layout, sid)) if (at[n] && apart[userId].has(at[n])) return false;
    return true;
  };

  for (let attempt = 0; attempt < attempts; attempt++) {
    // 조건이 많은 학생부터 (고정 → 앉을 자리가 적은 그룹 학생 → 떨어뜨리기 → 나머지는 무작위)
    const order = shuffle(studentIds, rng).sort((a, b) => weight(b) - weight(a));
    function weight(u) {
      if (fixed[u]) return 100000;
      return (limits[u] ? 10000 - allowedCount[u] * 10 : 0) + (apart[u]?.size ?? 0);
    }

    const at = {}; // seatId → userId
    let steps = 0;
    const place = (i) => {
      if (i === order.length) return true;
      if (++steps > 20000) return false; // 너무 오래 걸리면 처음부터 다시 섞는다
      const u = order[i];
      for (const sid of shuffle(allowedSeats(u), rng)) {
        if (at[sid] || !fits(u, sid, at)) continue;
        at[sid] = u;
        if (place(i + 1)) return true;
        delete at[sid];
      }
      return false;
    };
    if (place(0)) return { ok: true, assignment: at };
  }
  return { ok: false, reason: "조건을 모두 지키는 자리를 찾지 못했어요. 떨어뜨리기나 그룹 조건을 조금 줄여 보세요." };
}

/** 저장된 배치가 조건을 지키는지 확인 (테스트·확정 전 검사용). 어긴 조건 설명 목록을 돌려준다 */
export function violations(assignment, layout, rules = {}, prevAssignment = null) {
  rules = normalizeRules(rules, layout);
  const out = [];
  const seatOf = Object.fromEntries(Object.entries(assignment).map(([s, u]) => [u, s]));
  for (const [u, s] of Object.entries(rules.fixed ?? {})) if (seatOf[u] && seatOf[u] !== s) out.push(`고정 자리: ${u}`);
  for (const [u, lim] of Object.entries(groupLimits(rules.groups))) if (seatOf[u] && !lim.seats.has(seatOf[u])) out.push(`그룹: ${u}`);
  for (const [a, b] of rules.apart ?? []) {
    if (!seatOf[a] || !seatOf[b]) continue;
    if (neighborSeats(layout, seatOf[a]).includes(seatOf[b])) out.push(`떨어뜨리기: ${a}·${b}`);
  }
  if (rules.avoidPrevPartner && prevAssignment) {
    const before = sideMatesOf(layout, prevAssignment);
    const now = sideMatesOf(layout, assignment);
    for (const [u, mates] of Object.entries(now)) for (const m of mates) if (before[u]?.has(m) && u < m) out.push(`지난 옆자리: ${u}·${m}`);
  }
  return out;
}
