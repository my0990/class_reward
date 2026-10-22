"use client";

import { useState } from "react";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { summarizeSelection } from "@/util/student/selectionSummary";
import DialPad from "./DialPad";
import { PointInputProvider, usePointInputContext } from "./PointInputContext";

function Recipients({ isSend, activeStudentLabels, totalCount }) {
  const [showNames, setShowNames] = useState(false);
  const who = isSend ? "받는" : "잃는";
  const sum = summarizeSelection(activeStudentLabels, totalCount);

  if (sum.mode === "names") {
    return (
      <h3 className="font-bold text-lg mb-5 ml-[10px]">
        {who} 사람:{" "}
        {activeStudentLabels.map((s, i) => (
          <span className="text-[1.4rem] ml-[4px]" key={s.userId}>
            <span className="bg-orange-200">{s.label}</span>
            {i < activeStudentLabels.length - 1 && ", "}
          </span>
        ))}
      </h3>
    );
  }

  return (
    <div className="relative mb-5 ml-[10px]">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-bold text-lg">
          {who} 사람:{" "}
          <span className="text-[1.4rem] bg-orange-200 px-1">
            {sum.mode === "all" ? `전체 ${sum.count}명` : `${sum.count}명`}
          </span>
        </h3>
        <button
          type="button"
          onClick={() => setShowNames((v) => !v)}
          className="shrink-0 text-sm font-medium underline underline-offset-2"
        >
          {showNames ? "접기" : "이름 보기"}
        </button>
      </div>
      {sum.mode === "numbers" && (sum.numbers || sum.others.length > 0) && (
        <p className="mt-1 line-clamp-2 text-[1.05rem] font-semibold">
          {sum.numbers && `${sum.numbers}번`}
          {sum.numbers && sum.others.length > 0 && ", "}
          {sum.others.join(", ")}
        </p>
      )}
      {showNames && (
        // 창 위에 덮어서 보여준다 → 창 높이·키패드 위치는 그대로
        <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl bg-white text-gray-800 shadow-xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm">
            <span className="font-semibold">선택한 학생 {sum.count}명</span>
            <button type="button" onClick={() => setShowNames(false)} aria-label="이름 목록 닫기" className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <ul className="grid max-h-[260px] grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto px-3 py-2 text-sm">
            {activeStudentLabels.map((s) => (
              <li key={s.userId} className="truncate">
                {s.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PointModalBody({ isSend, currencyName, activeStudentLabels, totalCount }) {
  const { display } = usePointInputContext();
  const count = activeStudentLabels.length;
  const amount = Number(display.value || 0);

  return (
    <div
      className={`w-[320px] flex justify-center dark:bg-gray-400 ${
        isSend ? "bg-green-500" : "bg-red-500"
      } rounded-2xl p-4`}
    >
      <div className="w-[272px]">
        <Recipients isSend={isSend} activeStudentLabels={activeStudentLabels} totalCount={totalCount} />

        <div className={`h-[64px] bg-gray-200 rounded-2xl flex justify-between items-center px-[16px] ${count >= 2 ? "mb-1" : "mb-5"}`}>
          <div className="text-gray-500">
            {count >= 2 ? "1인당" : `${isSend ? "받는" : "잃는"} 금액`}
          </div>
          <div
            style={{ fontSize: display.fontSize + "rem" }}
            className="w-[170px] break-all flex justify-end"
          >
            {display.value ? display.value : 0} {currencyName}
          </div>
        </div>
        {count >= 2 && (
          // 여러 명이면 총액을 같이 보여줘서 큰 금액 실수를 막는다 (높이 고정 → 키패드 위치 그대로)
          <div className="mb-4 h-[20px] pr-[16px] text-right text-sm font-medium">
            {count}명 · 총 {(amount * count).toLocaleString()} {currencyName}
          </div>
        )}

        <DialPad />
      </div>
    </div>
  );
}

export default function PointModal({
  isSend,
  currencyName,
  modalId,
  setModalId,
  display,
  actions,
  activeStudentLabels,
  totalCount,
}) {
  return (
    <ModalTemplate
      id="HANDLE_POINT"
      modalId={modalId}
      setModalId={setModalId}
      onClose={() => actions.clear()}
    >
      {() => (
        <PointInputProvider display={display} actions={actions}>
          <PointModalBody
            isSend={isSend}
            currencyName={currencyName}
            activeStudentLabels={activeStudentLabels}
            totalCount={totalCount}
          />
        </PointInputProvider>
      )}
    </ModalTemplate>
  );
}
