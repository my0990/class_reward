import { useState, useEffect, useMemo, useCallback } from "react";
import { mutate } from "swr";
import ModalTemplate from "@/components/ui/common/ModalTemplate";

export default function CreateModal({ modalId, setModalId, onAccountToggle, onAccountCreate, isPending, nums, studentArr }) {



  return (
    <ModalTemplate id="CREATE_ACCOUNT" modalId={modalId} setModalId={setModalId}>
      {({ close }) => (
        <div className="h-[720px] overflow-scroll p-[32px]">
          <div className="flex justify-between items-center flex-col">
            <h3 className="font-bold text-[1.5rem] mb-[16px]">
              계정은 1번부터 40번까지 만들 수 있습니다
            </h3>
            <h3 className="font-bold text-gray-400 text-[1rem] mb-[16px]">
              초기 비밀번호는 12345678입니다
            </h3>
          </div>

          <div className="grid grid-cols-5">
            {nums.map((num) => {
              const v = studentArr[num];

              const isCreated = v === "생성됨";
              const isPicked = v === true;

              return (
                <div key={num} className="text-center m-[8px]">
                  {isCreated ? (
                    <div className="text-[3rem] leading-none opacity-50">❤️</div>
                  ) : isPicked ? (
                    <button
                      type="button"
                      className="text-[3rem] leading-none cursor-pointer transition-all hover:scale-110"
                      onClick={() => onAccountToggle(num)}
                      disabled={isPending('create')}
                    >
                      ❤️
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-[3rem] leading-none cursor-pointer transition-all hover:scale-110"
                      onClick={() => onAccountToggle(num)}
                      disabled={isPending('create')}
                    >
                      😴
                    </button>
                  )}
                  <div>{num}번</div>
                </div>
              );
            })}
          </div>

          <button
            className="btn w-full bg-orange-300 hover:bg-orange-400 mt-[16px]"
            onClick={() => onAccountCreate(close)}
            disabled={isPending('create')}
          >
            {isPending('create') ? "생성 중..." : "확인"}
          </button>
        </div>
      )}
    </ModalTemplate>
  );
}