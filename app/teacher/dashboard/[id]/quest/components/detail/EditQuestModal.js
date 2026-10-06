"use client";
// 퀘스트 수정 (입력 창은 QuestFormModal 공용)
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import usePendingAction from "@/hooks/usePendingAction";
import { editQuest } from "@/server-action/actions/quest/quest.action";
import QuestFormModal from "../modal/QuestFormModal";

export default function EditQuestModal({ classId, currency, questDetailData, setQuestDetailData, modalId, setModalId }) {
  const { runAction, isPending } = usePendingAction();
  const questId = questDetailData?._id;

  const onSubmit = async (quest) => {
    if (!questId) return false;
    try {
      const res = await runAction("editQuest", questId, () => editQuest({ ...quest, questId, classId }));
      if (!res?.result) {
        toast.error(res?.message || "퀘스트 수정에 실패했습니다.");
        return false;
      }
      setQuestDetailData((prev) => ({ ...prev, ...quest }));
      await mutate(`/api/fetchQuestList/${classId}`);
      toast.success("퀘스트를 수정했습니다.");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("퀘스트 수정에 실패했습니다.");
      return false;
    }
  };

  return (
    <QuestFormModal
      id="EDIT_QUEST"
      modalId={modalId}
      setModalId={setModalId}
      title="퀘스트 수정하기"
      initial={questDetailData}
      currency={currency}
      busy={isPending("editQuest", questId)}
      onSubmit={onSubmit}
    />
  );
}
