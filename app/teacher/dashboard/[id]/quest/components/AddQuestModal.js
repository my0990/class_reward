'use client';

import { useState } from "react";
import { mutate } from "swr";

const makeInitialInput = (classId) => ({
  questName: "",
  questGoal: "",
  // input value용: 문자열 유지
  questReward: "",
  questExp: "",
  questTitle: "",
  // checkbox는 "값 존재 여부" 표시용 boolean
  rewardEnabled: false,
  expEnabled: false,
  titleEnabled: false,
  classId,
});

export default function AddQuestModal({ currencyEmoji, currencyName, classId }) {
  const [input, setInput] = useState(() => makeInitialInput(classId));

  const syncEnabled = (next) => ({
    ...next,
    rewardEnabled: next.questReward.trim() !== "",
    expEnabled: next.questExp.trim() !== "",
    titleEnabled: next.questTitle.trim() !== "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;

    // 텍스트 필드
    if (name === "questName" || name === "questGoal") {
      setInput((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // 칭호(문자열)
    if (name === "questTitle") {
      setInput((prev) => syncEnabled({ ...prev, questTitle: value }));
      return;
    }

    // 숫자 필드(문자열로 저장, 숫자만)
    if (name === "questReward" || name === "questExp") {
      if (!/^\d*$/.test(value)) return;

      setInput((prev) => syncEnabled({ ...prev, [name]: value }));
      return;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // enabled는 "값 존재 여부" 기준이니까, payload도 그 기준으로 정리
    const payload = {
      questName: input.questName,
      questGoal: input.questGoal,
      questReward: input.questReward.trim() !== "" ? Number(input.questReward) : 0,
      questExp: input.questExp.trim() !== "" ? Number(input.questExp) : 0,
      questTitle: input.questTitle.trim() !== "" ? input.questTitle : "",
      classId: input.classId,
    };

    const res = await fetch("/api/addQuest", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await res.json();

    if (response.result === true) {
      document.getElementById("my_modal_2")?.close();
      setInput(makeInitialInput(classId));
      mutate(`/api/fetchQuestList/${classId}`);
    } else {
      // 원하면 서버 메시지 노출
      alert(response?.message ?? "퀘스트 등록 실패");
    }
  };

  const onCloseModal = () => {
    document.getElementById("my_modal_2")?.close();
    setInput(makeInitialInput(classId));
  };

  return (
    <dialog id="my_modal_2" className="modal w-[100%]">
      <div className="modal-box max-w-[600px] p-[32px] border-0 text-red-900 text-[1.2rem]">
        <div className="flex justify-center flex-col">
          <h1 className="text-red-900 font-bold text-[2rem] text-center mb-[8px]">
            퀘스트 등록하기
          </h1>

          <h2 className="font-bold">퀘스트 이름</h2>
          <input
            className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]"
            name="questName"
            onChange={onChange}
            value={input.questName}
          />

          <h2 className="font-bold">퀘스트 목표</h2>
          <input
            className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]"
            name="questGoal"
            onChange={onChange}
            value={input.questGoal}
          />

          <h2 className="font-bold">퀘스트 보상</h2>
          <div className="mb-[8px]">
            {/* Reward */}
            <div className="flex justify-between mb-[8px] h-[32px]">
              <div className="flex items-center cursor-default">
                <input
                  id="rewardEnabled"
                  name="rewardEnabled"
                  type="checkbox"
                  checked={input.rewardEnabled}
                  readOnly
                  onClick={(e) => e.preventDefault()} // 표시용
                  className="cursor-default checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="rewardEnabled" className="cursor-default">
                  {currencyName}
                </label>
              </div>

              <div className="flex">
                <div className="border-b-4 border-orange-400">{currencyEmoji}</div>
                <input
                  onChange={onChange}
                  name="questReward"
                  placeholder="숫자만 입력"
                  value={input.questReward}
                  className="placeholder:text-center w-[160px] text-right cursor-pointer border-orange-400 outline-none border-b-4"
                />
              </div>
            </div>

            {/* Exp */}
            <div className="flex justify-between mb-[8px] h-[32px]">
              <div className="flex items-center cursor-default">
                <input
                  id="expEnabled"
                  name="expEnabled"
                  type="checkbox"
                  checked={input.expEnabled}
                  readOnly
                  onClick={(e) => e.preventDefault()} // 표시용
                  className="cursor-default checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="expEnabled" className="cursor-default">
                  경험치
                </label>
              </div>

              <div className="flex">
                <div className="border-b-4 border-orange-400">🆙</div>
                <input
                  onChange={onChange}
                  name="questExp"
                  placeholder="숫자만 입력"
                  value={input.questExp}
                  className="placeholder:text-center w-[160px] text-right cursor-pointer border-orange-400 outline-none border-b-4"
                />
              </div>
            </div>

            {/* Title */}
            <div className="flex justify-between mb-[8px] h-[32px]">
              <div className="flex items-center cursor-default">
                <input
                  id="titleEnabled"
                  name="titleEnabled"
                  type="checkbox"
                  checked={input.titleEnabled}
                  readOnly
                  onClick={(e) => e.preventDefault()} // 표시용
                  className="cursor-default checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="titleEnabled" className="cursor-default">
                  칭호
                </label>
              </div>

              <div className="flex">
                <div className="border-b-4 border-orange-400">🍊</div>
                <input
                  onChange={onChange}
                  name="questTitle"
                  value={input.questTitle}
                  className="w-[160px] text-right cursor-pointer border-orange-400 outline-none border-b-4"
                />
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <button className="btn mt-[16px] w-[100%] bg-orange-500 border-0 text-white m-auto text-[1.2rem] focus:outline-none">
              확인
            </button>
          </form>

          <button
            onClick={onCloseModal}
            className="btn mt-[16px] text-[1.2rem] w-[100%] bg-white border-0 shadow-transparent focus:outline-none hover:bg-orange-500 hover:text-white text-orange-500 m-auto"
          >
            취소
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
        <button>close</button>
      </form>
    </dialog>
  );
}