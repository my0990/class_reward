"use client";
// 키오스크 퀘스트: 퀘스트 목록 → 퀘스트 하나를 고르면 학생 카드들 (선생님 퀘스트 화면처럼)
// 다 한 학생들이 자기 카드를 눌러 고르고(토글) "선생님께 알리기" → 완료 신청 (비밀번호 없음)
// 보상은 선생님이 승인 센터에서 승인할 때 지급된다.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import KioskHeader from "../_components/KioskHeader";
import KioskConfirm from "../_components/KioskConfirm";
import StudentCard from "../_components/StudentCard";
import { listKioskQuests, requestKioskQuest } from "@/server-action/actions/kiosk/kioskQuest.action";

function Rewards({ q, currency, big = false }) {
  const chip = big ? "rounded-lg px-3 py-1 text-[1.2rem]" : "rounded-lg px-2 py-1 text-base";
  return (
    <div className="flex flex-wrap gap-2 font-semibold">
      {q.questReward > 0 && <span className={`${chip} bg-orange-100`}>💰 {q.questReward.toLocaleString()}{currency}</span>}
      {q.questExp > 0 && <span className={`${chip} bg-sky-100`}>⭐ 경험치 {q.questExp}</span>}
      {q.questTitle && <span className={`${chip} bg-purple-100`}>🎖️ {q.questTitle}</span>}
    </div>
  );
}

export default function KioskQuestPage() {
  const { id: classId } = useParams();
  const { data: classData } = useFetchData(`/api/classData/${classId}`);
  const { data: students } = useFetchData(`/api/students/${classId}`);
  const [quests, setQuests] = useState(null);
  const [error, setError] = useState(null);
  const [questId, setQuestId] = useState(null); // 고른 퀘스트
  const [picked, setPicked] = useState(() => new Set()); // 고른 학생 userId
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await listKioskQuests({ classId });
    if (res?.result) setQuests(res.quests);
    else setError(res?.message || "퀘스트를 불러오지 못했어요.");
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  const quest = quests?.find((q) => q._id === questId) ?? null;
  const studentList = useMemo(() => (students ?? []).filter((s) => s.role !== "teacher"), [students]);
  const currency = classData?.currencyName ?? "";

  const openQuest = (id) => {
    setPicked(new Set());
    setQuestId(id);
    load(); // 들어갈 때 최신 상태로
  };

  const toggle = (userId) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });

  const submit = async () => {
    setBusy(true);
    const res = await requestKioskQuest({ classId, questId, userIds: [...picked] });
    setBusy(false);
    setConfirming(false);
    if (res?.result) {
      toast.success(
        res.skipped ? `${res.created}명 신청했어요. (${res.skipped}명은 이미 신청했거나 완료한 학생이에요)` : `${res.created}명 신청했어요! 선생님이 확인하면 보상을 받아요.`
      );
      setPicked(new Set());
    } else {
      toast.error(res?.message || "신청하지 못했어요.");
    }
    load();
  };

  // ---- 퀘스트 목록 ----
  if (!quest) {
    return (
      <div className="min-h-[100vh] bg-orange-100">
        <div className="mx-auto w-full max-w-[1136px] px-4 pb-8">
          <KioskHeader classId={classId} title="퀘스트" onRefresh={load} />
          {error ? (
            <div className="mt-16 text-center text-[1.4rem] text-red-500">{error}</div>
          ) : !quests ? (
            <div className="mt-16 text-center text-[1.4rem] text-gray-500">불러오는 중...</div>
          ) : quests.length === 0 ? (
            <div className="mt-16 text-center text-[1.6rem] text-gray-500">아직 퀘스트가 없어요.</div>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {quests.map((q) => (
                <li key={q._id}>
                  <button
                    type="button"
                    onClick={() => openQuest(q._id)}
                    className="flex h-full w-full flex-col rounded-2xl border-4 border-orange-300 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-500 active:scale-[0.98]"
                  >
                    <h2 className="text-[1.6rem] font-black leading-tight text-orange-950">🏆 {q.questName}</h2>
                    {q.questGoal && <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[1.1rem] text-gray-700">{q.questGoal}</p>}
                    <div className="mt-3">
                      <Rewards q={q} currency={currency} />
                    </div>
                    <div className="mt-3 text-base font-semibold text-gray-500">
                      완료 {q.finished.length}명{q.pending.length > 0 && ` · 확인 중 ${q.pending.length}명`}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // ---- 퀘스트 하나: 학생 고르기 ----
  const finished = new Set(quest.finished);
  const pending = new Set(quest.pending);
  return (
    <div className="min-h-[100vh] bg-orange-100">
      <div className="mx-auto w-full max-w-[1410px] px-4 pb-32">
        <KioskHeader classId={classId} title={quest.questName} onBack={() => setQuestId(null)} onRefresh={load} />

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-white p-5">
          <div className="min-w-0">
            <h2 className="text-[1.8rem] font-black text-orange-950">🏆 {quest.questName}</h2>
            {quest.questGoal && <p className="mt-1 whitespace-pre-wrap text-[1.2rem] text-gray-700">{quest.questGoal}</p>}
          </div>
          <Rewards q={quest} currency={currency} big />
        </div>

        <div className="ml-[8px] mt-[16px] text-[1.8rem] text-red-500">다 한 사람은 자기 카드를 눌러 주세요</div>

        <div className="mt-2 grid grid-cols-[repeat(auto-fill,160px)] justify-center gap-4">
          {studentList.map((user) => {
            const state = finished.has(user.userId) ? "done" : pending.has(user.userId) ? "pending" : picked.has(user.userId) ? "picked" : "open";
            const locked = state === "done" || state === "pending";
            return (
              <div key={user.userId} className={`relative rounded-xl ${state === "picked" ? "ring-[6px] ring-orange-500" : ""}`}>
                <div className={locked ? "pointer-events-none opacity-35" : ""}>
                  <StudentCard
                    user={user}
                    currencyEmoji={classData?.currencyEmoji}
                    startExp={classData?.expTable?.startExp}
                    commonDifference={classData?.expTable?.commonDifference}
                    onClick={() => toggle(user.userId)}
                  />
                </div>
                {state === "picked" && (
                  <span className="pointer-events-none absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-2xl font-black text-white shadow">
                    ✓
                  </span>
                )}
                {locked && (
                  <span
                    className={`pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg py-1 text-center text-[1.2rem] font-black shadow ${
                      state === "done" ? "bg-emerald-500 text-white" : "bg-amber-400 text-amber-950"
                    }`}
                  >
                    {state === "done" ? "🏅 완료" : "⏳ 확인 중"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 아래 고정 바: 고른 인원 + 신청 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-orange-300 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1136px] items-center gap-3">
          <span className="text-[1.4rem] font-bold text-orange-950">{picked.size > 0 ? `${picked.size}명 골랐어요` : "카드를 눌러 골라요"}</span>
          {picked.size > 0 && (
            <button type="button" onClick={() => setPicked(new Set())} className="rounded-xl px-4 py-3 text-[1.1rem] font-semibold text-gray-600 hover:bg-gray-100">
              모두 해제
            </button>
          )}
          <button
            type="button"
            disabled={picked.size === 0}
            onClick={() => setConfirming(true)}
            className="ml-auto rounded-xl bg-orange-500 px-8 py-4 text-[1.4rem] font-black text-white transition hover:bg-orange-600 active:scale-95 disabled:opacity-40"
          >
            선생님께 알리기
          </button>
        </div>
      </div>

      <KioskConfirm
        open={confirming}
        title={`${picked.size}명이 "${quest.questName}" 퀘스트를 다 했나요? 선생님께 알릴게요.`}
        busy={busy}
        onConfirm={submit}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
