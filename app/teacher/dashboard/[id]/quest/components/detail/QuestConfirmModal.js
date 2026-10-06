"use client";
// 퀘스트 확인 창 공용 (보상 지급 · 초기화 · 삭제): 제목 + 내용 + [확인] [취소]
import ModalTemplate from "@/components/ui/common/ModalTemplate";

export default function QuestConfirmModal({ id, modalId, setModalId, title, children, confirmLabel = "확인", busy, danger = false, onConfirm }) {
  return (
    <ModalTemplate id={id} modalId={modalId} setModalId={setModalId} className="w-[calc(100%-32px)] max-w-[560px]">
      {({ close }) => (
        <div className="p-[24px] text-[1.2rem] min-[600px]:p-[40px]">
          <h1 className="mb-[16px] text-[1.5rem] font-bold text-black">{title}</h1>
          {children}
          <div className="mt-[32px] flex gap-2 max-[600px]:flex-col">
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`flex-1 rounded-[5px] py-[10px] text-white disabled:opacity-60 ${danger ? "bg-red-400" : "bg-orange-500"}`}
            >
              {busy ? "처리 중..." : confirmLabel}
            </button>
            <button type="button" disabled={busy} onClick={close} className="flex-1 rounded-[5px] bg-gray-200 py-[10px] text-black">
              취소
            </button>
          </div>
        </div>
      )}
    </ModalTemplate>
  );
}
