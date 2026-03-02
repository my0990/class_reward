'use client';
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { addClass } from "../server-actions/addClass";
import { mutate } from "swr";

export default function AddClassModal({ modalId, setModalId }) {

  const handleSubmit = async (e, close) => {
    e.preventDefault();              // ⭐️ 새로고침 막기

    const formData = new FormData(e.target);
    const result = await addClass(formData);
    console.log(result)
    if (result.success) {
      mutate('/api/classes');        // ⭐️ 네 전역 학급 SWR 갱신
      close();                       // ⭐️ 모달 닫기
    } else {
      alert('학급은 최대 20개까지 만들수 있습니다.')
      close();
    }
  };

  return (
    <ModalTemplate id="ADD_CLASS" modalId={modalId} setModalId={setModalId}>
      {({ close }) => (
        <form onSubmit={(e) => handleSubmit(e, close)}> {/* ⭐️ action 제거 */}
          <h2 className="text-xl font-bold mb-4">학급 추가</h2>

          <input
            type="text"
            name="className"
            placeholder="학급 이름"
            className="border p-2 w-full mb-4"
            autoComplete="off"
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
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              추가
            </button>
          </div>
        </form>
      )}
    </ModalTemplate>
  );
}