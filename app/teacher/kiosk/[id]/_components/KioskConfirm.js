"use client";
// 키오스크 확인 창: 큰 글씨 제목 + [확인(주황)] [취소(빨강)]
export default function KioskConfirm({ open, title, confirmLabel = "확인", cancelLabel = "취소", busy = false, onConfirm, onCancel }) {
  if (!open) return null;
  const btn = "rounded-lg py-[16px] text-[1.4rem] font-semibold text-black transition-all hover:text-white disabled:opacity-50";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={busy ? undefined : onCancel}>
      <div className="w-full max-w-[600px] rounded-2xl bg-orange-100 p-[32px]" onClick={(e) => e.stopPropagation()}>
        <h1 className="text-[2rem]">{title}</h1>
        <div className="mt-[16px] flex flex-col gap-[16px]">
          <button type="button" disabled={busy} onClick={onConfirm} className={`${btn} bg-orange-500`}>
            {busy ? "처리 중..." : confirmLabel}
          </button>
          <button type="button" disabled={busy} onClick={onCancel} className={`${btn} bg-red-500`}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
