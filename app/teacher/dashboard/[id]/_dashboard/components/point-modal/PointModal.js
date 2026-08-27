"use client";

import ModalTemplate from "@/components/ui/common/ModalTemplate";
import DialPad from "./DialPad";

export default function PointModal({
  isSend,
  currencyName,
  clearAll,
  modalId,
  setModalId,
  display,
  actions,
  activeIds,
  toast,
}) {


  return (
    <ModalTemplate id="HANDLE_POINT" modalId={modalId} setModalId={setModalId} onClose={()=>actions.clear()}>
      {({ close }) => {
        return (
          <div
            className={`w-[320px] flex justify-center dark:bg-gray-400 ${
              isSend ? "bg-green-500" : "bg-red-500"
            } rounded-2xl p-4`}
          >
            <div className="w-[272px]">
              <h3 className="font-bold text-lg mb-5 ml-[10px]">
                {isSend ? "받는" : "잃는"} 사람:{" "}
                {activeIds.map((a, i) => (
                  <span className="text-[1.4rem] ml-[4px]" key={a}>
                    <span className="bg-orange-200">{a}</span>
                    {i < activeIds.length - 1 && ", "}
                  </span>
                ))}
              </h3>

              <div className="h-[64px] bg-gray-200 mb-5 rounded-2xl flex justify-between items-center px-[16px]">
                <div className="text-gray-500">
                  {isSend ? "받는" : "잃는"} 금액
                </div>
                <div
                  style={{ fontSize: display.fontSize + "rem" }}
                  className="w-[170px] break-all flex justify-end"
                >
                  {display.value ? display.value : 0} {currencyName}
                </div>
              </div>

              <DialPad toast={toast} clearAll={clearAll} display={display} actions={actions} close={close}/>


            </div>
          </div>
        );
      }}
    </ModalTemplate>
  );
}