"use client";

import { useEffect, useState } from "react";
import ModalTemplate from "@/components/ui/common/ModalTemplate";

// 학급 삭제 확인: 학급 이름을 똑같이 입력해야 삭제 버튼이 켜진다.
export default function DeleteClassModal({ modalId, setModalId, target, onConfirm, isDeleting }) {
  const [typed, setTyped] = useState("");
  useEffect(() => setTyped(""), [target?._id]);

  const name = target?.className ?? "";
  const matches = typed.trim() !== "" && typed.trim() === name.trim();

  return (
    <ModalTemplate id="DELETE_CLASS" modalId={modalId} setModalId={setModalId} className="w-[calc(100%-32px)] max-w-[460px]">
      {({ close }) => (
        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (matches && !isDeleting) onConfirm(typed);
          }}
        >
          <h2 className="mb-4 text-xl font-bold">&quot;{name}&quot;을(를) 삭제할까요?</h2>

          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-700">
            학생 {target?.studentsCount ?? 0}명의 계정과 잔액, 아이템, 퀘스트, 거래 기록이 함께 삭제됩니다.
            <br />
            삭제 후 <b>30일 동안은 &apos;삭제된 학급&apos;에서 복구</b>할 수 있고, 그 뒤에는 영구 삭제됩니다.
            <br />
            삭제하는 동안 이 학급 학생들은 로그인할 수 없습니다.
          </div>

          <label htmlFor="confirmClassName" className="mb-1 block text-sm text-gray-600">
            확인을 위해 학급 이름 <b>{name}</b>을(를) 입력하세요
          </label>
          <input
            id="confirmClassName"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoFocus
            className="mb-4 w-full border p-2"
            placeholder={name}
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className="rounded bg-gray-300 px-4 py-2">
              취소
            </button>
            <button
              type="submit"
              disabled={!matches || isDeleting}
              className="rounded bg-red-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </form>
      )}
    </ModalTemplate>
  );
}
