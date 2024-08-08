import { useState } from "react";
export default function ResetModal({picked, teacher}) {
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/resetPassword", {
            method: "POST",
            body: JSON.stringify({ teacher: teacher, student: picked.userId }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {
                alert(picked?.userName + '의 비밀번호를 1234로 초기화하였습니다');
                document.getElementById('my_modal_1').close()
                
            }
        })
    }
    return (
        <div>
            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">{picked?.userName}({picked?.userId})의 비밀번호를 초기화하시겠습니까?</h3>
                    <div className="flex justify-end mt-[16px]">
                        <form onSubmit={onSubmit}>
                        <button className="btn bg-red-500 text-white mr-[8px]">확인</button>
                        </form>
                        <button className="btn" onClick={()=>document.getElementById("my_modal_1").close()}>취소</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}