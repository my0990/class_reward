"use client";
// 승인 센터: 키오스크에서 학생이 보낸 퀘스트 완료 신청을 승인·반려
// - 대기 중: 퀘스트별로 묶어서, 학생마다 [승인] [반려] + 퀘스트별 [모두 승인]
// - 처리 완료: 최근 30일, 누가 처리했는지 함께
// 승인하면 퀘스트 완료 처리와 똑같이 보상(화폐·경험치·칭호)이 지급되고 학급 기록에 남는다.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import { listRequests, decideRequests } from "@/server-action/actions/request/request.action";
import { formatHistoryDateParts, formatFullDate } from "../manage/utils/historyDate";

const byNumber = (a, b) => (Number(a.classNumber) || Infinity) - (Number(b.classNumber) || Infinity);

function summaryText(s) {
  const parts = [];
  if (s.approved) parts.push(`${s.approved}명 승인`);
  if (s.alreadyDone) parts.push(`${s.alreadyDone}명은 이미 완료라 보상 없이 닫음`);
  if (s.rejected) parts.push(`${s.rejected}명 반려`);
  if (s.missingQuest) parts.push(`삭제된 퀘스트 ${s.missingQuest}건 닫음`);
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
      m.set(String(s.userId), { classNumber: s.classNumber, label: s.classNumber != null ? `${s.classNumber}번 ${nickname}` : nickname });
    }
    return m;
  }, [students]);
  const labelOf = (userId) => studentMap.get(String(userId))?.label ?? `${userId} (삭제된 학생)`;

  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(null); // { ids, reason }

  const load = useCallback(async () => {
    setError(null);
    const res = await listRequests({ classId, status: tab });
    if (!res?.result) {
      setError(res?.message || "불러오지 못했어요.");
      setRows([]);
      return;
    }
    setRows(res.rows);
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
    if (res?.result) toast.success(summaryText(res.summary));
    else toast.error(res?.message || "처리하지 못했어요.");
    load();
  };

  // 대기 중: 퀘스트별로 묶기 (신청이 먼저 온 퀘스트가 위)
  const groups = useMemo(() => {
    if (tab !== "pending" || !rows) return [];
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.targetId)) map.set(r.targetId, { targetId: r.targetId, target: r.target, items: [] });
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

  const rejectBox = (ids) =>
    rejecting && rejecting.ids.join() === ids.join() ? (
      <div className="flex flex-wrap items-center gap-[6px]">
        <input
          autoFocus
          value={rejecting.reason}
          onChange={(e) => setRejecting({ ...rejecting, reason: e.target.value })}
          maxLength={100}
          placeholder="반려 사유 (선택)"
          className="input input-sm input-bordered w-[180px] bg-white"
        />
        <button type="button" disabled={busy} onClick={() => decide(ids, "reject", rejecting.reason)} className="btn btn-sm bg-rose-500 text-white hover:bg-rose-600">
          반려 확정
        </button>
        <button type="button" onClick={() => setRejecting(null)} className="btn btn-sm btn-ghost">
          취소
        </button>
      </div>
    ) : null;

  return (
    <div className="space-y-[12px]">
      <p className="text-[0.95rem] text-gray-700">
        학생이 키오스크 <b>🏆 퀘스트</b>에서 &quot;다 했어요!&quot;를 누르면 여기에 와요. 승인하면 퀘스트 보상이 지급돼요.
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
          {groups.map((g) => {
            const ids = g.items.map((r) => r._id);
            return (
              <section key={g.targetId} className="rounded-xl bg-white">
                <header className="flex flex-wrap items-center gap-[8px] rounded-t-xl border-b border-gray-100 bg-gray-50 px-[14px] py-[10px]">
                  <h2 className="font-bold">{g.target ? `🏆 ${g.target.name}` : "삭제된 퀘스트"}</h2>
                  {reward(g.target)}
                  <span className="text-[0.85rem] text-gray-500">신청 {g.items.length}명</span>
                  <div className="ml-auto flex gap-[6px]">
                    {g.target && (
                      <button type="button" disabled={busy} onClick={() => decide(ids, "approve")} className="btn btn-sm bg-emerald-500 text-white hover:bg-emerald-600">
                        모두 승인
                      </button>
                    )}
                    <button type="button" disabled={busy} onClick={() => setRejecting({ ids, reason: "" })} className="btn btn-sm btn-ghost text-rose-600">
                      모두 반려
                    </button>
                  </div>
                  {g.items.length > 1 && <div className="w-full">{rejectBox(ids)}</div>}
                </header>
                <ul className="divide-y divide-gray-100">
                  {g.items.map((r) => (
                    <li key={r._id} className="flex flex-wrap items-center gap-[8px] px-[14px] py-[10px]">
                      <span className="font-semibold">{labelOf(r.userId)}</span>
                      <span className="text-[0.8rem] text-gray-500" title={formatFullDate(r.createdAt)}>
                        {timeOf(r.createdAt)}
                      </span>
                      {r.target?.alreadyDone && (
                        <span className="rounded bg-gray-100 px-[6px] py-[1px] text-[0.75rem] text-gray-600" title="승인하면 보상 없이 닫혀요">
                          이미 완료됨
                        </span>
                      )}
                      <div className="ml-auto flex gap-[6px]">
                        {rejectBox([r._id]) ?? (
                          <>
                            {g.target && (
                              <button type="button" disabled={busy} onClick={() => decide([r._id], "approve")} className="btn btn-sm bg-emerald-500 text-white hover:bg-emerald-600">
                                승인
                              </button>
                            )}
                            <button type="button" disabled={busy} onClick={() => setRejecting({ ids: [r._id], reason: "" })} className="btn btn-sm btn-ghost text-rose-600">
                              반려
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl bg-white">
          {rows.map((r) => (
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
              <span className="min-w-0 truncate text-gray-700">{r.target ? r.target.name : "삭제된 퀘스트"}</span>
              {r.note && <span className="text-[0.8rem] text-gray-500">({r.note})</span>}
              {r.reason && <span className="text-[0.8rem] text-rose-600">사유: {r.reason}</span>}
              <span className="ml-auto text-[0.8rem] text-gray-500">처리: {r.decidedBy?.label ?? "-"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
