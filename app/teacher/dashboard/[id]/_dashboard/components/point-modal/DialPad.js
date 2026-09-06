"use client";

import toast from "react-hot-toast";
import DialBtn from "./DialBtn";
import { usePointInputContext } from "./PointInputContext";

export default function DialPad() {
  const { display, actions } = usePointInputContext();
  const { activeKey, isSubmitting } = display;
  const { onNumber, onBackspace, onSubmit } = actions;

  // 성공 시 정리(선택 해제/모달 닫기/목록 갱신/성공 토스트)는
  // 상태를 소유한 컨테이너의 handleConfirm이 전부 처리한다.
  // 여기서는 실패했을 때 에러를 사용자에게 알려주기만 하면 된다.
  // 중복 제출 방지는 usePointInput.submit() 내부에서 처리되므로(버튼/키보드 공통),
  // 여기서는 진행 중 상태(isSubmitting)를 표시만 해주면 된다.
  const onClick = async () => {
    try {
      await onSubmit();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const rows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  return (
    <div>
      {rows.map((row) => (
        <ul key={row.join("-")} className="flex justify-between">
          {row.map((n) => (
            <DialBtn
              key={n}
              disabled={isSubmitting}
              onPointerDown={() => onNumber(n)}
              isactive={activeKey === n ? 1 : 0}
            >
              {n}
            </DialBtn>
          ))}
        </ul>
      ))}

      <ul className="flex justify-between">
        <DialBtn
          disabled={isSubmitting}
          isactive={activeKey === "Backspace" ? 1 : 0}
          onPointerDown={onBackspace}
        >
          ⌫
        </DialBtn>

        {/* 다른 숫자 버튼들과 동일하게 onPointerDown으로 통일 (이전엔 0만 onClick이라 반응 타이밍이 달랐음) */}
        <DialBtn
          disabled={isSubmitting}
          onPointerDown={() => onNumber("0")}
          isactive={activeKey === "0" ? 1 : 0}
        >
          0
        </DialBtn>

        {/* 제출 버튼만 onClick 유지: 드래그/스와이프 중 실수로 돈이 오가지 않도록 pointerdown보다 확정적인 click을 사용 */}
        <DialBtn disabled={isSubmitting} onClick={onClick} color={"red"} isactive={activeKey === "Enter" ? 1 : 0}>
          {isSubmitting ? "처리중" : "입력"}
        </DialBtn>
      </ul>
    </div>
  );
}
