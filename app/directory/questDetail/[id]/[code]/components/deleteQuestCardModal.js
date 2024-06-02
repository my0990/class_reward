'use client'
import { useRouter } from "next/navigation";
export default function AddQuestModal({ data }) {
    const router = useRouter();
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/deleteQuest", {
            method: "POST",
            body: JSON.stringify({ data: data }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                alert('삭제하였습니다.')
                router.back();
            }
        })
    }


    return (
        <dialog id="my_modal_3" className="modal  w-[100%]">

            <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">

                <div className="flex items-center">
                    <h1 className="text-[1.5rem] font-bold mb-[36px]">생성된 퀘스트를 삭제합니다</h1>
                </div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button className="w-[100%] max-[600px]:w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">삭제</button>
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