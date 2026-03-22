import ModalTemplate from "@/components/ui/common/ModalTemplate"

export default function ProfileBuyModal({ pickedData, currencyName, modalId, setModalId, onBuyModalClose, onBuyProfileImg }) {

    return (
        <ModalTemplate id="BUY_PROFILE" modalId={modalId} setModalId={setModalId}>
            {({ close }) => (
                <div>
                    <div className="p-[24px] rounded-lg dark:bg-orange-200 flex flex-col bg-orange-100 max-w-[320px] text-[1.2rem]">
                        <h1>이 그림을 구매하시겠습니까?</h1>
                        <div className="flex justify-center my-[16px]">
                            <div className="w-[160px] h-[160px] border-[8px] border-white rounded-full bg-white flex justify-center items-center overflow-hidden">
                                <img src={pickedData?.url} width="200" height="200" alt="profileImg" />
                            </div>
                        </div>
                        <div className="flex justify-between ">
                            <div>가격: </div>
                            <div>{pickedData && pickedData.price} {currencyName}</div>
                        </div>
                        <div className="flex justify-between mt-[32px]">
                            <button onClick={onBuyProfileImg} className=" bg-orange-500 text-white py-[8px] hover:bg-orange-600 w-[128px] px-[24px] rounded-lg">확인</button>
                            <button onClick={onBuyModalClose} className="bg-gray-300 text-gray-700 py-[8px] px-[24px] hover:bg-gray-400 w-[128px] rounded-lg bg-white-100">취소</button>
                        </div>
                    </div>
                </div>
            )}
        </ModalTemplate>

    )
}