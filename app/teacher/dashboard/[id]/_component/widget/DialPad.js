"use client";

import DialBtn from "./DialBtn";


export default function DialPad({ display, actions, close, clearAll, toast }) {
  const { activeKey } = display;
  const { onNumber, onBackspace, onSubmit, clear } = actions;
  console.log(onSubmit)
  const onClick = async () => {
    try {
      await onSubmit();
      toast.success('지급 완료')
      clear();

      clearAll();
      close();
    } catch (err) {
      toast.error(err.message)
    }



  }
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
              value={n}
              onPointerDown={() => onNumber(n)}
              isactive={activeKey === n ? 1 : 0}
            >
              {n}
            </DialBtn>
          ))}
        </ul>
      ))}

      <ul className="flex justify-between">
        <DialBtn isactive={activeKey === "Backspace" ? 1 : 0} onPointerDown={onBackspace}>
          ⌫
        </DialBtn>

        <DialBtn
          value={"0"}
          onClick={() => onNumber("0")}
          isactive={activeKey === "0" ? 1 : 0}
        >
          0
        </DialBtn>

        {/* Enter 효과만 주고 실제 submit은 상위 버튼에서 */}
        <DialBtn onClick={onClick} color={"red"} isactive={activeKey === "Enter" ? 1 : 0}>
          입력
        </DialBtn>
      </ul>
    </div>
  );
}