'use client'
import { useEffect, useState } from "react"
import { mutate } from "swr"

const makeInitialInput = (questDetailData) => ({
  name: questDetailData?.questName ?? '',
  goal: questDetailData?.questGoal ?? '',

  // value는 항상 string으로 유지
  reward: questDetailData?.questReward != null ? String(questDetailData.questReward) : '',
  exp: questDetailData?.questExp != null ? String(questDetailData.questExp) : '',
  title: questDetailData?.questTitle ?? '',

  // checkbox는 boolean으로 분리 (값이 있으면 true)
  rewardEnabled: Boolean(questDetailData?.questReward),
  expEnabled: Boolean(questDetailData?.questExp),
  titleEnabled: Boolean(questDetailData?.questTitle),
});

export default function EditQuestModal({ currencyEmoji, questDetailData, setQuestDetailData, classId }) {
  const [input, setInput] = useState(() => makeInitialInput(questDetailData));

  useEffect(() => {
    setInput(makeInitialInput(questDetailData));
  }, [questDetailData]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ✅ checkbox는 boolean만
    if (type === "checkbox") {
      setInput(prev => ({ ...prev, [name]: checked }));
      return;
    }

    // ✅ 문자열 필드
    if (name === 'title' || name === 'name' || name === 'goal') {
      setInput(prev => ({ ...prev, [name]: value }));
      return;
    }

    // ✅ 숫자 필드(문자열로 저장, 숫자만 허용)
    if (/^\d*$/.test(value)) {
      setInput(prev => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!questDetailData?._id) return;

    const payload = {
      questId: questDetailData._id,
      questName: input.name,
      questGoal: input.goal,
      questReward: input.rewardEnabled ? Number(input.reward || 0) : 0,
      questExp: input.expEnabled ? Number(input.exp || 0) : 0,
      questTitle: input.titleEnabled ? input.title : '',
      classId: classId,
    };

    const res = await fetch("/api/editQuest", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.result === true) {
      document.getElementById('editQuestModal').close();

      // UI 반영용 업데이트 값
      const nextQuest = {
        ...questDetailData,
        questName: payload.questName,
        questGoal: payload.questGoal,
        questReward: payload.questReward,
        questExp: payload.questExp,
        questTitle: payload.questTitle,
        classId: classId
      };

      setQuestDetailData(nextQuest);

      mutate(
        `/api/fetchQuestList`,
      );
    }
  };

  const onCloseModal = () => {
    document.getElementById('editQuestModal').close();
    // 취소면 원래 데이터로 되돌리기
    setInput(makeInitialInput(questDetailData));
  };

  return (
    <dialog id="editQuestModal" className="modal w-[100%]">
      <div className="modal-box max-w-[600px] p-[32px] border-0 text-red-900 text-[1.2rem]">
        <div className="flex justify-center flex-col">
          <h1 className="text-red-900 font-bold text-[2rem] text-center mb-[8px]">퀘스트 수정하기</h1>

          <h2 className="font-bold">퀘스트 이름</h2>
          <input
            className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]"
            name="name"
            onChange={onChange}
            value={input.name}
          />

          <h2 className="font-bold">퀘스트 목표</h2>
          <input
            className="border-2 focus:outline-orange-500 mb-[16px] p-[8px]"
            name="goal"
            onChange={onChange}
            value={input.goal}
          />

          <h2 className="font-bold">퀘스트 보상</h2>

          <div className="mb-[8px]">
            {/* Reward */}
            <div className="flex justify-between mb-[8px] h-[32px]">
              <div className="flex items-center">
                <input
                  id="rewardEnabled"
                  name="rewardEnabled"
                  type="checkbox"
                  checked={input.rewardEnabled}     // ✅ 항상 boolean
                  onChange={onChange}
                  className="cursor-pointer checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="rewardEnabled" className="cursor-pointer">쿠키</label>
              </div>
              <div className="flex">
                <div className="border-b-4 border-orange-400">{currencyEmoji}</div>
                <input
                  onChange={onChange}
                  name="reward"
                  value={input.reward}              // ✅ 항상 string
                  disabled={!input.rewardEnabled}
                  className="w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default outline-none border-b-4"
                />
              </div>
            </div>

            {/* Exp */}
            <div className="flex justify-between mb-[8px] h-[32px]">
              <div className="flex items-center">
                <input
                  id="expEnabled"
                  name="expEnabled"
                  type="checkbox"
                  checked={input.expEnabled}        // ✅ 항상 boolean
                  onChange={onChange}
                  className="cursor-pointer checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="expEnabled" className="cursor-pointer">경험치</label>
              </div>
              <div className="flex">
                <div className="border-b-4 border-orange-400">🆙</div>
                <input
                  onChange={onChange}
                  name="exp"
                  value={input.exp}                 // ✅ 항상 string
                  disabled={!input.expEnabled}
                  className="w-[160px] text-right cursor-pointer disabled:bg-transparent disabled:border-transparent border-orange-400 disabled:cursor-default outline-none border-b-4"
                />
              </div>
            </div>

            {/* Title */}
            <div className="flex justify-between mb-[8px] h-[32px]">
              <div className="flex items-center">
                <input
                  id="titleEnabled"
                  name="titleEnabled"
                  type="checkbox"
                  checked={input.titleEnabled}      // ✅ 항상 boolean
                  onChange={onChange}
                  className="cursor-pointer checkbox checkbox-warning mr-[8px]"
                />
                <label htmlFor="titleEnabled" className="cursor-pointer">칭호</label>
              </div>
              <div className="flex">
                <div className="border-b-4 border-orange-400">🍊</div>
                <input
                  onChange={onChange}
                  name="title"
                  value={input.title}               // ✅ 항상 string
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