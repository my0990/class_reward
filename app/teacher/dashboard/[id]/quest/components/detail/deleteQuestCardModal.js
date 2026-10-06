"use client";
// 퀘스트 삭제 확인
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import usePendingAction from "@/hooks/usePendingAction";
import { deleteQuest } from "@/server-action/actions/quest/quest.action";
import QuestConfirmModal from "./QuestConfirmModal";

export default function DeleteQuestCardModal({ modalId, setModalId, data, setIsDetail, classId }) {
  const { runAction, isPending } = usePendingAction();
  const questId = data?._id;

  const onConfirm = () =>
    runAction("deleteQuest", questId, async () => {
      const res = await deleteQuest({ questId, classId });
      if (!res?.result) {
        toast.error(res?.message || "퀘스트 삭제에 실패했습니다.");
        return;
      }
      await mutate(`/api/fetchQuestList/${classId}`);
      setModalId(null);
      toast.success("퀘스트를 삭제했습니다.");
      setIsDetail(false);
    }).catch((error) => {
      console.error(error);
      toast.error("퀘스트 삭제에 실패했습니다.");
    });

  return (
    <QuestConfirmModal id="DELETE_QUEST" modalId={modalId} setModalId={setModalId} title="퀘스트를 삭제합니다" danger busy={isPending("deleteQuest", questId)} onConfirm={onConfirm}>
      <p className="text-[1rem] text-gray-600">&quot;{data?.questName}&quot; 퀘스트가 목록에서 사라집니다.</p>
    </QuestConfirmModal>
  );
}
