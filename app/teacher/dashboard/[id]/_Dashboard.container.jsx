"use client";

import { fetchData } from "@/hooks/swrHooks";
import DashboardView from "./_component/Dashboard.view";
import useStudentSelection from "@/hooks/dashboard/useStudentSelection";
import { useMemo, useCallback, useState } from "react";
import { calculateLevel } from "@/util/level/level.utils";
import usePointInput from "@/hooks/dashboard/usePointInput";
import { handlePoint } from "@/server-action/actions/class/handlePoint";
import { mutate } from "swr";

export default function DashboardContainer({ classId }) {
  const [modalId, setModalId] = useState(null);

  const {
    data: classData,
    isLoading: isClassDataLoading,
    isError: isClassDataError,
  } = fetchData(`/api/classData/${classId}`);

  const {
    data: studentsData,
    isLoading: isStudentsDataLoading,
    isError: isStudentsDataError,
  } = fetchData(`/api/students/${classId}`);

  const {
    data: userData,
    isLoading: isUserDataLoading,
    isError: isUserDataError,
  } = fetchData(`/api/user`);

  // ✅ 변경: activeIdSet -> activeMap, activeStudents 추가
  const {
    activeIds,          // (선택) id만 필요하면 계속 사용 가능
    activeStudents,     // ✅ [{userId, money}] 사용
    activeMap,          // ✅ Map(userId -> money)
    toggleStudent,
    selectAll,
    clearAll,
    onSend,
    onTake,
    isSend,
    isSelectedAll,
    hasSelectedStudent,
  } = useStudentSelection({
    studentArr: studentsData ?? [],
    setModalId,
  });

  const handleConfirm = useCallback(
    async (value) => {
      if (!value) throw new Error("숫자를 입력해주세요")
      if (!hasSelectedStudent) throw new Error("학생을 선택해주세요") 

      // ✅ 변경: userId + money 같이 보냄
      // (서버에서 before/after 기록하거나 검증할 때 유용)
      const targetStudent = activeStudents.map((s) => ({
        userId: s.userId,
        money: s.money,
      }));

      const res = await handlePoint({
        classId,
        targetStudent,
        point: value,
        isSend,
      });

      if (!res?.success) {
        alert(res?.message ?? "오류 발생");
        return;
      }

      // ✅ 성공 후: 선택 해제 + 입력 초기화 + 모달 닫기(원하면)
      clearAll();
      // actions.clear는 아래 훅 선언 이후라 여기선 직접 못 씀 (원하면 구조 바꿔줄게)
      setModalId(null);

      mutate(`/api/students/${classId}`);
    },
    [activeStudents, hasSelectedStudent, isSend, classId, clearAll]
  );

  const { display, actions } = usePointInput({
    onEnter: handleConfirm,
  });

  const isLoading =
    isClassDataLoading || isStudentsDataLoading || isUserDataLoading;

  const isError = isClassDataError || isStudentsDataError || isUserDataError;

  // ✅ 변경: activeMap.has 로 체크
  const isStudentActive = useCallback(
    (student) => activeMap.has(String(student.userId)),
    [activeMap]
  );

  const expTable = classData?.expTable ?? { startExp: 100, commonDifference: 10 };
  const levelMap = useMemo(() => {
    const list = studentsData ?? [];
    const map = Object.create(null);

    for (const s of list) {
      const id = String(s.userId);
      map[id] = calculateLevel({
        exp: s.exp,
        startExp: expTable.startExp,
        commonDifference: expTable.commonDifference,
      });
    }
    return map;
  }, [studentsData, expTable.startExp, expTable.commonDifference]);

  const handleClose = useCallback(
    (close) => {
      actions.clear?.();
      close();
    },
    [actions]
  );

  if (isLoading) return <div>불러오는 중...</div>;
  if (isError) return <div>데이터 로드 실패</div>;

  return (
    <DashboardView
      studentData={studentsData}
      hasSelectedStudent={hasSelectedStudent}
      levelMap={levelMap}

      // ✅ 유지/추가 전달
      activeIds={activeIds}                 // (기존 호환용)
      activeStudents={activeStudents}       // ✅ 새로 추가(필요하면 View에서 사용)
      activeMap={activeMap}                 // ✅ 기존 activeIdSet 대체

      toggleStudent={toggleStudent}
      selectAll={selectAll}
      clearAll={clearAll}
      onSend={onSend}
      onTake={onTake}
      isStudentActive={isStudentActive}
      isSend={isSend}
      isSelectedAll={isSelectedAll}
      currencyName={classData?.currencyName ?? "원"}
      currencyEmoji={classData?.currencyEmoji ?? "💰"}
      modalId={modalId}
      setModalId={setModalId}
      display={display}
      actions={actions}
      handleClose={handleClose}
    />
  );
}