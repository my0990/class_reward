"use client";

import { useEffect, useState } from "react";
import ModalTemplate from "@/components/ui/common/ModalTemplate";

const MAX = 30; // server-action/service/class/renameClass.service.js의 CLASS_NAME_MAX와 같게

// 학급 이름 바꾸기: 지금 이름이 채워진 채로 열린다. Enter로 저장.
export default function RenameClassModal({ modalId, setModalId, target, onConfirm, isSaving }) {
  const [name, setName] = useState("");
  useEffect(() => setName(target?.className ?? ""), [target?._id, target?.className]);

  const trimmed = name.trim();
  const unchanged = trimmed === (target?.className ?? "").trim();
  const canSave = trimmed !== "" && !unchanged && !isSaving;

  return (
    <ModalTemplate id="RENAME_CLASS" modalId={modalId} setModalId={setModalId} className="w-[calc(100%-32px)] max-w-[420px]">
      {({ close }) => (
        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) onConfirm(trimmed);
          }}
        >
          <h2 className="mb-4 text-xl font-bold">학급 이름 바꾸기</h2>

          <label htmlFor="renameClassName" className="mb-1 block text-sm text-gray-600">
            새 학급 이름
          </label>
          <input
            id="renameClassName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.select()}
            maxLength={MAX}
            autoComplete="off"
            autoFocus
            className="w-full border p-2"
          />
          <p className="mb-4 mt-1 text-right text-xs text-gray-400">
            {trimmed.length} / {MAX}자
          </p>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className="rounded bg-gray-300 px-4 py-2">
              취소
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="rounded bg-orange-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      )}
    </ModalTemplate>
  );
}
