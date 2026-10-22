"use client";
// 키오스크 퀘스트: 학생 선택(비밀번호 없음) → 내 퀘스트 목록 → "다 했어요!"로 완료 신청
// 보상은 선생님이 승인 센터에서 승인할 때 지급된다.
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import StudentPicker from "../_components/StudentPicker";
import KioskHeader from "../_components/KioskHeader";
import KioskConfirm from "../_components/KioskConfirm";
import { listKioskQuests, requestKioskQuest } from "@/server-action/actions/kiosk/kioskQuest.action";

const STATUS = {
  done: { label: "🏅 완료", cls: "bg-emerald-100 text-emerald-800" },
  pending: { label: "⏳ 선생님 확인 중", cls: "bg-amber-100 text-amber-800" },
};

export default function KioskQuestPage() {
  const { id: classId } = useParams();
  const { data: classData } = useFetchData(`/api/classData/${classId}`);
  const [user, setUser] = useState(null);
  const [quests, setQuests] = useState(null);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null); // 신청할 퀘스트
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (u) => {
      setQuests(null);
      setError(null);
      const res = await listKioskQuests({ classId, userId: u.userId });
      if (res?.result) setQuests(res.quests);
      else setError(res?.message || "퀘스트를 불러오지 못했어요.");
    },
    [classId]
  );

  useEffect(() => {
    if (user) load(user);
  }, [user, load]);

  if (!user) {
    return (
      <div className="min-h-[100vh] bg-orange-100">
        <StudentPicker classId={classId} title="퀘스트" guide="내 이름을 눌러 주세요" noPassword onPicked={({ user: u }) => setUser(u)} />
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    const res = await requestKioskQuest({ classId, userId: user.userId, questId: target._id });
    setBusy(false);
    setTarget(null);
    if (res?.result) {
      toast.success("선생님께 알렸어요! 확인되면 보상을 받아요.");
      setQuests((qs) => qs.map((q) => (q._id === target._id ? { ...q, status: "pending" } : q)));
    } else {
      toast.error(res?.message || "신청하지 못했어요.");
      load(user);
    }
  };

  const currency = classData?.currencyName ?? "";
  return (
    <div className="min-h-[100vh] bg-orange-100">
      <div className="mx-auto w-full max-w-[1136px] px-4 pb-8">
        <KioskHeader classId={classId} title={`${user.classNumber}. ${user.profileNickname}의 퀘스트`} onBack={() => setUser(null)} onRefresh={() => load(user)} />

        {error ? (
          <div className="mt-16 text-center text-[1.4rem] text-red-500">{error}</div>
        ) : !quests ? (
          <div className="mt-16 text-center text-[1.4rem] text-gray-500">불러오는 중...</div>
        ) : quests.length === 0 ? (
          <div className="mt-16 text-center text-[1.6rem] text-gray-500">아직 퀘스트가 없어요.</div>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {quests.map((q) => {
              const st = STATUS[q.status];
              return (
                <li key={q._id} className={`flex flex-col rounded-2xl border-4 p-5 ${q.status === "open" ? "border-orange-300 bg-white" : "border-transparent bg-white/70"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[1.6rem] font-black leading-tight text-orange-950">{q.questName}</h2>
                    {st && <span className={`shrink-0 rounded-full px-3 py-1 text-base font-bold ${st.cls}`}>{st.label}</span>}
                  </div>
                  {q.questGoal && <p className="mt-2 whitespace-pre-wrap text-[1.15rem] text-gray-700">{q.questGoal}</p>}
                  <div className="mt-3 flex flex-wrap gap-2 text-base font-semibold">
                    {q.questReward > 0 && <span className="rounded-lg bg-orange-100 px-2 py-1">💰 {q.questReward.toLocaleString()}{currency}</span>}
                    {q.questExp > 0 && <span className="rounded-lg bg-sky-100 px-2 py-1">⭐ 경험치 {q.questExp}</span>}
                    {q.questTitle && <span className="rounded-lg bg-purple-100 px-2 py-1">🎖️ {q.questTitle}</span>}
                  </div>
                  {q.status === "open" && (
                    <button
                      type="button"
                      onClick={() => setTarget(q)}
                      className="mt-4 rounded-xl bg-orange-500 py-4 text-[1.4rem] font-black text-white transition hover:bg-orange-600 active:scale-95"
                    >
                      다 했어요!
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <KioskConfirm
          open={Boolean(target)}
          title={target ? `"${target.questName}" 퀘스트를 다 했나요? 선생님께 알릴게요.` : ""}
          confirmLabel="네, 다 했어요"
          busy={busy}
          onConfirm={submit}
          onCancel={() => setTarget(null)}
        />
      </div>
    </div>
  );
}
