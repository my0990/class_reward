"use client";
// 설정 창: [책상 배치] · [학생] · [조건] · [그룹] 탭. 바꾼 내용은 페이지가 자동 저장한다.
import { useState } from "react";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import LayoutEditor from "./LayoutEditor";
import RulesEditor from "./RulesEditor";
import GroupEditor from "./GroupEditor";
import StudentsEditor from "./StudentsEditor";

export const SEAT_SETTINGS_ID = "SEAT_SETTINGS";

const tabs = [
  ["layout", "책상 배치"],
  ["students", "학생"],
  ["rules", "조건"],
  ["groups", "그룹"],
];

export default function SeatSettingsModal({ modalId, setModalId, isNew, layout, setLayout, rules, setRules, students }) {
  const [tab, setTab] = useState("layout"); // 창을 닫았다 열어도 마지막 탭 유지
  const byId = Object.fromEntries(students.map((s) => [s.userId, s]));
  const name = (u) => (byId[u] ? `${byId[u].classNumber}. ${byId[u].profileNickname}` : u);

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
          {/* 탭 내용 높이 고정 (탭을 바꿔도 창 크기가 그대로, 넘치면 이 안에서 스크롤) */}
          <div className="h-[min(640px,65vh)] overflow-y-auto overscroll-contain pr-1">
          {tab === "layout" && <LayoutEditor isNew={isNew} layout={layout} setLayout={setLayout} studentCount={students.length - (rules.excluded?.length ?? 0)} />}
          {tab === "students" && (
            <StudentsEditor students={students} excluded={rules.excluded ?? []} setExcluded={(excluded) => setRules({ ...rules, excluded })} />
          )}
          {tab === "rules" && <RulesEditor rules={rules} setRules={setRules} students={students} />}
          {tab === "groups" && (
            <div>
              <p className="mb-3 text-sm text-gray-500">
                그룹을 만들고 학생을 넣은 뒤, 그 그룹 학생이 앉을 수 있는 자리를 고르세요. 한 학생이 여러 그룹에 들어가면 모든 그룹 자리가 겹치는 곳에만 앉습니다.
              </p>
              <GroupEditor groups={rules.groups ?? []} setGroups={(groups) => setRules({ ...rules, groups })} layout={layout} students={students} name={name} />
            </div>
          )}
          </div>
          <p className="mt-5 text-center text-xs text-gray-400">바꾼 내용은 자동으로 저장됩니다.</p>
        </div>
      )}
    </ModalTemplate>
  );
}
