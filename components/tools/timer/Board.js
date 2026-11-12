"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// 판서판: 외부 편집기(react-quill, 약 200KB) 대신 브라우저 기본 기능(contentEditable)으로.
// 열 때만 내려받도록 page.js에서 next/dynamic으로 불러온다.
const COLORS = ["#ffffff", "#ffe066", "#ff8fab", "#74c0fc", "#8ce99a"];
const SIZES = [32, 48, 64, 88, 120];

export default function Board({ storageKey }) {
  const ref = useRef(null);
  const saveTimer = useRef(null);
  const [sizeIdx, setSizeIdx] = useState(1);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved) {
        ref.current.innerHTML = saved.html || "";
        if (SIZES[saved.sizeIdx]) setSizeIdx(saved.sizeIdx);
      }
    } catch {}
  }, [storageKey]);

  const save = useCallback(
    (nextSizeIdx = sizeIdx) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify({ html: ref.current?.innerHTML || "", sizeIdx: nextSizeIdx }));
        } catch {}
      }, 400);
    },
    [storageKey, sizeIdx],
  );
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const exec = (cmd, value) => {
    ref.current.focus();
    document.execCommand(cmd, false, value);
    save();
  };

  const changeSize = (d) => {
    const next = Math.min(SIZES.length - 1, Math.max(0, sizeIdx + d));
    setSizeIdx(next);
    save(next);
  };

  const clearAll = () => {
    ref.current.innerHTML = "";
    save();
  };

  // 붙여넣기는 글자만 (다른 곳 서식·이미지가 딸려오지 않게)
  const onPaste = (e) => {
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
  };

  const btn = "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-white/90 hover:bg-white/15";

  return (
    <div className="flex h-full flex-col bg-[#264941]">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-3 py-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title="글자색"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("foreColor", c)}
            className="h-6 w-6 rounded-full border-2 border-white/30"
            style={{ background: c }}
          />
        ))}
        <span className="mx-1 h-5 w-px bg-white/20" />
        <button type="button" className={`${btn} font-bold`} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>
          B
        </button>
        <button type="button" className={btn} onClick={() => changeSize(-1)} title="글자 작게">
          가−
        </button>
        <button type="button" className={btn} onClick={() => changeSize(1)} title="글자 크게">
          가+
        </button>
        <button type="button" className={`${btn} ml-auto`} onClick={clearAll}>
          모두 지우기
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onInput={() => save()}
        onPaste={onPaste}
        data-placeholder="여기에 쓰세요"
        className="board-cursor flex-1 overflow-auto whitespace-pre-wrap break-words p-6 font-semibold leading-snug text-white outline-none empty:before:text-white/30 empty:before:content-[attr(data-placeholder)]"
        style={{ fontSize: SIZES[sizeIdx] }}
      />
    </div>
  );
}
