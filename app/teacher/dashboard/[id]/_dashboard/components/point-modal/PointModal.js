"use client";

import { useState } from "react";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import DialPad from "./DialPad";
import ReasonInput from "./ReasonInput";
import { PointInputProvider, usePointInputContext } from "./PointInputContext";

// 번호순으로 (번호 없는 학생은 뒤로)
const byNumber = (a, b) => (Number(a.classNumber) || Infinity) - (Number(b.classNumber) || Infinity);

// 받는/잃는 사람: 1명이면 "3번 홍길동", 여러 명이면 "3번 홍길동 외 3명" → 누르면 선택한 학생 전체 명단
function Recipients({ isSend, activeStudentLabels }) {
  const [showRest, setShowRest] = useState(false);
  const who = isSend ? "받는" : "잃는";
  const sorted = [...activeStudentLabels].sort(byNumber);
  const [first, ...rest] = sorted;

  return (
    <div className="relative mb-3 ml-[10px]">
      <h3 className="font-bold text-lg">
        {who} 사람:{" "}
        {first && rest.length === 0 && <span className="text-[1.4rem] ml-[4px] bg-orange-200">{first.label}</span>}
        {first && rest.length > 0 && (
          // "3번 홍길동 외 3명" 전체를 눌러 선택한 학생 전체 명단 보기
          <button
            type="button"
            onClick={() => setShowRest((v) => !v)}
            aria-expanded={showRest}
            className="text-[1.4rem] ml-[4px] bg-orange-200 font-bold text-left cursor-pointer hover:bg-orange-300"
          >
            {first.label} 외 {rest.length}명
          </button>
        )}
      </h3>

      {showRest && rest.length > 0 && (
        // 창 위에 덮어서 보여준다 → 창 높이·키패드 위치는 그대로
        <div className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl bg-white text-gray-800 shadow-xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm">
            <span className="font-semibold">선택한 학생 {sorted.length}명</span>
            <button
              type="button"
              onClick={() => setShowRest(false)}
              aria-label="명단 닫기"
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <ul className="grid max-h-[260px] grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto px-3 py-2 text-sm">
            {sorted.map((s) => (
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

export function PointModalBody({ isSend, currencyName, activeStudentLabels }) {
  const { display } = usePointInputContext();

  return (
    <div
      className={`w-[320px] flex justify-center ${
        isSend ? "bg-green-500" : "bg-red-500"
      } rounded-2xl p-4`}
    >
      <div className="w-[272px]">
        <Recipients isSend={isSend} activeStudentLabels={activeStudentLabels} />

        <ReasonInput isSend={isSend} />

        <div className="h-[64px] bg-gray-200 mb-4 rounded-2xl flex justify-between items-center px-[16px]">
          <div className="text-gray-500">
            {/* "받는 쿠키"처럼 화폐 이름으로 (이름이 없으면 "금액") */}
            {isSend ? "받는" : "잃는"} {currencyName || "금액"}
          </div>
          <div
            style={{ fontSize: display.fontSize + "rem" }}
            className="w-[170px] break-all flex justify-end"
          >
            {display.value ? display.value : 0} {currencyName}
          </div>
        </div>
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
          />
        </PointInputProvider>
      )}
    </ModalTemplate>
  );
}
