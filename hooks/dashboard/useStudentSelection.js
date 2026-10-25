import { useEffect, useMemo, useRef, useState } from "react";

// 고른 학생은 이 탭(sessionStorage)에 학급별로 기억한다:
// 다른 메뉴에 갔다 오거나 새로고침해도 그대로, 탭·브라우저를 닫으면 지워진다 (다음 날 남아 있지 않게)
const storageKey = (classId) => `kkyul:dashboard-selected:${classId}`;

function readSaved(classId) {
  try {
    const ids = JSON.parse(sessionStorage.getItem(storageKey(classId)) || "[]");
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

function writeSaved(classId, ids) {
  try {
    if (ids.length) sessionStorage.setItem(storageKey(classId), JSON.stringify(ids));
    else sessionStorage.removeItem(storageKey(classId));
  } catch {}
}

const toInfo = (student) => ({
  money: Number(student.money ?? 0),
  classNumber: student.classNumber,
  profileNickname: student.profileNickname,
});

export default function useStudentSelection({ studentArr = [], setModalId, classId }) {
  // userId -> { money, classNumber, profileNickname } (표시용 정보까지 같이 들고 있는다)
  const [activeMap, setActiveMap] = useState(() => new Map());
  const [isSend, setIsSend] = useState(null);
  const restoredFor = useRef(null); // 어느 학급의 기억을 불러왔는지
  const [savedClass, setSavedClass] = useState(null); // 불러온 '다음 화면'부터 저장 (같은 순간에 저장하면 빈 값으로 덮어씀)

  // 학생 목록이 오면 이 학급에서 고르던 학생을 되살린다 (그사이 지워진 학생은 빠짐)
  // 목록이 바뀌면(학생 삭제 등) 없는 학생은 선택에서 빼고, 표시 정보는 최신으로
  useEffect(() => {
    if (!classId || studentArr.length === 0) return;
    const byId = new Map(studentArr.map((s) => [String(s.userId), s]));
    if (restoredFor.current !== classId) {
      restoredFor.current = classId;
      const ids = readSaved(classId).filter((id) => byId.has(id));
      setActiveMap(new Map(ids.map((id) => [id, toInfo(byId.get(id))])));
      setSavedClass(classId);
      return;
    }
    setActiveMap((prev) => {
      let changed = false;
      const next = new Map();
      for (const id of prev.keys()) {
        if (byId.has(id)) next.set(id, toInfo(byId.get(id)));
        else changed = true;
      }
      return changed || next.size !== prev.size ? next : prev;
    });
  }, [classId, studentArr]);

  // 고른 학생이 바뀌면 저장 (되살리기 전에는 저장하지 않음: 빈 값으로 덮어쓰지 않게)
  useEffect(() => {
    if (!classId || savedClass !== classId) return;
    writeSaved(classId, Array.from(activeMap.keys()));
  }, [classId, savedClass, activeMap]);

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
        return { userId, label, classNumber: info.classNumber };
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
