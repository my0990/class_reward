export default function AddModal() {
    return (
        <dialog id="my_modal_3" className="modal sm:modal-bottom modal-middle">
            <div className="modal-box">
                <div className=" flex  p-0 justify-center">
                    <div className="overflow-x-auto w-[512px]">
                        <div className="flex justify-between pb-5">
                            <div className="text-[1.5rem] ">자리바꾸기</div>
                            <div className="text-red-400  text-[1.5rem]">3000원</div>
                        </div>
                        <button className="btn w-full bg-orange-500">확인</button>
                    </div>

                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

    )
}