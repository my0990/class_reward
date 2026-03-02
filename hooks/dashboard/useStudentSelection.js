import { useMemo, useState } from "react";

export default function useStudentSelection({ studentArr = [], setModalId }) {
  // userId -> money
  const [activeMap, setActiveMap] = useState(() => new Map());
  const [isSend, setIsSend] = useState(null);

  // ✅ [{ userId, money }] 형태로 내보내기
  const activeStudents = useMemo(
    () =>
      Array.from(activeMap.entries()).map(([userId, money]) => ({
        userId,
        money,
      })),
    [activeMap]
  );

  // ✅ 기존 호환이 필요하면 ids도 같이 제공
  const activeIds = useMemo(() => Array.from(activeMap.keys()), [activeMap]);

  const hasSelectedStudent = activeMap.size > 0;
  const isSelectedAll = studentArr.length > 0 && activeMap.size === studentArr.length;

  const toggleStudent = (student) => {
    const userId = String(student.userId);
    const money = Number(student.money ?? 0);

    setActiveMap((prev) => {
      const next = new Map(prev);
      next.has(userId) ? next.delete(userId) : next.set(userId, money);
      return next;
    });
  };

  const selectAll = () => {
    setActiveMap(
      new Map(studentArr.map((s) => [String(s.userId), Number(s.money ?? 0)]))
    );
  };

  const clearAll = () => setActiveMap(new Map());

  const openTransactionModal = (sendMode) => {
    if (!hasSelectedStudent) return alert("학생을 선택해주세요");
    setIsSend(sendMode);
    setModalId("HANDLE_POINT");
  };

  return {
    // ✅ 새로 추가: money 포함 선택 목록
    activeStudents,

    // ✅ 기존 유지(필요하면 계속 사용 가능)
    activeIds,

    // ✅ 내부 구조가 필요하면
    activeMap,

    hasSelectedStudent,
    isSend,
    isSelectedAll,
    toggleStudent,
    selectAll,
    clearAll,
    onSend: () => openTransactionModal(true),
    onTake: () => openTransactionModal(false),
  };
}