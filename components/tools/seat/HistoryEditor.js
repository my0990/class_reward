"use client";
// 기록: 저장한 자리 배치 (지금 자리 + 지난 자리 최근 5번). 하나씩 지울 수 있다.
// 기록마다 저장할 때의 책상 배치를 함께 보여 준다 (예전 기록엔 없어서 지금 배치로 보여 줌).
import { useState } from "react";
import { PrinterIcon } from "@heroicons/react/24/outline";
import SeatGrid from "./SeatGrid";

const fmt = (d) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

export default function HistoryEditor({ plan, layout, studentsById, onDelete, onPrint, busy }) {
  const [asking, setAsking] = useState(null); // 삭제를 한 번 누른 기록 (한 번 더 눌러야 지움)
  const records = [
    ...(plan?.current ? [{ ...plan.current, isCurrent: true }] : []),
    ...(plan?.history ?? []),
  ];

  if (records.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">아직 저장한 자리가 없어요. 자리를 섞은 뒤 오른쪽 위 저장 버튼을 눌러 보세요.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">최근 저장한 자리부터 보여 줘요 (지금 자리 + 지난 자리 5번까지).</p>
      {records.map((r) => {
        const at = new Date(r.confirmedAt).toISOString();
        const confirming = asking === at;
        return (
          <section key={at} className="rounded-2xl border border-orange-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="font-bold">{fmt(r.confirmedAt)}</h3>
              {r.isCurrent && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">지금 자리</span>}
              <div className="ml-auto flex items-center gap-2">
                {/* 이 기록을 인쇄 (미리보기 창으로) */}
                {onPrint && !confirming && (
                  <button
                    type="button"
                    className="btn btn-xs border-0 bg-orange-100 text-orange-700 hover:bg-orange-200"
                    onClick={() => onPrint({ layout: r.layout ?? layout, assignment: r.assignment ?? {}, label: fmt(r.confirmedAt) })}
                  >
                    <PrinterIcon className="h-4 w-4" />
                    인쇄
                  </button>
                )}
                {confirming && <span className="text-xs text-red-500">{r.isCurrent ? "지우면 바로 전 기록이 지금 자리가 돼요." : "정말 지울까요?"}</span>}
                {confirming && (
                  <button type="button" className="btn btn-xs border-0 bg-gray-100 text-gray-600" onClick={() => setAsking(null)}>
                    취소
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  className={`btn btn-xs border-0 ${confirming ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 text-gray-500 hover:text-red-500"}`}
                  onClick={async () => {
                    if (!confirming) return setAsking(at);
                    await onDelete(at);
                    setAsking(null);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
            <div className="flex h-[240px] w-full justify-center [container-type:size]">
              <SeatGrid layout={r.layout ?? layout} assignment={r.assignment ?? {}} students={studentsById} size="fit" />
            </div>
          </section>
        );
      })}
    </div>
  );
}
