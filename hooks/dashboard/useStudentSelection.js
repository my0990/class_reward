import { useMemo, useState } from "react";

export default function useStudentSelection({ studentArr = [], setModalId }) {
  // userId -> { money, classNumber, profileNickname } (표시용 정보까지 같이 들고 있는다)
  const [activeMap, setActiveMap] = useState(() => new Map());
  const [isSend, setIsSend] = useState(null);

  const toInfo = (student) => ({
    money: Number(student.money ?? 0),
    classNumber: student.classNumber,
    profileNickname: student.profileNickname,
  });

  // ✅ [{ userId, money }] 형태로 내보내기 (서버 호출용)
  const activeStudents = useMemo(
    () =>
      Array.from(activeMap.entries()).map(([userId, info]) => ({
        userId,
        money: info.money,
      })),
    [activeMap]
  );

  // ✅ 기존 호환이 필요하면 ids도 같이 제공
  const activeIds = useMemo(() => Array.from(activeMap.keys()), [activeMap]);

  // ✅ 표시용: userId가 아니라 "1번 홍길동" 같은 사람이 알아볼 수 있는 라벨
  const activeStudentLabels = useMemo(
    () =>
      Array.from(activeMap.entries()).map(([userId, info]) => {
        const nickname = info.profileNickname || userId;
        const label =
          info.classNumber != null ? `${info.classNumber}번 ${nickname}` : nickname;
        return { userId, label };
      }),
    [activeMap]
  );

  const hasSelectedStudent = activeMap.size > 0;
  const isSelectedAll = studentArr.length > 0 && activeMap.size === studentArr.length;

  const toggleStudent = (student) => {
    const userId = String(student.userId);

    setActiveMap((prev) => {
      const next = new Map(prev);
      next.has(userId) ? next.delete(userId) : next.set(userId, toInfo(student));
      return next;
    });
  };

  const selectAll = () => {
    setActiveMap(new Map(studentArr.map((s) => [String(s.userId), toInfo(s)])));
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

    // ✅ 확인 모달에 사람이 알아볼 수 있는 이름으로 보여주기 위한 라벨
    activeStudentLabels,

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
