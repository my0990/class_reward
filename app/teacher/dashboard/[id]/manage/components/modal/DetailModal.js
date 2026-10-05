import { useState, useMemo, useEffect, useRef } from "react";
import { mutate } from "swr";
import CardTemplate from "../card/CardTemplate";
import { useFetchData } from "@/hooks/useFetchData";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { useManageContext } from "../ManageContext";
import { HISTORY_KINDS, getHistoryKind, isDepositType } from "../../utils/historyKind";
import { formatHistoryDateParts, formatFullDate } from "../../utils/historyDate";

// app/api/fetchHistory의 기본값/최대값과 맞춘다
const HISTORY_PAGE_SIZE = 50;
const HISTORY_PAGE_MAX = 500;

function getAmountText(type, amount) {
  if (!amount) return null;
  return `${isDepositType(type) ? "+" : "-"}${amount}`;
}

export default function DetailModal() {
  const { picked, startExp, commonDifference, modalId, setModalId, studentsData, onDetailClick } = useManageContext();
  const [rotation, setRotation] = useState(0);

  const userId = picked?.userId;
  const isOpen = modalId === "DETAIL_ACCOUNT";
  // 거래 내역은 최근 50건씩 불러오고 "더 보기"를 누르면 50건씩 늘린다.
  const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE_SIZE);
  useEffect(() => {
    setHistoryLimit(HISTORY_PAGE_SIZE); // 다른 학생을 열면 처음부터
  }, [userId]);

  const historyKey = isOpen && userId ? `/api/fetchHistory/${userId}?limit=${historyLimit}` : null;

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isValidating: isHistoryValidating,
    isError: isHistoryError,
  } = useFetchData(historyKey, { keepPreviousData: true });

  const hasMoreHistory = (historyData?.length ?? 0) >= historyLimit && historyLimit < HISTORY_PAGE_MAX;

  const rows = useMemo(() => historyData ?? [], [historyData]);

  // 좁은 화면(900px 이하): 프로필 / 사용 기록을 옆으로 넘기는 두 장짜리 화면
  const sliderRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const SLIDES = [
    { key: "profile", label: "🙂 프로필" },
    { key: "history", label: "📜 사용 기록" },
  ];

  const goToSlide = (index, behavior = "smooth") => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior });
    setSlide(index);
  };

  const onSliderScroll = () => {
    const el = sliderRef.current;
    if (!el || !el.clientWidth) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== slide) setSlide(index);
  };

  // 목록에서 학생을 열면 항상 프로필부터 (창 안에서 이전/다음으로 넘길 때는 보던 장을 유지)
  useEffect(() => {
    if (!isOpen) return;
    setSlide(0);
    sliderRef.current?.scrollTo({ left: 0 });
  }, [isOpen]);

  // 이전/다음 학생 (학생 관리 목록과 같은 번호순)
  const historyRef = useRef(null);
  const students = studentsData ?? [];
  const currentIndex = students.findIndex((s) => s.userId === userId);
  const prevStudent = currentIndex > 0 ? students[currentIndex - 1] : null;
  const nextStudent = currentIndex >= 0 && currentIndex < students.length - 1 ? students[currentIndex + 1] : null;
  const goToStudent = (student) => {
    if (student) onDetailClick(student);
  };

  // 학생이 바뀌면 사용 기록 스크롤을 맨 위로
  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = 0;
  }, [userId]);

  // PC 키보드 ← →로 이전/다음 학생
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft" && prevStudent) {
        e.preventDefault();
        goToStudent(prevStudent);
      } else if (e.key === "ArrowRight" && nextStudent) {
        e.preventDefault();
        goToStudent(nextStudent);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onRefresh = () => {
    if (!historyKey) return;

    setRotation((prev) => prev + 360);
    mutate(historyKey);
  };

  return (
    <ModalTemplate
      id="DETAIL_ACCOUNT"
      modalId={modalId}
      setModalId={setModalId}
      className="max-[900px]:w-full max-[900px]:max-w-[520px]"
    >
      {() => (
        <div className="p-6 max-[480px]:p-3">
          {/* 탭 (좁은 화면에서만) */}
          <div className="mb-[12px] hidden gap-[6px] rounded-full bg-orange-100 p-[4px] max-[900px]:flex" role="tablist">
            {SLIDES.map((t, i) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={slide === i}
                onClick={() => goToSlide(i)}
                className={`flex-1 rounded-full py-[6px] text-[0.95rem] font-bold transition ${
                  slide === i ? "bg-white text-orange-500 shadow" : "text-orange-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* PC: 나란히 / 좁은 화면: 옆으로 넘기기 (scroll-snap) */}
          <div
            ref={sliderRef}
            onScroll={onSliderScroll}
            className="
              flex gap-5
              max-[900px]:snap-x max-[900px]:snap-mandatory max-[900px]:gap-0
              max-[900px]:overflow-x-auto max-[900px]:overscroll-x-contain
              max-[900px]:[scrollbar-width:none] max-[900px]:[&::-webkit-scrollbar]:hidden
            "
          >
          <section className="flex shrink-0 justify-center max-[900px]:w-full max-[900px]:snap-start max-[900px]:snap-always" aria-label="프로필">
          <div className="flex w-full max-w-[352px] justify-center rounded-xl bg-green-400 p-[8px]">
            <CardTemplate
              picked={picked}
              startExp={startExp}
              commonDifference={commonDifference}
            />
          </div>
          </section>

          <section
            ref={historyRef}
            aria-label="화폐 및 아이템 사용 기록"
            className="h-[500px] w-[460px] shrink-0 overflow-y-auto max-[900px]:h-[min(500px,70dvh)] max-[900px]:w-full max-[900px]:snap-start max-[900px]:snap-always"
          >
            {/* 새로고침은 제목 바로 옆에 */}
            <div className="mb-[16px] flex items-center gap-[8px] pr-[12px]">
              <h1 className="ml-[8px] text-[1.5rem] font-bold sm:text-[1.8rem]">
                화폐 및 아이템 사용 기록
              </h1>

              <button
                type="button"
                onClick={onRefresh}
                disabled={!historyKey}
                aria-label="사용 기록 새로고침"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: "transform 0.5s ease-in-out",
                }}
                className="shrink-0 cursor-pointer transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="26px"
                  height="26px"
                  viewBox="0 0 21 21"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                >
                  <g fill="none" fillRule="evenodd" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" transform="matrix(0 1 1 0 2.5 2.5)">
                    <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8" />
                    <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)" />
                  </g>
                </svg>
              </button>
            </div>

            {isHistoryLoading && !historyData ? (
              <div className="py-10 text-center">불러오는 중...</div>
            ) : isHistoryError ? (
              <div className="py-10 text-center text-red-500">
                데이터 로드 실패
              </div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                사용 기록이 없습니다.
              </div>
            ) : (
              <>
              {/* 색 안내 */}
              <div className="mb-[8px] flex flex-wrap gap-[6px] px-[8px] text-[0.75rem]">
                {["grant", "quest", "buy", "use", "donate", "take"].map((k) => (
                  <span key={k} className={`rounded-full px-[8px] py-[2px] ${HISTORY_KINDS[k].badge}`}>
                    {HISTORY_KINDS[k].icon} {HISTORY_KINDS[k].label}
                  </span>
                ))}
              </div>
              <table className="table table-sm w-full">
                <thead>
                  <tr className="text-center">
                    <th>종류</th>
                    <th>내용</th>
                    <th>돈</th>
                    <th className="max-[480px]:hidden">잔액</th>
                    <th>날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, index) => {
                    const kind = HISTORY_KINDS[getHistoryKind(item)];
                    return (
                    <tr
                      key={item._id ?? `${item.date}-${item.type}-${index}`}
                      className={`border-none text-center ${kind.row}`}
                    >
                      <td>
                        <span className={`inline-block whitespace-nowrap rounded-full px-[8px] py-[2px] text-[0.75rem] ${kind.badge}`}>
                          {kind.icon} {kind.label}
                        </span>
                      </td>
                      {/* 긴 내용은 ...으로 줄이고, 마우스를 올리면 전체 내용 */}
                      <td className="max-w-[170px] max-[480px]:max-w-[110px]">
                        <div className="truncate" title={item?.name}>
                          {item?.name}
                        </div>
                      </td>
                      <td>
                        <span
                          className={
                            isDepositType(item?.type)
                              ? "font-semibold text-emerald-600"
                              : "font-semibold text-rose-500"
                          }
                        >
                          {getAmountText(item.type, item.amount)}
                        </span>
                      </td>
                      <td className="max-[480px]:hidden">{item.balance}</td>
                      <td className="text-[0.8rem] leading-tight text-gray-500" title={formatFullDate(item.date)}>
                        {(() => {
                          const { day, time } = formatHistoryDateParts(item.date);
                          return (
                            <>
                              <div className="whitespace-nowrap">{day}</div>
                              {time && <div className="whitespace-nowrap text-gray-400">{time}</div>}
                            </>
                          );
                        })()}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              </>
            )}

            {hasMoreHistory && (
              <div className="py-4 text-center">
                <button
                  type="button"
                  onClick={() => setHistoryLimit((n) => Math.min(n + HISTORY_PAGE_SIZE, HISTORY_PAGE_MAX))}
                  disabled={isHistoryValidating}
                  className="btn btn-sm bg-orange-300"
                >
                  {isHistoryValidating ? "불러오는 중..." : "더 보기"}
                </button>
              </div>
            )}
          </section>
          </div>

          {/* 몇 번째 장인지 (좁은 화면에서만) */}
          <div className="mt-[12px] hidden justify-center gap-[8px] max-[900px]:flex">
            {SLIDES.map((t, i) => (
              <button
                key={t.key}
                type="button"
                aria-label={`${t.label}로 이동`}
                onClick={() => goToSlide(i)}
                className={`h-[8px] rounded-full transition-all ${slide === i ? "w-[22px] bg-orange-400" : "w-[8px] bg-orange-200"}`}
              />
            ))}
          </div>

          {/* 이전 / 다음 학생 */}
          {students.length > 1 && currentIndex >= 0 && (
            <nav className="mt-[14px] flex items-center justify-between gap-[8px] border-t border-orange-100 pt-[12px]" aria-label="다른 학생 보기">
              <StudentNavButton direction="prev" student={prevStudent} onClick={() => goToStudent(prevStudent)} />
              <span className="shrink-0 text-[0.85rem] font-semibold text-gray-400">
                {currentIndex + 1} / {students.length}
              </span>
              <StudentNavButton direction="next" student={nextStudent} onClick={() => goToStudent(nextStudent)} />
            </nav>
          )}
        </div>
      )}
    </ModalTemplate>
  );
}

// 이전/다음 학생 버튼: 옆 학생의 번호·별명을 미리 보여준다. 끝이면 흐리게.
function StudentNavButton({ direction, student, onClick }) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!student}
      aria-label={isPrev ? "이전 학생" : "다음 학생"}
      className={`
        flex min-w-0 max-w-[45%] items-center gap-[6px] rounded-full px-[12px] py-[8px]
        text-[0.9rem] font-semibold text-orange-500 transition
        hover:bg-orange-50 active:scale-95
        disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:active:scale-100
        ${isPrev ? "" : "flex-row-reverse text-right"}
      `}
    >
      <span className="shrink-0 text-[1.2rem] leading-none">{isPrev ? "‹" : "›"}</span>
      <span className="truncate">
        {student ? `${student.classNumber ?? ""}번 ${student.profileNickname ?? student.userId}` : isPrev ? "처음" : "마지막"}
      </span>
    </button>
  );
}
