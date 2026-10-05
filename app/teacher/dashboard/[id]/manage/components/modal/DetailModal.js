import { useState, useMemo, useEffect } from "react";
import { mutate } from "swr";
import CardTemplate from "../card/CardTemplate";
import { useFetchData } from "@/hooks/useFetchData";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { useManageContext } from "../ManageContext";
import { HISTORY_KINDS, getHistoryKind, isDepositType } from "../../utils/historyKind";

// app/api/fetchHistory의 기본값/최대값과 맞춘다
const HISTORY_PAGE_SIZE = 50;
const HISTORY_PAGE_MAX = 500;

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
}

function getAmountText(type, amount) {
  if (!amount) return null;
  return `${isDepositType(type) ? "+" : "-"}${amount}`;
}

export default function DetailModal() {
  const { picked, startExp, commonDifference, modalId, setModalId } = useManageContext();
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
    >
      {() => (
        <div className="flex max-w-[850px] flex-wrap justify-between p-6 max-[870px]:max-w-[400px]">
          <div className="mr-5 flex max-w-[352px] justify-center rounded-xl bg-green-400 p-[8px]">
            <CardTemplate
              picked={picked}
              startExp={startExp}
              commonDifference={commonDifference}
            />
          </div>

          <div className="h-[500px] w-[400px] overflow-auto">
            <div className="mb-[16px] flex items-center justify-between">
              <h1 className="ml-6 text-[1.8rem] font-bold">
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
                className="mr-[16px] cursor-pointer transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="32px"
                  height="32px"
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
              <table className="table">
                <thead>
                  <tr className="text-center">
                    <th>내용</th>
                    <th>돈</th>
                    <th>잔액</th>
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
                      <td className="text-left">
                        <span className={`mr-[6px] inline-block whitespace-nowrap rounded-full px-[6px] py-[1px] text-[0.7rem] ${kind.badge}`}>
                          {kind.icon} {kind.label}
                        </span>
                        {item?.name}
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
                      <td>{item.balance}</td>
                      <td>{formatDate(item.date)}</td>
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
          </div>
        </div>
      )}
    </ModalTemplate>
  );
}
