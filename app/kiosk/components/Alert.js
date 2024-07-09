export default function Alert({setStep}) {
    return (
        <dialog id="my_modal_2" className="modal  modal-middle ">
            <div className="modal-box p-0 dark:bg-orange-200 flex flex-col bg-orange-100">
                <div role="alert" className="alert alert-success bg-orange-200 border-0">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>완료하였습니다</span>
                    <button className="btn" onClick={() => setStep("home")}>확인</button>
                </div>
            </div>



        </dialog>

    )
}