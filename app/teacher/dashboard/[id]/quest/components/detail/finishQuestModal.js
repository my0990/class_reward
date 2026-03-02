'use client';

import { mutate } from "swr";

export default function FinishQuestModal({
  rewardedUserData = [],
  questData,
  currencyName,
  clearAll,
  classId,
  setQuestDetailData,
}) {
  const closeModal = () => {
    document.getElementById('my_modal_2')?.close();
  };

  // 숫자/문자열 둘 다 안전하게 "1,000" 형태로
  const formatNumber = (v) => {
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString();
  };

  const rewardText = formatNumber(questData?.questReward);
  const expText = formatNumber(questData?.questExp);
  const titleText = questData?.questTitle ? String(questData.questTitle) : '';

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/finishQuest", {
        method: "POST",
        body: JSON.stringify({
          classId,
          questData,
          rewarded: rewardedUserData.map((obj) => ({
            userId: obj.userId,
            money: obj.money,
          })),
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data?.result === true) {
        // ✅ finished에 userId 배열 추가 (중복 방지)
        setQuestDetailData?.((prev) => {
          if (!prev) return prev;

          const prevFinished = Array.isArray(prev.finished) ? prev.finished : [];
          const toAdd = rewardedUserData.map(u => u?.userId).filter(Boolean);

          // 중복 제거
          const nextFinished = Array.from(new Set([...prevFinished, ...toAdd]));

          return {
            ...prev,
            finished: nextFinished,
          };
        });

        closeModal();
        clearAll?.();

        mutate(`/api/fetchQuestList/${classId}`);
        mutate(`/api/classData/${classId}`);
        mutate(`/api/students/${classId}`);
      } else {
        alert(data?.message ?? "처리 실패");
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 오류");
    }
  };

  return (
    <dialog id="my_modal_2" className="modal w-[100%]">
      <div className="modal-box max-w-[600px] border-0 p-[32px]">
        <div className="flex justify-center flex-col text-[1.3rem]">
          <div className="flex flex-wrap">
            {rewardedUserData.map((a, i) => (
              <div key={a?.userId ?? i} className="mr-[4px]">
                <span className="bg-orange-200">
                  {a?.classNumber}. {a?.profileNickname}
                </span>
                {i < rewardedUserData.length - 1 && ", "}
              </div>
            ))}
            에게 지급합니다
          </div>

          <div className="mt-[16px]">
            {rewardText !== '' && <div>- {rewardText}{currencyName}</div>}
            {expText !== '' && <div>- {expText}경험치</div>}
            {titleText && <div>- 칭호: {titleText}</div>}
          </div>

          <form onSubmit={onSubmit} className="mt-[32px]">
            <button className="btn mt-[16px] w-[100%] bg-orange-500 border-0 text-white m-auto focus:outline-none text-[1.1rem]">
              확인
            </button>
          </form>

          <button
            onClick={closeModal}
            className="btn mt-[16px] w-[100%] text-[1.1rem] bg-white border-0 shadow-transparent focus:outline-none hover:bg-orange-500 hover:text-white text-orange-500 m-auto"
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