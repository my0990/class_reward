'use client'
import { useState } from "react"
import { mutate } from "swr"

const makeInitialInput = (classId) => ({
  questName: '',
  questGoal: '',
  // 값은 문자열로 유지 (input value용)
  questReward: '',
  questExp: '',
  questTitle: '',
  // 체크박스는 boolean으로 분리
  rewardEnabled: false,
  expEnabled: false,
  titleEnabled: false,
  classId,
});

export default function AddQuestModal({ currencyEmoji, currencyName, classId }) {
  const [input, setInput] = useState(() => makeInitialInput(classId));

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 체크박스면 boolean로만
    if (type === "checkbox") {
      setInput(prev => ({ ...prev, [name]: checked }));
      return;
    }

    // 문자열 필드
    if (name === 'questTitle' || name === 'questName' || name === 'questGoal') {
      setInput(prev => ({ ...prev, [name]: value }));
      return;
    }

    // 숫자 입력 필드(문자열로 보관, 숫자만 허용)
    if (/^\d*$/.test(value)) {
      setInput(prev => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 서버로 보낼 payload (enabled false면 값은 0/""로 정리)
    const payload = {
      questName: input.questName,
      questGoal: input.questGoal,
      questReward: input.rewardEnabled ? Number(input.questReward || 0) : 0,
      questExp: input.expEnabled ? Number(input.questExp || 0) : 0,
      questTitle: input.titleEnabled ? input.questTitle : '',
      classId: input.classId,
    };

    const res = await fetch("/api/addQuest", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await res.json();

    if (response.result === true) {
      document.getElementById('my_modal_2').close();
      setInput(makeInitialInput(classId));
      mutate("/api/fetchQuestList");
    }
  };

  const onCloseModal = () => {
    document.getElementById('my_modal_2').close();
    setInput(makeInitialInput(classId));
  };

  return (
    <dialog id="my_modal_2" className="modal w-[100%]">
      <div className="modal-box max-w-[600px] p-[32px] border-0 text-red-900 text-[1.2rem]">
        <div className="flex justify-center flex-col">
          <h1 className="text-red-900 font-bold text-[2rem] text-center mb-[8px]">퀘스트 등록하기</h1>

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
                  checked={input.rewardEnabled} // ✅ 항상 boolean
                  onChange={onChange}
                  className="cursor-pointer checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="rewardEnabled" className="cursor-default">{currencyName}</label>
              </div>
              <div className="flex">
                <div className="border-b-4 border-orange-400">{currencyEmoji}</div>
                <input
                  onChange={onChange}
                  name="questReward"
                  placeholder="숫자만 입력"
                  value={input.questReward}     // ✅ 항상 string
                  disabled={!input.rewardEnabled}
                  className="placeholder:text-center w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default outline-none border-b-4"
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
                  checked={input.expEnabled} // ✅ 항상 boolean
                  onChange={onChange}
                  className="cursor-pointer checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="expEnabled" className="cursor-default">경험치</label>
              </div>
              <div className="flex">
                <div className="border-b-4 border-orange-400">🆙</div>
                <input
                  onChange={onChange}
                  name="questExp"
                  placeholder="숫자만 입력"
                  value={input.questExp}       // ✅ 항상 string
                  disabled={!input.expEnabled}
                  className="placeholder:text-center w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default outline-none border-b-4"
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
                  checked={input.titleEnabled} // ✅ 항상 boolean
                  onChange={onChange}
                  className="cursor-pointer checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="titleEnabled" className="cursor-default">칭호</label>
              </div>
              <div className="flex">
                <div className="border-b-4 border-orange-400">🍊</div>
                <input
                  onChange={onChange}
                  name="questTitle"
                  value={input.questTitle}      // ✅ 항상 string
                  disabled={!input.titleEnabled}
                  className="w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default outline-none border-b-4"
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