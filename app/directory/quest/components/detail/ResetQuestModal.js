'use client'
import { useRouter } from "next/navigation";
import { mutate } from "swr";
export default function ResetQuestModal({ questData, setQuestDetailData }) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/resetQuest", {
            method: "POST",
            body: JSON.stringify({ questData: questData }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                document.getElementById('resetModal').close();
                mutate(
                    `/api/fetchQuestList`,
                    (prev) => {
                        const updatedArr = prev.map((item) => item._id === questData._id ? { ...item,  finished: [] } : item)
                        setQuestDetailData({ ...questData, finished: [] })
                        return updatedArr;
                    },
                    false
                );
            }
        })
    }


    return (
        <dialog id="resetModal" className="modal  w-[100%]">

            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">

                <div className="flex items-center">
                    <h1 className="text-[1.5rem] font-bold mb-[36px] text-black">퀘스트를 초기화합니다</h1>
                </div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">확인</button>
                    </form>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 text-black rounded-[5px] py-[8px]" onClick={() => document.getElementById('resetModal').close()}>취소</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}