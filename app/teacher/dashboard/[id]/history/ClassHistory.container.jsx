"use client";
// 학급 기록: 반 전체 거래 기록 (최신순, 50건씩 더 보기)
// - 같은 순간에 같은 내용으로 여러 학생에게 처리된 기록은 한 줄로 묶고, 누르면 펼친다
// - 자동 새로고침 없음 (탭을 열 때·필터를 바꿀 때·새로고침 버튼을 누를 때만 불러온다)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
import { groupHistory, splitByDay } from "@/util/history/groupHistory";
import { historySentence, sentenceText } from "@/util/history/historySentence";
import { HISTORY_KINDS, getHistoryKind, isDepositType } from "../manage/utils/historyKind";
import { formatHistoryDateParts, formatFullDate } from "../manage/utils/historyDate";

const KIND_FILTERS = ["grant", "take", "buy", "quest", "donate", "use"];
const PERIODS = [
  { id: "today", label: "오늘" },
  { id: "7d", label: "7일" },
  { id: "all", label: "30일" },
];

const byNumber = (a, b) => (Number(a.classNumber) || Infinity) - (Number(b.classNumber) || Infinity);

export default function ClassHistoryContainer() {
  const { id } = useParams();
  const { data: students } = useFetchData(`/api/students/${id}`);
  const { data: classData } = useFetchData(`/api/classData/${id}`);
  const currency = classData?.currencyName ?? "";

  // userId → { label, classNumber }
  const studentMap = useMemo(() => {
    const m = new Map();
    for (const s of students ?? []) {
      const nickname = s.profileNickname || s.userId;
      m.set(String(s.userId), { classNumber: s.classNumber, label: s.classNumber != null ? `${s.classNumber}번 ${nickname}` : nickname });
    }
    return m;
  }, [students]);
  const labelOf = (userId) => studentMap.get(String(userId))?.label ?? `${userId} (삭제된 학생)`;

  const [kinds, setKinds] = useState(KIND_FILTERS); // 체크한 종류 (처음엔 전부)
  const kindsKey = KIND_FILTERS.filter((k) => kinds.includes(k)).join(",");
  const [userId, setUserId] = useState("");
  const [period, setPeriod] = useState("all");
  const [rows, setRows] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [totals, setTotals] = useState(null); // 기간 합계: 지급·회수 총액과 하루 평균
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openKey, setOpenKey] = useState(null); // 명단을 띄운 묶음 (한 번에 하나)
  const reqId = useRef(0);

  const load = useCallback(
    async (fromCursor = null) => {
      const my = ++reqId.current; // 필터를 빨리 바꿔도 마지막 요청 결과만 반영
      setLoading(true);
      setError(null);
      const q = new URLSearchParams({ period });
      if (kindsKey !== KIND_FILTERS.join(",")) q.set("kinds", kindsKey);
      if (userId) q.set("userId", userId);
      if (fromCursor) q.set("cursor", fromCursor);
      try {
        const res = await fetch(`/api/classHistory/${id}?${q}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || "불러오지 못했습니다.");
        if (my !== reqId.current) return;
        setRows((prev) => (fromCursor ? [...prev, ...body.rows] : body.rows));
        setCursor(body.nextCursor);
        if (!fromCursor) setTotals(body.totals ?? null);
        if (!fromCursor) setOpenKey(null);
      } catch (e) {
        if (my === reqId.current) setError(e.message);
      } finally {
        if (my === reqId.current) setLoading(false);
      }
    },
    [id, kindsKey, userId, period]
  );

  useEffect(() => {
    if (!kindsKey) {
      reqId.current++; // 진행 중인 요청 결과는 버린다
      setRows([]);
      setCursor(null);
      setTotals(null);
      setLoading(false);
      setError(null);
      return;
    }
    load();
  }, [load, kindsKey]);

  const days = useMemo(() => splitByDay(groupHistory(rows)), [rows]);
  const toggle = (key) => setOpenKey((prev) => (prev === key ? null : key));

  // 명단 바깥을 누르거나 ESC면 닫기
  useEffect(() => {
    if (!openKey) return;
    const onDown = (e) => {
      if (!e.target.closest?.(`[data-popover="${openKey}"]`)) setOpenKey(null);
    };
    const onKey = (e) => e.key === "Escape" && setOpenKey(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  return (
    <div className="space-y-[12px]">
      {/* 필터 */}
      <div className="space-y-[8px] rounded-xl bg-white/60 p-[12px]">
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[6px]">
          <label className="flex cursor-pointer items-center gap-[6px] text-[0.9rem] font-semibold">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-warning"
              checked={kinds.length === KIND_FILTERS.length}
              ref={(el) => el && (el.indeterminate = kinds.length > 0 && kinds.length < KIND_FILTERS.length)}
              onChange={(e) => setKinds(e.target.checked ? KIND_FILTERS : [])}
            />
            전체
          </label>
          {KIND_FILTERS.map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-[6px] text-[0.9rem]">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-warning"
                checked={kinds.includes(k)}
                onChange={(e) => setKinds((prev) => (e.target.checked ? [...prev, k] : prev.filter((x) => x !== k)))}
              />
              <span className={`rounded-full px-[8px] py-[1px] ${HISTORY_KINDS[k].badge}`}>
                {HISTORY_KINDS[k].icon} {HISTORY_KINDS[k].label}
              </span>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-[8px]">
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="select select-sm select-bordered max-w-[200px] bg-white"
            aria-label="학생 선택"
          >
            <option value="">모든 학생</option>
            {[...(students ?? [])].sort(byNumber).map((s) => (
              <option key={s.userId} value={s.userId}>
                {labelOf(s.userId)}
              </option>
            ))}
          </select>
          <div className="inline-flex rounded-lg bg-white p-[2px]" role="tablist" aria-label="기간">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-md px-[12px] py-[4px] text-[0.85rem] ${period === p.id ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {totals && (
            // 선택한 기간(과 학생)의 선생님 지급·회수 총액 + 하루 평균 (종류 체크와는 상관없음)
            <div className="flex flex-wrap gap-[6px] text-[0.8rem]" title={`하루 평균은 ${totals.days}일로 나눈 값이에요`}>
              <span className="rounded-lg bg-emerald-50 px-[8px] py-[3px] text-emerald-800">
                🎁 지급 <b className="tabular-nums">{totals.grant.total.toLocaleString()}{currency}</b>
                {period !== "today" && <span className="text-emerald-700"> · 하루 평균 {totals.grant.perDay.toLocaleString()}</span>}
              </span>
              <span className="rounded-lg bg-rose-50 px-[8px] py-[3px] text-rose-800">
                ↩️ 회수 <b className="tabular-nums">{totals.take.total.toLocaleString()}{currency}</b>
                {period !== "today" && <span className="text-rose-700"> · 하루 평균 {totals.take.perDay.toLocaleString()}</span>}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="ml-auto rounded-lg bg-white px-[12px] py-[4px] text-[0.85rem] font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            ↻ 새로고침
          </button>
        </div>
        <p className="text-[0.75rem] text-gray-500">거래 기록은 30일 동안 보관돼요. 같은 순간 여러 학생에게 처리된 기록은 한 줄로 묶어서 보여줘요.</p>
      </div>

      {/* 목록 */}
      {error ? (
        <div className="rounded-xl bg-white py-10 text-center text-red-500">{error}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-white py-10 text-center text-gray-500">{!kindsKey ? "보고 싶은 종류를 하나 이상 체크해 주세요." : loading ? "불러오는 중..." : "기록이 없습니다."}</div>
      ) : (
        <div className="space-y-[12px]">
          {days.map(({ day, groups }) => (
            <section key={day} className="rounded-xl bg-white">
              <h2 className="rounded-t-xl border-b border-gray-100 bg-gray-50 px-[12px] py-[6px] text-[0.85rem] font-semibold text-gray-600">
                {formatHistoryDateParts(groups[0].date).day}
              </h2>
              <ul className="divide-y divide-gray-100">
                {groups.map((g) => {
                  const k = HISTORY_KINDS[getHistoryKind(g)];
                  const items = [...g.items].sort((a, b) => byNumber(studentMap.get(String(a.userId)) ?? {}, studentMap.get(String(b.userId)) ?? {}));
                  const many = items.length > 1;
                  const isOpen = openKey === g.key;
                  const who = many ? `${labelOf(items[0].userId)} 외 ${items.length - 1}명` : labelOf(items[0].userId);
                  const sentence = historySentence({ kind: getHistoryKind(g), who, many, name: g.name, amount: g.amount, currency });
                  return (
                    <li key={g.key} className={`relative last:rounded-b-xl ${k.row}`} data-popover={many ? g.key : undefined}>
                      <div className="flex items-start gap-[8px] px-[12px] py-[8px] text-[0.95rem]">
                        <span className="w-[44px] shrink-0 pt-[2px] tabular-nums text-[0.8rem] text-gray-500" title={formatFullDate(g.date)}>
                          {formatHistoryDateParts(g.date).time}
                        </span>
                        <span className={`shrink-0 whitespace-nowrap rounded-full px-[8px] py-[2px] text-[0.75rem] ${k.badge}`}>
                          {k.icon} {k.label}
                        </span>
                        <p className="min-w-0 flex-1 leading-snug" title={sentenceText(sentence)}>
                          {sentence.map((seg, i) => {
                            if (seg.t === "who")
                              return many ? (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => toggle(g.key)}
                                  aria-expanded={isOpen}
                                  className="rounded bg-orange-100 px-[3px] font-semibold hover:bg-orange-200"
                                >
                                  {seg.v}
                                </button>
                              ) : (
                                <b key={i} className="font-semibold">
                                  {seg.v}
                                </b>
                              );
                            if (seg.t === "amount")
                              return (
                                <b key={i} className={`font-semibold tabular-nums ${isDepositType(g.type) ? "text-emerald-600" : "text-rose-500"}`}>
                                  {seg.v}
                                </b>
                              );
                            if (seg.t === "item")
                              return (
                                <b key={i} className="font-semibold">
                                  {seg.v}
                                </b>
                              );
                            return <span key={i}>{seg.v}</span>;
                          })}
                        </p>
                      </div>
                      {many && isOpen && (
                        // 아래 줄 위에 덮어서 보여준다 → 목록 위치는 그대로
                        <div className="absolute left-[12px] right-[12px] top-full z-20 -mt-[4px] rounded-xl bg-white text-gray-800 shadow-xl ring-1 ring-black/10 sm:left-[60px] sm:right-auto sm:w-[400px]">
                          <div className="flex items-center justify-between border-b border-gray-100 px-[12px] py-[6px] text-[0.85rem]">
                            <span className="font-semibold">{items.length}명</span>
                            <button
                              type="button"
                              onClick={() => setOpenKey(null)}
                              aria-label="명단 닫기"
                              className="rounded-full p-[4px] text-gray-500 hover:bg-gray-100"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4" aria-hidden="true">
                                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                              </svg>
                            </button>
                          </div>
                          <ul className="grid max-h-[280px] grid-cols-2 gap-x-[16px] gap-y-[2px] overflow-y-auto px-[12px] py-[8px] text-[0.85rem] sm:grid-cols-3">
                            {items.map((it) => (
                              <li key={it._id} className="truncate">
                                {labelOf(it.userId)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {cursor && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => load(cursor)}
                disabled={loading}
                className="rounded-lg bg-white px-[16px] py-[8px] font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "불러오는 중..." : "더 보기"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
