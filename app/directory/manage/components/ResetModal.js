export default function ResetModal() {
    return (
        <div>
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">이명권(mu0990)의 비밀번호를 초기화하시겠습니까?</h3>
                    <button className="btn bg-red-500 text-white">확인</button>
                    <button className="btn" onClick={()=>document.getElementById("my_modal_2").close()}>취소</button>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}