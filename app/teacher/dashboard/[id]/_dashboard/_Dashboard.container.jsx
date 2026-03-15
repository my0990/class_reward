"use client";

import useStudentSelection from "@/hooks/dashboard/useStudentSelection";
import { useMemo, useCallback, useState } from "react";
import { calculateLevel } from "@/util/level/level.utils";
import usePointInput from "@/hooks/dashboard/usePointInput";
import { handlePoint } from "@/server-action/actions/class/handlePoint";
import DashboardBtns from "./section/DashboardBtns";
import StudentCardGrid from "./section/StudentCardGrid";
import PointModal from "./widget/PointModal";
import { toast, Toaster } from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";

export default function DashboardContainer({ classId }) {
  const [modalId, setModalId] = useState(null);
  const {
    data: classData,
    isLoading: isClassLoading,
    isError: isClassError,
    error: classError,
    mutate: mutateClassData,
  } = useFetchData(classId ? `/api/classData/${classId}` : null);

  const {
    data: studentsData = [],
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    error: studentsError,
    mutate: mutateStudentsData,
  } = useFetchData(classId ? `/api/students/${classId}` : null);





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

      // mutate(`/api/students/${classId}`);
      results.studentsData.mutate();
    },
    [activeStudents, hasSelectedStudent, isSend, classId, clearAll]
  );

  const { display, actions } = usePointInput({
    onEnter: handleConfirm,
  });



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
  const handleToggleAll = useCallback(() => {
    isSelectedAll ? clearAll() : selectAll();
  }, [isSelectedAll, clearAll, selectAll]);

  const isLoading =
    isClassLoading || isStudentsLoading 

  const isError =
    isClassError || isStudentsError 

  if (isLoading) return <div>불러오는 중...</div>;
  if (isError) return <div>데이터 로드 실패</div>;
  const currencyName = classData?.currencyName ?? "원"
  const currencyEmoji = classData?.currencyEmoji ?? "💰"
  return (

    <div className="pt-0 flex justify-center mb-[48px]">
      <div className="w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">
        <DashboardBtns {...{ handleToggleAll, studentsData, isSelectedAll, onSend, hasSelectedStudent, onTake, currencyName }} />
        <StudentCardGrid {...{ studentsData, currencyEmoji, isStudentActive, toggleStudent, levelMap }} />
      </div>
      <PointModal id="HANDLE_POINT" toast={toast} clearAll={clearAll} isSend={isSend} handleClose={handleClose} activeIds={activeIds} modalId={modalId} setModalId={setModalId} display={display} actions={actions} />
      <Toaster position="bottom-right" />
    </div>
  );
}