"use client";
// 학생 관리 카드: 눌러서 바로 고치기 (별명 한 줄 / 자기소개 여러 줄)
// - 한 줄: Enter 저장, Esc 취소, 바깥을 누르면 저장
// - 여러 줄: [저장] [취소] 버튼, Ctrl(⌘)+Enter 저장, Esc 취소
import { useEffect, useRef, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export default function EditableText({ value, onSave, multiline = false, maxLength, placeholder = "", className = "", display }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);
  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select?.();
    }
  }, [editing]);

  const save = async () => {
    if (busy) return;
    if ((draft ?? "") === (value ?? "")) return setEditing(false);
    setBusy(true);
    const ok = await onSave(draft);
    setBusy(false);
    if (ok) setEditing(false);
    else ref.current?.focus();
  };
  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        title="눌러서 수정"
        onClick={() => setEditing(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setEditing(true))}
        className={`group relative cursor-text transition hover:ring-2 hover:ring-orange-400 ${className}`}
      >
        {display ?? (value || <span className="text-gray-400">{placeholder}</span>)}
        <PencilSquareIcon className="pointer-events-none absolute right-[6px] top-[6px] h-[16px] w-[16px] text-orange-500 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      </div>
    );
  }

  if (!multiline) {
    return (
      <input
        ref={ref}
        value={draft}
        maxLength={maxLength}
        readOnly={busy} // disabled면 저장 실패 뒤 입력칸 포커스가 빠져 Esc가 창을 닫음
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return; // 한글 입력 중
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            e.stopPropagation(); // 창(모달)까지 닫히지 않게
            cancel();
          }
        }}
        onBlur={save}
        className={`outline-none ring-2 ring-orange-500 ${className}`}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-[6px] ${className} !h-auto`}>
      <textarea
        ref={ref}
        value={draft}
        maxLength={maxLength}
        readOnly={busy} // disabled면 저장 실패 뒤 입력칸 포커스가 빠져 Esc가 창을 닫음
        rows={5}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation(); // 창(모달)까지 닫히지 않게
            cancel();
          }
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save();
        }}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg p-[6px] outline-none ring-2 ring-orange-500"
      />
      <div className="flex items-center justify-end gap-[6px] text-[0.85rem]">
        {maxLength && <span className="mr-auto text-gray-400">{draft.length}/{maxLength}</span>}
        <button type="button" onClick={cancel} disabled={busy} className="btn btn-xs border-0 bg-gray-100">
          취소
        </button>
        <button type="button" onClick={save} disabled={busy} className="btn btn-xs border-0 bg-orange-500 text-white hover:bg-orange-600">
          {busy ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
