"use client";
// 인쇄 미리보기 창: 인쇄될 자리표를 보여 주고, 방향(180도 회전: 칠판 위/아래)을 고른 뒤 인쇄
// 실제 인쇄(화면 자리표 방향 바꾸기 → window.print)는 페이지가 onPrint에서 한다.
import { ArrowPathIcon, PrinterIcon } from "@heroicons/react/24/outline";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import SeatGrid from "./SeatGrid";

export const PRINT_PREVIEW_ID = "PRINT_PREVIEW";

export default function PrintPreviewModal({ modalId, setModalId, layout, assignment, students, printView, setPrintView, onPrint, label }) {
  return (
    <ModalTemplate id={PRINT_PREVIEW_ID} modalId={modalId} setModalId={setModalId} className="w-[960px] max-w-[95vw] print:hidden">
      {({ close }) => (
        <div className="p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">
            인쇄 미리보기
            {/* 기록에서 연 경우: 언제 자리인지 */}
            {label && <span className="ml-2 text-base font-normal text-gray-500">· {label} 자리</span>}
          </h2>
          <div className="flex h-[60vh] w-full justify-center rounded-xl border border-gray-200 bg-white p-4 [container-type:size]">
            <SeatGrid layout={layout} assignment={assignment} students={students} view={printView} size="fit" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className={`btn btn-sm border-0 ${printView === "teacher" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setPrintView((v) => (v === "student" ? "teacher" : "student"))}
            >
              <ArrowPathIcon className="h-5 w-5" />
              180도 회전 
            </button>
            <button
              type="button"
              className="btn btn-sm border-0 bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => {
                close();
                onPrint();
              }}
            >
              <PrinterIcon className="h-5 w-5" />
              인쇄
            </button>
          </div>
        </div>
      )}
    </ModalTemplate>
  );
}
