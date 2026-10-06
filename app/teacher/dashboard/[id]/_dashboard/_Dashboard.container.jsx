"use client";

import useStudentSelection from "@/hooks/dashboard/useStudentSelection";
import { useMemo, useCallback, useState } from "react";
import { calculateLevel } from "@/util/level/level.utils";
import usePointInput from "@/hooks/dashboard/usePointInput";
import { handlePoint } from "@/server-action/actions/class/handlePoint";
import PointModal from "./components/point-modal/PointModal";
import { toast } from "react-hot-toast";
import { useFetchData, LIVE_REFRESH } from "@/hooks/useFetchData";
import StudentInfoCard from "./components/StudentInfoCard";


export default function DashboardContainer({ classId }) {
  const [modalId, setModalId] = useState(null);
  const {
    data: classData,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useFetchData(classId ? `/api/classData/${classId}` : null);

  // ✅ 키오스크에서 구매·기부해도 교사 화면 잔액이 따라오도록 15초마다 + 포커스 복귀 시 새로고침
  const {
    data: studentsData = [],
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    mutate: mutateStudentsData,
  } = useFetchData(classId ? `/api/students/${classId}` : null, LIVE_REFRESH);


  const {
    activeIds,             // 선택된 학생 userId 목록 (handleConfirm에서 최신 studentsData 조회에 사용)
    activeStudentLabels,   // ✅ 확인 모달에 보여줄 "1번 홍길동" 형태 라벨
    activeMap,             // ✅ Map(userId -> {money, classNumber, profileNickname})
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

  // ✅ point-modal 트리(PointModal/DialPad)는 이제 성공/실패 이후에 뭘 할지 몰라도 된다.
  // 상태(선택된 학생, 모달, 목록)를 소유한 이 컨테이너가 성공/실패 처리를 전부 책임진다.
  // - 실패(검증 실패 포함): throw -> DialPad가 잡아서 에러 토스트 표시, 입력값은 보존됨
  // - 성공: 선택 해제 + 모달 닫기 + 목록 갱신 + 성공 토스트. 입력값은 usePointInput이 자동으로 비움
  const handleConfirm = useCallback(
    async (value) => {
      if (!value) throw new Error("숫자를 입력해주세요");
      if (!hasSelectedStudent) throw new Error("학생을 선택해주세요");

      // ✅ 선택 시점 스냅샷(activeStudents) 대신, 지금 화면이 갖고 있는 최신 studentsData에서
      // money를 다시 조회해서 보낸다. 선택 이후 다른 탭/키오스크에서 잔액이 바뀌었더라도
      // 서버에 기록되는 history balance가 그만큼 덜 어긋난다.
      const studentById = new Map(studentsData.map((s) => [String(s.userId), s]));
      const targetStudent = activeIds
        .map((userId) => studentById.get(userId))
        .filter(Boolean)
        .map((s) => ({ userId: s.userId, money: s.money }));

      if (targetStudent.length === 0) {
        throw new Error("선택한 학생 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.");
      }

      const res = await handlePoint({
        classId,
        targetStudent,
        point: value,
        isSend,
      });

      if (!res?.result) {
        throw new Error(res?.message ?? "오류 발생");
      }

      clearAll();
      setModalId(null);
      mutateStudentsData();
      toast.success("완료");
    },
    [activeIds, studentsData, hasSelectedStudent, isSend, classId, clearAll, mutateStudentsData]
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

    <div className="mb-[48px]">
      {/* 헤더·버튼 줄·카드·푸터가 같은 폭(.page-width)이라 좌우 끝이 맞는다 */}
      <div className="page-width">
        <div className="flex flex-wrap gap-2 py-[16px] justify-between">
          <button
            className="btn bg-orange-500 text-white"
            onClick={handleToggleAll}
            disabled={studentsData.length === 0}
          >
            {isSelectedAll ? '모두 해제' : '모두 선택'}
          </button>

          <div>
            <button
              className="btn btn-success text-white mr-[8px]"
              onClick={onSend}
              disabled={!hasSelectedStudent}
            >
              {currencyName} 보내기
            </button>

            <button
              className="btn bg-red-500 text-white"
              onClick={onTake}
              disabled={!hasSelectedStudent}
            >
              {currencyName} 빼앗기
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,160px)] justify-between gap-4 max-[543px]:justify-center">
          {studentsData.map((student) => {
            const level = levelMap?.[student.userId] ?? 1
            return (
              <StudentInfoCard
                key={student.userId}
                data={student}
                level={level}
                currencyemoji={currencyEmoji}
                isActive={isStudentActive(student)}
                onClick={() => toggleStudent(student)}
              />
            )
          })}
        </div>
      </div>
      <PointModal
        isSend={isSend}
        currencyName={currencyName}
        activeStudentLabels={activeStudentLabels}
        modalId={modalId}
        setModalId={setModalId}
        display={display}
        actions={actions}
      />
    </div>
  );
}