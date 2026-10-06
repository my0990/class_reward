"use client";
// 퀘스트 완료 기록 초기화 확인
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import usePendingAction from "@/hooks/usePendingAction";
import { resetQuest } from "@/server-action/actions/quest/quest.action";
import QuestConfirmModal from "./QuestConfirmModal";

export default function ResetQuestModal({ modalId, setModalId, questData, setQuestDetailData, classId }) {
  const { runAction, isPending } = usePendingAction();
  const questId = questData?._id;

  const onConfirm = () =>
    runAction("resetQuest", questId, async () => {
      const data = await resetQuest({ questId, classId });
      if (!data?.result) {
        toast.error(data?.message ?? "초기화에 실패했습니다.");
        return;
      }
      setQuestDetailData?.((prev) => (prev ? { ...prev, finished: [] } : prev));
      setModalId(null);
      toast.success("퀘스트를 초기화했습니다.");
      mutate(`/api/fetchQuestList/${classId}`);
      mutate(`/api/classData/${classId}`);
      mutate(`/api/students/${classId}`);
    }).catch((error) => {
      console.error(error);
      toast.error("네트워크 오류가 발생했습니다.");
    });

  return (
    <QuestConfirmModal id="RESET_QUEST" modalId={modalId} setModalId={setModalId} title="퀘스트를 초기화합니다" danger busy={isPending("resetQuest", questId)} onConfirm={onConfirm}>
      <p className="text-[1rem] text-gray-600">완료 표시가 모두 지워져 다시 보상을 줄 수 있게 됩니다.</p>
    </QuestConfirmModal>
  );
}
