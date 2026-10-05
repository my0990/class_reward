import ModalTemplate from "@/components/ui/common/ModalTemplate";
import { useManageContext } from "../ManageContext";

export default function CreateModal() {
  const { modalId, setModalId, onAccountToggle, onAccountCreate, isPending, nums, studentArr } = useManageContext();

  return (
    <ModalTemplate id="CREATE_ACCOUNT" modalId={modalId} setModalId={setModalId} className="w-[calc(100%-24px)] max-w-[560px]">
      {({ close }) => (
        <div className="max-h-[85dvh] overflow-y-auto p-[16px] sm:p-[32px]">
          <div className="flex justify-between items-center flex-col">
            <h3 className="mb-[8px] text-center text-[1.15rem] font-bold sm:mb-[16px] sm:text-[1.5rem]">
              계정은 1번부터 40번까지 만들 수 있습니다
            </h3>
            <h3 className="mb-[12px] text-[0.9rem] font-bold text-gray-400 sm:mb-[16px] sm:text-[1rem]">
              초기 비밀번호는 12345678입니다
            </h3>
          </div>

          <div className="grid grid-cols-5">
            {nums.map((num) => {
              const v = studentArr[num];

              const isCreated = v === "생성됨";
              const isPicked = v === true;

              return (
                <div key={num} className="m-[4px] text-center text-[0.85rem] sm:m-[8px] sm:text-[1rem]">
                  {isCreated ? (
                    <div className="text-[2.2rem] leading-none opacity-50 sm:text-[3rem]">❤️</div>
                  ) : isPicked ? (
                    <button
                      type="button"
                      className="cursor-pointer text-[2.2rem] leading-none transition-all hover:scale-110 sm:text-[3rem]"
                      onClick={() => onAccountToggle(num)}
                      disabled={isPending('create')}
                    >
                      ❤️
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="cursor-pointer text-[2.2rem] leading-none transition-all hover:scale-110 sm:text-[3rem]"
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
            className="btn sticky bottom-0 mt-[16px] w-full bg-orange-300 hover:bg-orange-400"
            onClick={() => onAccountCreate()}
            disabled={isPending('create')}
          >
            {isPending('create') ? "생성 중..." : "확인"}
          </button>
        </div>
      )}
    </ModalTemplate>
  );
}
