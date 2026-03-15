import ModalTemplate from "@/components/ui/common/ModalTemplate";
export default function DeleteModal({ picked, modalId, setModalId, onAccountDelete, isPending }) {

    return (
        <ModalTemplate id="DELETE_ACCOUNT" modalId={modalId} setModalId={setModalId}>
            {({ close }) => {
                return (
                    <div className="p-6">
                        <h3 className="font-bold text-lg">{picked?.userName}({picked?.userId})의 계정을 삭제하시겠습니까?</h3>
                        <div className="flex justify-end mt-[16px]">
                            <button onClick={onAccountDelete} disabled={isPending("create")} className="btn bg-red-500 text-white mr-[8px]">확인</button>
                            <button className="btn" onClick={() => setModalId(null)}>취소</button>
                        </div>
                    </div>
                )
            }}
        </ModalTemplate>
    )
}