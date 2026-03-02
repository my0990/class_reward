'use client';
import ModalTemplate from "@/components/ui/common/ModalTemplate";
// import { addClass } from "../server-actions/addClass";
import { useRef } from "react";

export default function AddClassModal({ modalId, setModalId, onCreateClass }) {

  const inputRef = useRef();
  return (
    <ModalTemplate id="ADD_CLASS" modalId={modalId} setModalId={setModalId}>
      {({ close }) => (
        // <form onSubmit={(e) => handleSubmit(e, close)}> {/* ⭐️ action 제거 */}
        <div className="p-6">
          {/* <button onClick={onCreateClass} className="text-xl font-bold mb-4">학급 추가</button > */}
          <h2 className="text-xl font-bold mb-4">학급 추가</h2 >

          <input
            type="text"
            name="className"
            placeholder="학급 이름"
            className="border p-2 w-full mb-4"
            autoComplete="off"
            ref={inputRef}
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              취소
            </button>

            <button
              className="px-4 py-2 bg-orange-500 text-white rounded"
              // onClick={() => onCreateClass({className: inputRef.current.value})}
              onClick={() => {
                const className = inputRef.current.value.trim();

                if (!className) {
                  alert("학급 이름을 입력해주세요!");
                  return;
                }

                onCreateClass({ className });
                close();
              }}
            >
              추가
            </button>
          </div>
        </div>
      )}
    </ModalTemplate>
  );
}