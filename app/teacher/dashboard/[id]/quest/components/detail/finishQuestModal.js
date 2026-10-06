"use client";
// 퀘스트 보상 지급 확인
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import usePendingAction from "@/hooks/usePendingAction";
import { finishQuest } from "@/server-action/actions/quest/quest.action";
import QuestConfirmModal from "./QuestConfirmModal";

const fmt = (v) => (Number(v) > 0 ? Number(v).toLocaleString() : "");

export default function FinishQuestModal({ modalId, setModalId, rewardedUserData = [], questData, currencyName, clearAll, classId, setQuestDetailData }) {
  const { runAction, isPending } = usePendingAction();
  const questId = questData?._id;

  const onConfirm = () =>
    runAction("finishQuest", questId, async () => {
      const data = await finishQuest({
        classId,
        questData,
        rewarded: rewardedUserData.map((u) => ({ userId: u.userId, money: u.money })),
      });
      if (!data?.result) {
        toast.error(data?.message ?? "보상 지급에 실패했습니다.");
        return;
      }
      const added = rewardedUserData.map((u) => u?.userId).filter(Boolean);
      setQuestDetailData?.((prev) => (prev ? { ...prev, finished: Array.from(new Set([...(prev.finished ?? []), ...added])) } : prev));
      setModalId(null);
      clearAll?.();
      toast.success("보상을 지급했습니다.");
      mutate(`/api/fetchQuestList/${classId}`);
      mutate(`/api/classData/${classId}`);
      mutate(`/api/students/${classId}`);
    }).catch((error) => {
      console.error(error);
      toast.error("네트워크 오류가 발생했습니다.");
    });

  return (
    <QuestConfirmModal id="FINISH_QUEST" modalId={modalId} setModalId={setModalId} title="보상을 지급합니다" busy={isPending("finishQuest", questId)} onConfirm={onConfirm}>
      <div className="flex flex-wrap gap-1">
        {rewardedUserData.map((u, i) => (
          <span key={u?.userId ?? i} className="rounded bg-orange-200 px-1">
            {u?.classNumber}. {u?.profileNickname}
          </span>
        ))}
      </div>
      <div className="mt-[16px]">
        {fmt(questData?.questReward) && <div>- {fmt(questData.questReward)}{currencyName}</div>}
        {fmt(questData?.questExp) && <div>- {fmt(questData.questExp)}경험치</div>}
        {questData?.questTitle && <div>- 칭호: {questData.questTitle}</div>}
      </div>
    </QuestConfirmModal>
  );
}
