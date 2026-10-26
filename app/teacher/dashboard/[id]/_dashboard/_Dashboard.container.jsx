"use client";

import useStudentSelection from "@/hooks/dashboard/useStudentSelection";
import useMarqueeSelect from "@/hooks/dashboard/useMarqueeSelect";
import SeatLayoutView from "./components/SeatLayoutView";
import { useMemo, useCallback, useState, useEffect } from "react";
import { calculateLevel } from "@/util/level/level.utils";
import usePointInput from "@/hooks/dashboard/usePointInput";
import { handlePoint } from "@/server-action/actions/class/handlePoint";
import PointModal from "./components/point-modal/PointModal";
import { toast } from "react-hot-toast";
import { useFetchData } from "@/hooks/useFetchData";
import { useLiveStudents } from "@/hooks/useLiveStudents";
import StudentInfoCard from "./components/StudentInfoCard";


export default function DashboardContainer({ classId }) {
  const [modalId, setModalId] = useState(null);
  const {
    data: classData,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useFetchData(classId ? `/api/classData/${classId}` : null);

  // ✅ 키오스크에서 구매·기부해도 교사 화면 잔액이 따라오도록: 15초마다 작은 버전 값만 확인하고, 바뀌면 다시 불러옴
  const {
    data: studentsData = [],
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    mutate: mutateStudentsData,
  } = useLiveStudents(classId) /* 바뀌었을 때만 다시 불러옴 */;


  const {
    activeIds,             // 선택된 학생 userId 목록 (handleConfirm에서 최신 studentsData 조회에 사용)
    activeStudentLabels,   // ✅ 확인 모달에 보여줄 "1번 홍길동" 형태 라벨
    activeMap,             // ✅ Map(userId -> {money, classNumber, profileNickname})
    toggleStudent,
    selectAll,
    clearAll,
    setSelectedIds,
    onSend,
    onTake,
    isSend,
    isSelectedAll,
    hasSelectedStudent,
  } = useStudentSelection({
    studentArr: studentsData ?? [],
    setModalId,
    classId, // 학급별로 이 탭에 선택 기억
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

  // 보기: 번호순 | 자리 배치 (자리 바꾸기에서 마지막으로 저장한 자리), 방향(앞줄 아래/위) — 이 기기에 기억
  const [layoutMode, setLayoutMode] = useState("number");
  const [seatView, setSeatView] = useState("teacher");
  useEffect(() => {
    try {
      if (localStorage.getItem("kkyul:dashboard-layout") === "seat") setLayoutMode("seat");
      if (localStorage.getItem("kkyul:dashboard-seat-view") === "student") setSeatView("student");
    } catch {}
  }, []);
  const changeLayoutMode = (m) => {
    setLayoutMode(m);
    try {
      localStorage.setItem("kkyul:dashboard-layout", m);
    } catch {}
  };
  const flipSeatView = () =>
    setSeatView((v) => {
      const next = v === "teacher" ? "student" : "teacher";
      try {
        localStorage.setItem("kkyul:dashboard-seat-view", next);
      } catch {}
      return next;
    });
  const { data: seatPlan, isLoading: isSeatLoading } = useFetchData(layoutMode === "seat" && classId ? `/api/seat/${classId}` : null);
  const seatLayout = seatPlan?.current?.layout ?? seatPlan?.layout ?? null;
  const seatAssignment = seatPlan?.current?.assignment ?? null;
  const showSeats = layoutMode === "seat" && seatLayout && seatAssignment;

  // 빈 곳에서 끌어 네모로 묶어 고르기 (원래 선택에 더해짐)
  const marquee = useMarqueeSelect({
    getBase: () => new Set(activeIds),
    onChange: setSelectedIds,
  });

  if (isLoading) return <div>불러오는 중...</div>;
  if (isError) return <div>데이터 로드 실패</div>;

  const currencyName = classData?.currencyName ?? "원"
  const currencyEmoji = classData?.currencyEmoji ?? "💰"
  return (

    <div className="mb-[24px] flex min-h-[calc(100dvh-160px)] flex-col" {...marquee.rootProps}>
      {marquee.boxElement}
      {/* 헤더·버튼 줄·카드·푸터가 같은 폭(.page-width)이라 좌우 끝이 맞는다 */}
      <div className="page-width flex-1">
        <div className="flex flex-wrap gap-2 py-[16px] justify-between">
          <div className="flex items-center gap-[12px]">
            <button
              className="btn bg-orange-500 text-white"
              onClick={handleToggleAll}
              disabled={studentsData.length === 0}
            >
              {isSelectedAll ? '모두 해제' : '모두 선택'}
            </button>
            {/* 기억된 선택이 남아 있는 걸 바로 알 수 있게 */}
            {hasSelectedStudent && !isSelectedAll && (
              <span className="rounded-full bg-orange-100 px-[12px] py-[4px] text-[0.95rem] font-semibold text-orange-800">
                {activeIds.length}명 선택됨
              </span>
            )}
            {isSelectedAll && (
              <span className="rounded-full bg-orange-100 px-[12px] py-[4px] text-[0.95rem] font-semibold text-orange-800">전체 {activeIds.length}명 선택됨</span>
            )}
          </div>

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
        {showSeats ? (
          <SeatLayoutView
            layout={seatLayout}
            assignment={seatAssignment}
            students={studentsData}
            view={seatView}
            isActive={isStudentActive}
            onToggle={toggleStudent}
            currencyEmoji={currencyEmoji}
          />
        ) : (
          <>
            {layoutMode === "seat" && !isSeatLoading && (
              <p className="mb-[12px] rounded-lg bg-orange-50 px-[12px] py-[8px] text-[0.95rem] text-orange-800">
                아직 저장한 자리가 없어요. 도구 → 자리 바꾸기에서 자리를 저장하면 그 자리대로 보여요.
              </p>
            )}
          <div className="grid grid-cols-[repeat(auto-fill,160px)] justify-between gap-x-4 gap-y-6 max-[543px]:justify-center">
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
                  data-select-id={student.userId}
                />
              )
            })}
          </div>
          </>
        )}
      </div>
      {/* 오른쪽 아래(푸터 바로 위): 보기 전환 (번호순 | 자리 배치) + 자리 배치일 때 방향 */}
      <div data-no-marquee className="page-width mt-[32px] flex flex-row-reverse items-center gap-[8px]">
          <div className="inline-flex rounded-full bg-white p-[3px] shadow-md ring-1 ring-black/10" role="tablist" aria-label="학생 카드 보기">
            {[
              ["number", "번호순"],
              ["seat", "자리 배치"],
            ].map(([m, label]) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={layoutMode === m}
                onClick={() => changeLayoutMode(m)}
                className={`rounded-full px-[14px] py-[6px] text-[0.9rem] font-semibold ${
                  layoutMode === m ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {layoutMode === "seat" && showSeats && (
            <button
              type="button"
              onClick={flipSeatView}
              title="앞줄 위치 바꾸기"
              className="rounded-full bg-white px-[14px] py-[8px] text-[0.9rem] font-semibold text-gray-700 shadow-md ring-1 ring-black/10 hover:bg-gray-50"
            >
              앞줄 {seatView === "teacher" ? "아래 ↓" : "위 ↑"}
            </button>
          )}
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