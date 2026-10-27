"use client";
// 승인 센터: 키오스크에서 학생이 보낸 퀘스트 완료 신청을 승인·반려
// - 대기 중: 퀘스트별로 묶어서, 학생마다 [승인] [반려] + 퀘스트별 [모두 승인]
// - 처리 완료: 최근 30일, 누가 처리했는지 함께
// 승인하면 퀘스트 완료 처리와 똑같이 보상(화폐·경험치·칭호)이 지급되고 학급 기록에 남는다.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { useFetchData } from "@/hooks/useFetchData";
import { listRequests, decideRequests } from "@/server-action/actions/request/request.action";
import { formatHistoryDateParts, formatFullDate } from "../manage/utils/historyDate";
import { repeatBadge } from "@/util/quest/questRepeat";

const byNumber = (a, b) => (Number(a.classNumber) || Infinity) - (Number(b.classNumber) || Infinity);

function summaryText(s) {
  const parts = [];
  if (s.approved) parts.push(`${s.approved}명 승인`);
  if (s.lateCycle) parts.push(`${s.lateCycle}명은 지난 회차라 보상만 지급`);
  if (s.alreadyDone) parts.push(`${s.alreadyDone}명은 이미 완료라 보상 없이 닫음`);
  if (s.rejected) parts.push(`${s.rejected}명 반려`);
  if (s.missingQuest) parts.push(`삭제된 퀘스트 ${s.missingQuest}건 닫음`);
  if (s.currency) parts.push(`화폐 신청 ${s.currency}명 반영`);
  if (s.notRep) parts.push(`${s.notRep}건은 대표가 아니어서 취소`);
  if (s.missingStudent) parts.push(`${s.missingStudent}명은 학생이 없어 닫음`);
  if (s.skipped) parts.push(`${s.skipped}건은 이미 처리됨`);
  return parts.join(" · ") || "처리할 요청이 없었어요.";
}

export default function ApprovalsContainer() {
  const { id: classId } = useParams();
  const { data: students } = useFetchData(`/api/students/${classId}`);
  const { data: classData } = useFetchData(`/api/classData/${classId}`);
  const currency = classData?.currencyName ?? "";

  const studentMap = useMemo(() => {
    const m = new Map();
    for (const s of students ?? []) {
      const nickname = s.profileNickname || s.userId;
      m.set(String(s.userId), { classNumber: s.classNumber, money: Number(s.money) || 0, label: s.classNumber != null ? `${s.classNumber}번 ${nickname}` : nickname });
    }
    return m;
  }, [students]);
  const labelOf = (userId) => studentMap.get(String(userId))?.label ?? `${userId} (삭제된 학생)`;

  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(() => new Set()); // 고른 요청 _id
  const [rejecting, setRejecting] = useState(null); // 반려 사유 입력 중이면 문자열

  const load = useCallback(async () => {
    setError(null);
    const res = await listRequests({ classId, status: tab });
    if (!res?.result) {
      setError(res?.message || "불러오지 못했어요.");
      setRows([]);
      return;
    }
    setRows(res.rows);
    setSelected(new Set());
    setRejecting(null);
    if (tab === "pending") setPendingCount(res.rows.length);
  }, [classId, tab]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  // 대기 중 숫자는 처리 완료 탭에서도 보이게 처음 한 번 읽어 둔다
  useEffect(() => {
    listRequests({ classId, status: "pending" }).then((r) => r?.result && setPendingCount(r.rows.length));
  }, [classId]);

  const decide = async (ids, decision, reason = "") => {
    if (ids.length === 0 || busy) return;
    setBusy(true);
    const res = await decideRequests({ classId, requestIds: ids, decision, reason });
    setBusy(false);
    setRejecting(null);
    if (res?.result) {
      toast.success(summaryText(res.summary));
      // 승인하면 퀘스트 완료 명단·잔액이 바뀐다 → 퀘스트·대시보드 화면의 저장된 데이터도 새로 받게
      if (decision === "approve") {
        mutate(`/api/fetchQuestList/${classId}`);
        mutate(`/api/classData/${classId}`);
        mutate(`/api/students/${classId}`);
      }
    } else toast.error(res?.message || "처리하지 못했어요.");
    load();
  };

  // 대기 중: 퀘스트별로 묶기 (신청이 먼저 온 퀘스트가 위)
  const groups = useMemo(() => {
    if (tab !== "pending" || !rows) return [];
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.targetId))
        map.set(r.targetId, { targetId: r.targetId, type: r.type, target: r.target, requestedBy: r.requestedBy, amount: r.amount, isSend: r.isSend, items: [] });
      map.get(r.targetId).items.push(r);
    }
    for (const g of map.values()) g.items.sort((a, b) => byNumber(studentMap.get(a.userId) ?? {}, studentMap.get(b.userId) ?? {}));
    return [...map.values()];
  }, [tab, rows, studentMap]);

  const tabBtn = (id, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={`rounded-md px-[14px] py-[6px] text-[0.95rem] font-semibold ${tab === id ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"}`}
    >
      {label}
    </button>
  );

  const reward = (t) =>
    t && (
      <span className="flex flex-wrap gap-[6px] text-[0.8rem] font-semibold">
        {t.reward > 0 && <span className="rounded bg-orange-100 px-[6px] py-[1px]">💰 {t.reward.toLocaleString()}{currency}</span>}
        {t.exp > 0 && <span className="rounded bg-sky-100 px-[6px] py-[1px]">⭐ {t.exp}</span>}
        {t.title && <span className="rounded bg-purple-100 px-[6px] py-[1px]">🎖️ {t.title}</span>}
      </span>
    );

  const timeOf = (iso) => {
    const { day, time } = formatHistoryDateParts(iso);
    return `${day} ${time}`;
  };

  // ---- 고르기 ----
  const allIds = tab === "pending" && rows ? rows.map((r) => r._id) : [];
  const toggleIds = (ids, on) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  const stateOf = (ids) => {
    const n = ids.filter((id) => selected.has(id)).length;
    return { checked: ids.length > 0 && n === ids.length, partial: n > 0 && n < ids.length };
  };
  // 일부만 골랐을 때 '-' 표시
  const check = (ids, label) => {
    const { checked, partial } = stateOf(ids);
    return (
      <input
        type="checkbox"
        aria-label={label}
        className="checkbox checkbox-sm checkbox-warning bg-white"
        checked={checked}
        ref={(el) => el && (el.indeterminate = partial)}
        onChange={(e) => toggleIds(ids, e.target.checked)}
      />
    );
  };
  const selectedIds = allIds.filter((id) => selected.has(id));

  return (
    <div className="space-y-[12px]">
      <p className="text-[0.95rem] text-gray-700">
        학생이 키오스크 <b>🏆 퀘스트</b>에서 자기 카드를 고르고 &quot;확인&quot;을 누르면 여기에 와요. 승인하면 퀘스트 보상이 지급돼요.
        <br />
        <b>⭐ 학생 대표</b>가 화폐 지급·회수를 신청해도 여기에 와요. 승인해야 반영돼요. (대표 지정: 학생 관리)
      </p>

      <div className="flex flex-wrap items-center gap-[8px]">
        <div className="inline-flex rounded-lg bg-white p-[2px]" role="tablist">
          {tabBtn("pending", `대기 중${pendingCount ? ` ${pendingCount}` : ""}`)}
          {tabBtn("done", "처리 완료")}
        </div>
        <button type="button" onClick={load} className="ml-auto rounded-lg bg-white px-[12px] py-[6px] text-[0.85rem] font-medium hover:bg-gray-50">
          ↻ 새로고침
        </button>
      </div>

      {error ? (
        <div className="rounded-xl bg-white py-10 text-center text-red-500">{error}</div>
      ) : !rows ? (
        <div className="rounded-xl bg-white py-10 text-center text-gray-500">불러오는 중...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-white py-10 text-center text-gray-500">
          {tab === "pending" ? "확인할 요청이 없어요." : "최근 30일 동안 처리한 요청이 없어요."}
        </div>
      ) : tab === "pending" ? (
        <div className="space-y-[12px]">
          {/* 전체 선택 + 고른 것 승인·반려 (한 곳에서만) */}
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-[8px] rounded-xl bg-white px-[14px] py-[10px] shadow-sm">
            <label className="flex cursor-pointer items-center gap-[8px] font-semibold">
              {check(allIds, "전체 선택")}
              전체 선택
            </label>
            <span className="text-[0.85rem] text-gray-500">{selectedIds.length > 0 ? `${selectedIds.length}명 선택` : `${allIds.length}건`}</span>
            <div className="ml-auto flex flex-wrap items-center gap-[6px]">
              {rejecting !== null ? (
                <>
                  <input
                    autoFocus
                    value={rejecting}
                    onChange={(e) => setRejecting(e.target.value)}
                    maxLength={100}
                    placeholder="반려 사유 (선택)"
                    className="input input-sm input-bordered w-[180px] bg-white"
                  />
                  <button type="button" disabled={busy} onClick={() => decide(selectedIds, "reject", rejecting)} className="btn btn-sm bg-rose-500 text-white hover:bg-rose-600">
                    {selectedIds.length}명 반려
                  </button>
                  <button type="button" onClick={() => setRejecting(null)} className="btn btn-sm btn-ghost">
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={busy || selectedIds.length === 0}
                    onClick={() => setRejecting("")}
                    className="btn btn-sm btn-ghost text-rose-600 disabled:bg-transparent"
                  >
                    반려
                  </button>
                  <button
                    type="button"
                    disabled={busy || selectedIds.length === 0}
                    onClick={() => decide(selectedIds, "approve")}
                    className="btn btn-sm bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    {busy ? "처리 중..." : "승인"}
                  </button>
                </>
              )}
            </div>
          </div>

          {groups.map((g) => {
            const ids = g.items.map((r) => r._id);
            return (
              <section key={g.targetId} className="rounded-xl bg-white">
                <header className="flex flex-wrap items-center gap-[8px] rounded-t-xl border-b border-gray-100 bg-gray-50 px-[14px] py-[10px]">
                  {g.type === "currency" ? (
                    <>
                      <label className="flex cursor-pointer items-center gap-[8px]">
                        {check(ids, "화폐 신청 모두 선택")}
                        <h2 className="font-bold">💰 화폐 {g.isSend ? "지급" : "회수"} 신청</h2>
                      </label>
                      <span className={`rounded px-[6px] py-[1px] text-[0.85rem] font-bold tabular-nums ${g.isSend ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {g.isSend ? "+" : "-"}
                        {Number(g.amount).toLocaleString()}
                        {currency}
                      </span>
                      <span className="rounded-full bg-orange-100 px-[8px] py-[1px] text-[0.8rem] font-semibold text-orange-700">⭐ {labelOf(g.requestedBy)} 신청</span>
                      <span className="text-[0.85rem] text-gray-500">
                        {g.items.length}명 · {timeOf(g.items[0]?.createdAt)}
                      </span>
                    </>
                  ) : (
                    <>
                      <label className="flex cursor-pointer items-center gap-[8px]">
                        {check(ids, `${g.target?.name ?? "삭제된 퀘스트"} 모두 선택`)}
                        <h2 className="font-bold">{g.target ? `🏆 ${g.target.name}` : "삭제된 퀘스트"}</h2>
                      </label>
                      {g.target && repeatBadge(g.target) && (
                        <span className="rounded-full bg-sky-100 px-[8px] py-[1px] text-[0.75rem] font-semibold text-sky-700">{repeatBadge(g.target)}</span>
                      )}
                      {reward(g.target)}
                      <span className="text-[0.85rem] text-gray-500">신청 {g.items.length}명</span>
                    </>
                  )}
                </header>
                <ul className="divide-y divide-gray-100">
                  {g.items.map((r) => (
                    <li key={r._id}>
                      <label className="flex cursor-pointer flex-wrap items-center gap-[8px] px-[14px] py-[10px] hover:bg-orange-50">
                        {check([r._id], `${labelOf(r.userId)} 선택`)}
                        <span className="font-semibold">{labelOf(r.userId)}</span>
                        <span className="text-[0.8rem] text-gray-500" title={formatFullDate(r.createdAt)}>
                          {timeOf(r.createdAt)}
                        </span>
                        {r.target?.stale && (
                          <span className="rounded bg-sky-100 px-[6px] py-[1px] text-[0.75rem] text-sky-700" title="승인하면 보상은 주고, 이번 회차 완료 명단에는 넣지 않아요">
                            {r.target.repeat === "weekly" ? "지난주 신청" : "지난 날 신청"}
                          </span>
                        )}
                        {r.type === "currency" && !r.isSend && (() => {
                          // 회수: 승인하면 잔액이 어떻게 되는지 (마이너스면 빨간색)
                          const now = studentMap.get(String(r.userId))?.money ?? 0;
                          const after = now - (Number(r.amount) || 0);
                          return (
                            <span className={`rounded px-[6px] py-[1px] text-[0.75rem] tabular-nums ${after < 0 ? "bg-rose-100 font-semibold text-rose-700" : "bg-gray-100 text-gray-600"}`}>
                              잔액 {now.toLocaleString()} → {after.toLocaleString()}
                              {after < 0 ? " ⚠️" : ""}
                            </span>
                          );
                        })()}
                        {r.target?.alreadyDone && (
                          <span className="rounded bg-gray-100 px-[6px] py-[1px] text-[0.75rem] text-gray-600" title="승인하면 보상 없이 닫혀요">
                            이미 완료됨
                          </span>
                        )}
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl bg-white">
          {rows.map((r) => ({
            ...r,
            // 예전 기록(보상 기록 없음)은 지금 퀘스트 보상으로 보여줌. '이미 완료'는 보상을 안 줬음
            paid: r.paid ?? (r.type !== "currency" && r.status === "approved" && r.note !== "이미 완료" && r.target ? { money: r.target.reward, exp: r.target.exp } : null),
          })).map((r) => (
            <li key={r._id} className="flex flex-wrap items-center gap-[8px] px-[14px] py-[10px] text-[0.95rem]">
              <span className="w-[110px] shrink-0 text-[0.8rem] text-gray-500" title={formatFullDate(r.decidedAt)}>
                {timeOf(r.decidedAt)}
              </span>
              <span
                className={`rounded-full px-[8px] py-[1px] text-[0.75rem] font-semibold ${
                  r.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {r.status === "approved" ? "승인" : "반려"}
              </span>
              <span className="font-semibold">{labelOf(r.userId)}</span>
              <span className="min-w-0 truncate text-gray-700">
                {r.type === "currency"
                  ? `화폐 ${r.isSend ? "지급" : "회수"} 신청 (⭐ ${labelOf(r.requestedBy)})`
                  : `${r.status === "approved" ? "퀘스트 완료: " : "퀘스트: "}${r.target ? r.target.name : "삭제된 퀘스트"}`}
              </span>
              {r.note && <span className="text-[0.8rem] text-gray-500">({r.note})</span>}
              {r.reason && <span className="text-[0.8rem] text-rose-600">사유: {r.reason}</span>}
              {/* 처리한 사람 대신 실제로 준 보상 */}
              <span className="ml-auto flex shrink-0 gap-[6px] text-[0.85rem] font-semibold tabular-nums">
                {r.status === "approved" && r.paid ? (
                  <>
                    {r.paid.money > 0 && <span className="text-emerald-700">{currency || "화폐"} +{r.paid.money.toLocaleString()}</span>}
                    {r.paid.money < 0 && <span className="text-rose-600">{currency || "화폐"} {r.paid.money.toLocaleString()}</span>}
                    {r.paid.exp > 0 && <span className="text-sky-700">경험치 +{r.paid.exp.toLocaleString()}</span>}
                    {!r.paid.money && !r.paid.exp && <span className="text-gray-400">보상 없음</span>}
                  </>
                ) : (
                  <span className="text-gray-400">{r.status === "approved" ? "보상 없음" : "-"}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
