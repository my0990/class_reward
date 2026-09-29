// "use client";

// import ModalTemplate from "@/components/ui/common/ModalTemplate";
// import { useEffect, useMemo, useState } from "react";

// // 항상 보여줄 기본 구조


// export default function TemperatureManageModal({
//     modalId,
//     setModalId,
//     onUpdateDegree
// }) {


//     return (
//         <ModalTemplate id="HANDLE_TEMPERATURE" modalId={modalId} setModalId={setModalId}>
//             {({ close }) => {
//                 return (
//                     <div className="p-4">
//                         <button
//                         className="btn"
//                             onClick={() =>
//                                 onUpdateDegree({
//                                     type: "increase",
//                                     degreeChange: 1,
//                                 })
//                             }
//                         >
//                             +1도
//                         </button>
//                     </div>
//                 );
//             }}
//         </ModalTemplate>
//     );
// }

"use client";

import ModalTemplate from "@/components/ui/common/ModalTemplate";

export default function TemperatureManageModal({
  modalId,
  setModalId,
  onUpdateDegree,
}) {
  const handleClick = (type, degreeChange) => {
    onUpdateDegree({
      type,
      degreeChange,
    });
  };

  return (
    <ModalTemplate
      id="HANDLE_TEMPERATURE"
      modalId={modalId}
      setModalId={setModalId}
    >
      {({ close }) => {
        return (
          <div className="w-[420px] rounded-3xl bg-white p-6">
            {/* 제목 */}
            <div className="mb-6">
              <h2 className="text-[1.4rem] font-bold text-gray-800">
                온도 직접 조절
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                학급 온도를 수동으로 올리거나 내릴 수 있습니다.
              </p>
            </div>

            {/* 증가 */}
            <div className="mb-5">
              <div className="mb-3 text-sm font-semibold text-orange-500">
                온도 올리기
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 3, 5].map((num) => (
                  <button
                    key={`increase-${num}`}
                    onClick={() => handleClick("increase", num)}
                    className="rounded-2xl border border-orange-200 bg-orange-50 py-3 font-semibold text-orange-600 transition hover:scale-[1.02] hover:bg-orange-100"
                  >
                    +{num}도
                  </button>
                ))}
              </div>
            </div>

            {/* 감소 */}
            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-blue-500">
                온도 내리기
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 3, 5].map((num) => (
                  <button
                    key={`decrease-${num}`}
                    onClick={() => handleClick("decrease", num)}
                    className="rounded-2xl border border-blue-200 bg-blue-50 py-3 font-semibold text-blue-600 transition hover:scale-[1.02] hover:bg-blue-100"
                  >
                    -{num}도
                  </button>
                ))}
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={close}
                className="rounded-xl bg-gray-100 px-5 py-2 font-medium text-gray-600 transition hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        );
      }}
    </ModalTemplate>
  );
}