"use client";
// 학생 관리 카드: 눌러서 바로 고치기 (별명 한 줄 / 자기소개 여러 줄)
// - 한 줄: Enter 저장, Esc 취소, 바깥을 누르면 저장
// - 여러 줄: 바깥을 누르면(포커스가 빠지면) 저장, Ctrl(⌘)+Enter 저장, Esc 취소
// - 바뀐 게 없으면 저장하지 않고 그냥 닫는다
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
      // preventScroll: 포커스할 때 브라우저가 화면을 움직이지 않게 (편집을 누르면 화면이 들썩이던 것)
      ref.current?.focus({ preventScroll: true });
      if (!multiline) ref.current?.select?.();
    }
  }, [editing]);

  const save = async () => {
    if (busy) return;
    if ((draft ?? "") === (value ?? "")) return setEditing(false);
    setBusy(true);
    const ok = await onSave(draft);
    setBusy(false);
    if (ok) setEditing(false);
    else ref.current?.focus({ preventScroll: true });
  };
  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  // 넘겨받은 className이 absolute(예: 레벨 동그라미 옆에 붙는 별명)면 relative를 덧붙이지 않는다
  // (둘 다 붙으면 relative가 이겨서 별명이 레벨에서 떨어져 보였다)
  const pos = /(^|\s)(absolute|fixed)(\s|$)/.test(className) ? "" : "relative";

  if (!editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        title="눌러서 수정"
        onClick={() => setEditing(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setEditing(true))}
        className={`group ${pos} cursor-pointer transition hover:ring-2 hover:ring-orange-400 ${className}`}
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
        // 보던 칸과 같은 크기·글꼴로 (바뀌는 순간 크기가 달라져 깜빡이지 않게)
        className={`min-w-0 outline-none ring-2 ring-orange-500 [font:inherit] ${className}`}
        // 레벨 옆 별명처럼 글자만큼 폭인 칸: 입력칸도 글자 수만큼만 (갑자기 넓어지지 않게)
        style={pos ? undefined : { width: `calc(${Math.max(2, draft.length) + 0.5}em + 64px)` }}
      />
    );
  }

  return (
    // 보이던 칸과 같은 크기 안에서 고친다 (카드 밖으로 넘치지 않게): 입력칸이 칸을 채우고, 글자 수는 안쪽 오른쪽 아래
    // 테두리는 칸 바깥선에 (보던 칸에 마우스를 올렸을 때와 같은 자리). 입력칸은 테두리·여백 없이 칸을 채워 글자 위치도 그대로
    <div className={`relative flex flex-col ring-2 ring-orange-500 ${className}`}>
      <textarea
        ref={ref}
        value={draft}
        maxLength={maxLength}
        readOnly={busy} // disabled면 저장 실패 뒤 입력칸 포커스가 빠져 Esc가 창을 닫음
        rows={1}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation(); // 창(모달)까지 닫히지 않게
            cancel();
          }
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) save();
        }}
        onBlur={save}
        placeholder={placeholder}
        className="min-h-[96px] w-full flex-1 resize-none bg-transparent p-0 pb-[16px] outline-none [font:inherit]"
      />
      {maxLength && (
        <span className="pointer-events-none absolute bottom-[6px] right-[10px] rounded bg-white/90 px-[4px] text-[0.75rem] text-gray-400">
          {busy ? "저장 중..." : `${draft.length}/${maxLength}`}
        </span>
      )}
    </div>
  );
}
