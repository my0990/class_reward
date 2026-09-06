import ModalTemplate from "@/components/ui/common/ModalTemplate"


export default function UpdateProfileImgModal({ modalData, currencyEmoji, setIsEdited, isEdited, modalId, setModalId, onPriceChange, onUpdateProfileImg, onDeleteProfileImg, onUpdateModalClose }) {

    return (
        <ModalTemplate id="UPDATE_PROFILE" modalId={modalId} setModalId={setModalId} onClose={() => setIsEdited(false)}>
            {({ close }) => (
                <div >
                    <div className="bg-orange-200 dark:bg-orange-200 rounded-lg p-[24px]  flex flex-col bg-orange-100 max-w-[320px] overflow-hidden">
                        <div className="flex justify-between items-center mb-[16px]">
                            <h1 className="text-[1.4rem] ">프로필 이미지 삭제 및 수정</h1>
                        </div>
                        <div className="w-full flex justify-center">
                            <div className="w-[190px] h-[190px] rounded-full border-[12px] border-white bg-white flex justify-center items-center mb-[16px] overflow-hidden">
                                {modalData?.url && <img src={modalData?.url} width="190" height="190" alt="orange" />}
                            </div>
                        </div>
                        <div className="text-[1.2rem] mb-[16px]">
                            <div className="flex justify-between mb-[8px] ">
                                <div>가격</div>
                                <div className="flex border-b-4 border-orange-400 cursor-pointer">
                                    <div>{currencyEmoji} </div>
                                    <input tabIndex="-1" className="bg-transparent  outline-none min-w-[32px] text-center max-w-[200px]" value={modalData?.price || 0} onChange={onPriceChange} />
                                </div>
                                <span  style={{ visibility: "hidden", position: "absolute", whiteSpace: "pre" }}>
                                    {modalData?.price || " "}
                                </span>
                            </div>
                        </div>
                        {isEdited
                            ?
                            <button onClick={onUpdateProfileImg} className="btn w-full border-0 mb-[8px] bg-orange-400 hover:bg-orange-500">수정</button>

                            :
                            <button onClick={onDeleteProfileImg} className="btn w-full border-0 mb-[8px] bg-orange-400 hover:bg-orange-500">삭제</button>
                        }

                        <button onClick={onUpdateModalClose} className="btn w-full border-0 bg-gray-300 hover:bg-gray-400">취소</button>
                    </div>
                </div>
            )}
        </ModalTemplate>



    )
}