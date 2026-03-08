import { useState } from "react";
import { mutate } from "swr";
export default function DeleteModal({picked}) {
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/deleteAccount", {
            method: "POST",
            body: JSON.stringify({ student: picked.userId, classNumber: picked.classNumber }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {

            if (data.result === true) {
                alert("계정을 삭제하였습니다");
                mutate("/api/fetchClassData");
                mutate("/api/fetchStudentData");
                document.getElementById('my_modal_3').close()

            }
        })
    }
    return (
        <div>
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">{picked?.userName}({picked?.userId})의 계정을 삭제하시겠습니까?</h3>
                    <div className="flex justify-end mt-[16px]">
                        <form onSubmit={onSubmit}>
                        <button className="btn bg-red-500 text-white mr-[8px]">확인</button>
                        </form>
                        <button className="btn" onClick={()=>document.getElementById("my_modal_3").close()}>취소</button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}