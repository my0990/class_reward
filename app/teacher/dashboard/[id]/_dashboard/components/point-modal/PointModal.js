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
    <div className="mb-5 ml-[10px]">
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
        // 높이를 정해 두고 안에서 스크롤 → 키패드가 밀려나지 않게
        <ul className="mt-2 max-h-[96px] overflow-y-auto rounded-xl bg-white/60 px-3 py-2 text-sm">
          {activeStudentLabels.map((s) => (
            <li key={s.userId}>{s.label}</li>
          ))}
        </ul>
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
