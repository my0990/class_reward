"use client";
// 설정 창: [책상 배치] · [조건] 탭. 바꾼 내용은 페이지가 자동 저장한다.
import { useState } from "react";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import LayoutEditor from "./LayoutEditor";
import RulesEditor from "./RulesEditor";

export const SEAT_SETTINGS_ID = "SEAT_SETTINGS";

const tabs = [
  ["layout", "책상 배치"],
  ["rules", "조건"],
];

export default function SeatSettingsModal({ modalId, setModalId, isNew, layout, setLayout, rules, setRules, students }) {
  const [tab, setTab] = useState("layout"); // 창을 닫았다 열어도 마지막 탭 유지

  return (
    <ModalTemplate id={SEAT_SETTINGS_ID} modalId={modalId} setModalId={setModalId} className="w-[960px] max-w-[95vw] print:hidden">
      {() => (
        <div className="p-5 sm:p-6">
          <div role="tablist" className="tabs tabs-boxed mb-5 inline-flex bg-orange-100">
            {tabs.map(([key, label]) => (
              <button key={key} type="button" role="tab" className={`tab ${tab === key ? "tab-active !bg-orange-500 !text-white" : ""}`} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
          {tab === "layout" ? (
            <LayoutEditor isNew={isNew} layout={layout} setLayout={setLayout} studentCount={students.length} />
          ) : (
            <RulesEditor rules={rules} setRules={setRules} layout={layout} students={students} />
          )}
          <p className="mt-5 text-center text-xs text-gray-400">바꾼 내용은 자동으로 저장됩니다.</p>
        </div>
      )}
    </ModalTemplate>
  );
}
