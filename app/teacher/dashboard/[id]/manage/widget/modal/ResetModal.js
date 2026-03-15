import ModalTemplate from "@/components/ui/common/ModalTemplate";
export default function ResetModal({ picked, modalId, setModalId }) {

    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/resetPassword", {
            method: "POST",
            body: JSON.stringify({ student: picked.userId }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {
                alert(picked?.userName + '의 비밀번호를 12345678로 초기화하였습니다');
                setModalId(null);

            }
        })
    }
    return (
        <ModalTemplate id="RESET_ACCOUNT" modalId={modalId} setModalId={setModalId}>
            {({ close }) => {
                return (
                    <div className="p-6">
                        <h3 className="font-bold text-lg">{picked?.userName}({picked?.userId})의 비밀번호를 초기화하시겠습니까?</h3>
                        <div className="flex justify-end mt-[16px]">
                            <form onSubmit={onSubmit}>
                                <button className="btn bg-red-500 text-white mr-[8px]">확인</button>
                            </form>
                            <button className="btn" onClick={() => close()}>취소</button>
                        </div>
                    </div>
                )
            }}
        </ModalTemplate>

    )
}