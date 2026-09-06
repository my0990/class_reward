import ModalTemplate from "@/components/ui/common/ModalTemplate";
export default function ResetModal({ picked, modalId, setModalId, onPwdReset }) {


    return (
        <ModalTemplate id="RESET_ACCOUNT" modalId={modalId} setModalId={setModalId}>
            {({ close }) => {
                return (
                    <div className="p-6">
                        <h3 className="font-bold text-lg">{picked?.userName}({picked?.userId})의 비밀번호를 초기화하시겠습니까?</h3>
                        <div className="flex justify-end mt-[16px]">

                            <button onClick={onPwdReset} className="btn bg-red-500 text-white mr-[8px]">확인</button>

                            <button className="btn" onClick={() => close()}>취소</button>
                        </div>
                    </div>
                )
            }}
        </ModalTemplate>

    )
}