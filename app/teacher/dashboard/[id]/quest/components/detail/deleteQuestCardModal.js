'use client'
import { mutate } from "swr";
import { toast } from "react-hot-toast";
import usePendingAction from "@/hooks/usePendingAction";
import { deleteQuest } from "@/server-action/actions/quest/quest.action";

export default function AddQuestModal({ data, setIsDetail, classId }) {
    const { runAction, isPending } = usePendingAction();
    const questId = data?._id;
    const isDeleting = isPending("deleteQuest", questId);

    const onSubmit = (e) => {
        e.preventDefault();

        if (!questId) {
            toast.error("퀘스트 ID가 없습니다.");
            return;
        }

        runAction(
            "deleteQuest",
            questId,
            async () => {
                const response = await deleteQuest({ questId, classId });

                if (!response?.result) {
                    throw new Error(response?.message || "퀘스트 삭제에 실패했습니다.");
                }

                await mutate(`/api/fetchQuestList/${classId}`);
                setIsDetail(false);

                return response;
            },
            {
                onError: (error) => {
                    console.error(error);
                    toast.error(error?.message || "퀘스트 삭제에 실패했습니다.");
                },
            }
        );
    }


    return (
        <dialog id="my_modal_3" className="modal  w-[100%]">

            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">

                <div className="flex items-center">
                    <h1 className="text-[1.5rem] font-bold mb-[36px]">생성된 퀘스트를 삭제합니다</h1>
                </div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button disabled={isDeleting} className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] disabled:opacity-60">{isDeleting ? "삭제 중..." : "확인"}</button>
                    </form>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px]" onClick={() => document.getElementById('my_modal_3').close()}>취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}
