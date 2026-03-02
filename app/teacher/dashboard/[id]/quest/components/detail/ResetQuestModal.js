'use client';

import { mutate } from "swr";

export default function ResetQuestModal({ questData, setQuestDetailData, classId }) {
  const closeModal = () => {
    document.getElementById('resetModal')?.close();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/resetQuest", {
        method: "POST",
        body: JSON.stringify({ questData, classId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data?.result === true) {
        // ✅ reset 성공하면 finished 비우기 (즉시 UI 반응)
        setQuestDetailData?.((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            finished: [],
          };
        });

        closeModal();

        mutate(`/api/fetchQuestList/${classId}`);
        mutate(`/api/classData/${classId}`);
        mutate(`/api/students/${classId}`);
      } else {
        alert(data?.message ?? "초기화 실패");
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 오류");
    }
  };

  return (
    <dialog id="resetModal" className="modal w-[100%]">
      <div className="modal-box min-[600px]:p-[48px] dark:bg-orange-200">
        <div className="flex items-center">
          <h1 className="text-[1.5rem] font-bold mb-[36px] text-black">
            퀘스트를 초기화합니다
          </h1>
        </div>

        <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
          <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
            <button className="w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px]">
              확인
            </button>
          </form>

          <button
            className="w-[48%] max-[600px]:w-[100%] bg-gray-200 text-black rounded-[5px] py-[8px]"
            onClick={closeModal}
            type="button"
          >
            취소
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop" onClick={closeModal}>
        <button>close</button>
      </form>
    </dialog>
  );
}