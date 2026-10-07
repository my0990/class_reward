// 자리 바꾸기 계산 (화면·DB와 분리된 순수 함수 → 단위 테스트)
//
// 교실 배치(layout)
//   { rows, cols, desks: boolean[rows][cols] }   true = 책상 있음 / false = 통로·빈칸
//   자리 id = "줄-칸" (0부터, 0줄이 교탁 바로 앞)
//   짝 = 같은 줄에서 (0,1) (2,3) (4,5)… 칸끼리 (둘 다 책상일 때)
//
// 조건(rules)
//   fixed:  { [userId]: seatId }           고정 자리
//   front:  { userIds: [], rows: n }        앞쪽 n줄 안
//   apart:  [[userIdA, userIdB], ...]      짝·앞뒤·옆자리 금지
//   avoidPrevPartner: boolean               바로 전 배치의 짝과 다시 짝 금지
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

/** 배치 결과에서 짝 관계: userId → 짝 userId */
export function partnersOf(layout, assignment = {}) {
  const map = {};
  for (const [id, userId] of Object.entries(assignment)) {
    const p = partnerSeat(layout, id);
    if (p && assignment[p]) map[userId] = assignment[p];
  }
  return map;
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
export function precheck(studentIds, layout, rules = {}) {
  const seats = deskSeats(layout);
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

  const front = (rules.front?.userIds ?? []).filter((u) => ids.has(u) && !rules.fixed?.[u]);
  if (front.length) {
    const n = Math.max(1, Number(rules.front.rows) || 1);
    const frontSeats = seats.filter((s) => parseSeatId(s).r < n && !used.has(s));
    if (frontSeats.length < front.length) return `앞쪽 ${n}줄에 남은 책상(${frontSeats.length}개)보다 앞자리 학생(${front.length}명)이 많아요.`;
  }
  return null;
}

/**
 * 조건을 지키며 무작위로 자리를 정한다.
 * @param {string[]} studentIds
 * @param {{ rng?: () => number, prevAssignment?: object, attempts?: number }} opts
 */
export function assignSeats(studentIds, layout, rules = {}, { rng = Math.random, prevAssignment = null, attempts = 30 } = {}) {
  const problem = precheck(studentIds, layout, rules);
  if (problem) return { ok: false, reason: problem };

  const ids = new Set(studentIds);
  const seats = deskSeats(layout);
  const fixed = Object.fromEntries(Object.entries(rules.fixed ?? {}).filter(([u]) => ids.has(u)));
  const frontRows = Math.max(1, Number(rules.front?.rows) || 1);
  const frontSet = new Set((rules.front?.userIds ?? []).filter((u) => ids.has(u)));

  // 서로 떨어져야 하는 짝: userId → Set
  const apart = {};
  const addApart = (a, b) => {
    (apart[a] ??= new Set()).add(b);
    (apart[b] ??= new Set()).add(a);
  };
  for (const [a, b] of rules.apart ?? []) if (ids.has(a) && ids.has(b) && a !== b) addApart(a, b);

  const prevPartner = rules.avoidPrevPartner && prevAssignment ? partnersOf(layout, prevAssignment) : {};

  const allowedSeats = (userId) => {
    if (fixed[userId]) return [fixed[userId]];
    const fixedSeats = new Set(Object.values(fixed));
    return seats.filter((s) => !fixedSeats.has(s) && (!frontSet.has(userId) || parseSeatId(s).r < frontRows));
  };

  const fits = (userId, sid, at) => {
    const partner = partnerSeat(layout, sid);
    const partnerUser = partner ? at[partner] : null;
    if (partnerUser && prevPartner[userId] === partnerUser) return false;
    if (apart[userId]) {
      if (partnerUser && apart[userId].has(partnerUser)) return false;
      for (const n of neighborSeats(layout, sid)) if (at[n] && apart[userId].has(at[n])) return false;
    }
    return true;
  };

  for (let attempt = 0; attempt < attempts; attempt++) {
    // 조건이 많은 학생부터 (고정 → 앞자리 → 떨어뜨리기 → 나머지는 무작위)
    const order = shuffle(studentIds, rng).sort((a, b) => weight(b) - weight(a));
    function weight(u) {
      return (fixed[u] ? 100 : 0) + (frontSet.has(u) ? 10 : 0) + (apart[u]?.size ?? 0);
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
  return { ok: false, reason: "조건을 모두 지키는 자리를 찾지 못했어요. 떨어뜨리기나 앞자리 조건을 조금 줄여 보세요." };
}

/** 저장된 배치가 조건을 지키는지 확인 (테스트·확정 전 검사용). 어긴 조건 설명 목록을 돌려준다 */
export function violations(assignment, layout, rules = {}, prevAssignment = null) {
  const out = [];
  const seatOf = Object.fromEntries(Object.entries(assignment).map(([s, u]) => [u, s]));
  for (const [u, s] of Object.entries(rules.fixed ?? {})) if (seatOf[u] && seatOf[u] !== s) out.push(`고정 자리: ${u}`);
  const n = Math.max(1, Number(rules.front?.rows) || 1);
  for (const u of rules.front?.userIds ?? []) if (seatOf[u] && parseSeatId(seatOf[u]).r >= n && !rules.fixed?.[u]) out.push(`앞자리: ${u}`);
  for (const [a, b] of rules.apart ?? []) {
    if (!seatOf[a] || !seatOf[b]) continue;
    const near = [partnerSeat(layout, seatOf[a]), ...neighborSeats(layout, seatOf[a])];
    if (near.includes(seatOf[b])) out.push(`떨어뜨리기: ${a}·${b}`);
  }
  if (rules.avoidPrevPartner && prevAssignment) {
    const before = partnersOf(layout, prevAssignment);
    const now = partnersOf(layout, assignment);
    for (const [u, p] of Object.entries(now)) if (before[u] === p && u < p) out.push(`지난 짝: ${u}·${p}`);
  }
  return out;
}
