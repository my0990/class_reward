"use client";
// 비회원 자리 바꾸기 저장소: 명단·배치·조건·기록을 모두 이 브라우저(localStorage)에만 저장한다 (서버로 안 보냄)
import { useCallback, useEffect, useRef, useState } from "react";
import { cleanLayout, cleanRules, pushSeatRecord, removeSeatRecord } from "@/util/seat/seatPlan";

const KEY = "kkyul:guest-seat:v1";
const EMPTY = { roster: [], plan: null };

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && Array.isArray(v.roster) ? { roster: v.roster, plan: v.plan ?? null } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * 명단 글 → 학생 목록. 한 줄에 한 명: "3 김철수", "3. 김철수", "3번 김철수", "김철수"(번호 자동), "3"(이름 없이 번호만)
 * 번호가 같으면 앞의 것만. userId는 번호로 정한다 (n3) → 명단을 고쳐도 조건·그룹이 그 번호에 남는다
 */
export function parseRoster(text) {
  const out = [];
  const used = new Set();
  let next = 1;
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(\d{1,3})\s*(?:번|\.|\)|,)?\s*(.*)$/);
    let n = m ? Number(m[1]) : null;
    const name = (m ? m[2] : line).trim().slice(0, 20);
    if (!n) {
      while (used.has(next)) next++;
      n = next;
    }
    if (n < 1 || n > 999 || used.has(n)) continue;
    used.add(n);
    next = Math.max(next, n + 1);
    out.push({ userId: `n${n}`, classNumber: n, profileNickname: name });
    if (out.length >= 100) break;
  }
  return out.sort((a, b) => a.classNumber - b.classNumber);
}

export function rosterToText(roster) {
  return (roster ?? []).map((s) => (s.profileNickname ? `${s.classNumber} ${s.profileNickname}` : String(s.classNumber))).join("\n");
}

export function useGuestSeatStore() {
  const [state, setState] = useState(null); // null: 아직 못 읽음 (서버 렌더와 맞추려고 마운트 후에 읽는다)
  const latest = useRef(EMPTY);
  useEffect(() => {
    latest.current = read();
    setState(latest.current);
  }, []);

  const write = useCallback((next) => {
    latest.current = next;
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  }, []);
  const idsOf = (roster) => new Set(roster.map((s) => s.userId));
  const fail = { result: false, message: "이 브라우저에 저장하지 못했어요. (사생활 보호 창이거나 저장 공간이 꺼져 있어요)" };

  const saveSetup = async ({ layout, rules }) => {
    const l = cleanLayout(layout);
    if (l.error) return { result: false, message: l.error };
    const { roster, plan } = latest.current;
    const cleaned = cleanRules(rules, l.layout, idsOf(roster));
    if (!write({ roster, plan: { ...(plan ?? {}), layout: l.layout, rules: cleaned } })) return fail;
    return { result: true, data: { layout: l.layout, rules: cleaned } };
  };

  const confirm = async (assignment) => {
    const { roster, plan } = latest.current;
    if (!plan?.layout) return { result: false, message: "교실 배치를 먼저 정해 주세요." };
    const next = pushSeatRecord(plan, { assignment, layout: plan.layout, confirmedAt: new Date().toISOString() });
    return write({ roster, plan: { ...plan, ...next } }) ? { result: true } : fail;
  };

  const deleteRecord = async (at) => {
    const { roster, plan } = latest.current;
    const next = removeSeatRecord(plan, at);
    if (!next) return { result: false, message: "이미 지워진 기록이에요." };
    return write({ roster, plan: { ...plan, ...next } }) ? { result: true, message: "기록을 지웠어요." } : fail;
  };

  /** 명단 바꾸기: 없어진 번호는 조건·그룹에서도 뺀다 */
  const setRoster = (roster) => {
    const { plan } = latest.current;
    const nextPlan = plan?.layout ? { ...plan, rules: cleanRules(plan.rules ?? {}, plan.layout, idsOf(roster)) } : plan;
    return write({ roster, plan: nextPlan });
  };

  return {
    guest: true,
    plan: state ? state.plan : undefined,
    students: state ? state.roster : undefined,
    isLoading: !state,
    isError: false,
    refresh: () => {},
    saveSetup,
    confirm,
    deleteRecord,
    setRoster,
  };
}
