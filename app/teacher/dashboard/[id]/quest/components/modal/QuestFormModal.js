"use client";
// 퀘스트 등록·수정 공용 입력 창: 이름 · 목표 · 종류(일반/일일/주간) · 보상(화폐/경험치/칭호 — 칭호는 일반만)
// 값이 있는 보상은 체크 표시가 자동으로 켜진다. 숫자 칸은 숫자만 받는다.
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { EMPTY_QUEST_INPUT as EMPTY, questToInput, inputToQuest } from "./questForm";
import { QUEST_REPEATS } from "@/util/quest/questRepeat";

/**
 * @param {{ id: string, modalId, setModalId, title: string, submitLabel?: string,
 *   initial?: object, currency: { name: string, emoji: string }, busy: boolean,
 *   onSubmit: (quest) => Promise<boolean> }} props  onSubmit이 true를 돌려주면 창을 닫는다
 */
export default function QuestFormModal({ id, modalId, setModalId, title, submitLabel = "확인", initial, currency, busy, onSubmit }) {
  const isOpen = modalId === id;
  const [input, setInput] = useState(EMPTY);

  // 창을 열 때마다 처음 값으로
  useEffect(() => {
    if (isOpen) setInput(questToInput(initial));
  }, [isOpen, initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "questReward" || name === "questExp") {
      const digits = value.replace(/\D/g, "");
      setInput((prev) => ({ ...prev, [name]: digits === "" ? "" : String(Number(digits)) }));
      return;
    }
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const close = () => {
    if (!busy) setModalId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const quest = inputToQuest(input);
    if (quest.error) {
      toast.error(quest.error);
      return;
    }
    if (await onSubmit(quest)) setModalId(null);
  };

  const field = "mb-[16px] border-2 p-[8px] focus:outline-orange-500";
  return (
    <ModalTemplate id={id} modalId={modalId} setModalId={setModalId} className="w-[calc(100%-32px)] max-w-[600px]">
      {() => (
        <form onSubmit={submit} className="flex flex-col p-[24px] text-[1.2rem] text-red-900 min-[600px]:p-[32px]">
          <h1 className="mb-[16px] text-center text-[2rem] font-bold">{title}</h1>

          <label htmlFor={`${id}-name`} className="font-bold">퀘스트 이름</label>
          <input id={`${id}-name`} name="questName" value={input.questName} onChange={onChange} disabled={busy} className={field} />

          <label htmlFor={`${id}-goal`} className="font-bold">퀘스트 목표</label>
          <input id={`${id}-goal`} name="questGoal" value={input.questGoal} onChange={onChange} disabled={busy} className={field} />

          <div className="mb-[4px] font-bold">퀘스트 종류</div>
          <div className="mb-[4px] flex gap-[8px]" role="radiogroup" aria-label="퀘스트 종류">
            {QUEST_REPEATS.map((r) => (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={input.repeat === r.key}
                disabled={busy}
                onClick={() => setInput((prev) => ({ ...prev, repeat: r.key }))}
                className={`flex-1 rounded-lg border-2 py-[6px] font-semibold transition ${
                  input.repeat === r.key ? "border-orange-500 bg-orange-500 text-white" : "border-orange-200 bg-white text-orange-700 hover:bg-orange-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="mb-[16px] text-[0.85rem] text-gray-500">
            {input.repeat === "daily"
              ? "매일 밤 12시에 완료 명단이 비워져서 매일 다시 할 수 있어요. (칭호는 줄 수 없어요)"
              : input.repeat === "weekly"
                ? "매주 월요일 밤 12시에 완료 명단이 비워져서 매주 다시 할 수 있어요. (칭호는 줄 수 없어요)"
                : "학생마다 한 번만 완료할 수 있어요."}
          </p>

          <h2 className="font-bold">퀘스트 보상</h2>
          <div className="mb-[8px]">
            <RewardInput label={currency?.name ?? "화폐"} icon={currency?.emoji ?? "🍪"} name="questReward" value={input.questReward} numeric disabled={busy} onChange={onChange} />
            <RewardInput label="경험치" icon="🆙" name="questExp" value={input.questExp} numeric disabled={busy} onChange={onChange} />
            {input.repeat === "none" && (
              <RewardInput label="칭호" icon="🍊" name="questTitle" value={input.questTitle} disabled={busy} onChange={onChange} />
            )}
          </div>

          <button type="submit" disabled={busy} className="btn mt-[16px] w-full border-0 bg-orange-500 text-[1.2rem] text-white disabled:opacity-60">
            {busy ? "처리 중..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="btn mt-[16px] w-full border-0 bg-white text-[1.2rem] text-orange-500 shadow-transparent hover:bg-orange-500 hover:text-white disabled:opacity-60"
          >
            취소
          </button>
        </form>
      )}
    </ModalTemplate>
  );
}

function RewardInput({ label, icon, name, value, numeric = false, disabled, onChange }) {
  const checked = value.trim() !== "";
  return (
    <div className="mb-[8px] flex min-h-[32px] justify-between gap-[16px]">
      <div className="flex items-center">
        <input type="checkbox" checked={checked} readOnly tabIndex={-1} aria-hidden="true" className="checkbox checkbox-warning pointer-events-none mr-[8px]" />
        <span>{label}</span>
      </div>
      <label className="flex">
        <span className="border-b-4 border-orange-400" aria-hidden="true">{icon}</span>
        <input
          name={name}
          value={value}
          aria-label={label}
          placeholder={numeric ? "숫자만 입력" : ""}
          inputMode={numeric ? "numeric" : undefined}
          disabled={disabled}
          onChange={onChange}
          className="w-[160px] border-b-4 border-orange-400 bg-transparent text-right outline-none placeholder:text-center disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </label>
    </div>
  );
}
