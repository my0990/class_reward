"use client";
// 퀘스트 등록 (입력 창은 QuestFormModal 공용)
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import usePendingAction from "@/hooks/usePendingAction";
import { createQuest } from "@/server-action/actions/quest/quest.action";
import QuestFormModal from "./QuestFormModal";

export default function AddQuestModal({ classId, currency, modalId, setModalId }) {
  const { runAction, isPending } = usePendingAction();

  const onSubmit = async (quest) => {
    try {
      const res = await runAction("createQuest", () => createQuest({ ...quest, classId }));
      if (!res?.result) {
        toast.error(res?.message || "퀘스트 등록에 실패했습니다.");
        return false;
      }
      await mutate(`/api/fetchQuestList/${classId}`);
      toast.success("퀘스트를 등록했습니다.");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("퀘스트 등록 중 오류가 발생했습니다.");
      return false;
    }
  };

  return (
    <QuestFormModal
      id="ADD_QUEST"
      modalId={modalId}
      setModalId={setModalId}
      title="퀘스트 등록하기"
      currency={currency}
      busy={isPending("createQuest")}
      onSubmit={onSubmit}
    />
  );
}
