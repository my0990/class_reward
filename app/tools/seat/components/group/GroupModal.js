
export default function GroupModal({ }) {

    const onCancel = (e) => {
        e.preventDefault();
        document.getElementById('groupModal').close()
    }


    return (
        <div>
            <dialog id="groupModal" className="modal">
                <div className="modal-box min-w-[1000px] min-h-[600px] flex flex-col justify-between">


                    <div className="flex justify-center w-full py-[24px] h-[564px] bg-blue-100 items-center">

                    </div>
                    <div className="flex justify-center mt-[16px]">
                        <form >
                            <button className="btn bg-red-500 text-white mr-[8px]">확인</button>
                        </form>
                        <form>
                            <button className="btn" onClick={onCancel}>취소</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}