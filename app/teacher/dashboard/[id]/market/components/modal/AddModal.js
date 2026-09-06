import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import ModalTemplate from "@/components/ui/common/ModalTemplate";
export default function AddModal({ emoji, setEmoji, modalId, setModalId, onAddModalInputChange, onAddModalClose, addModalInputData, onCreateItem, isError }) {


    return (
        <ModalTemplate id="CREATE_ITEM" modalId={modalId} setModalId={setModalId} onClose={onAddModalClose} className="w-[840px]">
            {({ close }) => (
                <div className=" max-w-[840px]  p-[16px] min-[600px]:p-[32px] dark:bg-orange-200">
                    <div className="text-right absolute top-5 right-5 text-[1.2rem] cursor-pointer leading-none max-[600px]:top-3 min-[600px]:right-3 hover:bg-gray-300 hover:rounded-full w-[34px] h-[34px] flex justify-center items-center" onClick={onAddModalClose}>x</div>
                    <h1 className="text-[1.5rem] mb-[32px]">학급 아이템 추가하기</h1>
                    <div className="flex justify-evenly flex-wrap">
                        <div className="mb-[16px] w-[352px]">
                            <h1 className="w-full outline-none" tabIndex={99}>아이템 이미지</h1>
                            {!emoji ? <div className="flex justify-center  overflow-hidden " tabIndex={-1}>
                                <Picker
                                    style={{ height: '300px', width: '400px' }}
                                    data={data}
                                    onEmojiSelect={(emojiObject) => setEmoji(emojiObject.native)}
                                    locale="ko"
                                    emojiButtonColors={[
                                        'rgba(155,223,88,.7)',
                                        'rgba(149,211,254,.7)',
                                        'rgba(247,233,34,.7)',
                                        'rgba(238,166,252,.7)',
                                        'rgba(255,213,143,.7)',
                                        'rgba(211,209,255,.7)',
                                    ]}
                                    categories={[
                                        'foods',
                                        'activity',
                                        'flags',
                                        'frequent',
                                        'nature',
                                        'objects',
                                        'people',
                                        'places',
                                        'symbols',
                                    ]}
                                />
                            </div>
                                : <div >
                                    <div className="relative w-full flex justify-center w-[352px] h-[430px] items-center bg-orange-100 p-[16px] rounded-lg">
                                        <div className="absolute top-3 right-4 cursor-pointer hover:scale-110 transition-all" onClick={() => setEmoji(null)}>뒤로가기</div>
                                        <div className="text-[160px]">
                                            {emoji}
                                        </div>
                                    </div>
                                </div>}


                        </div>
                        <div className="w-[320px]">
                            <div className="mb-[16px]">
                                <h1 >아이템 이름</h1>
                                <input onChange={onAddModalInputChange} name="itemName" value={addModalInputData.itemName} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3" />
                            </div>
                            <div className="mb-[16px]">
                                <h1 >아이템 설명</h1>
                                <input onChange={onAddModalInputChange} name="itemExplanation" value={addModalInputData.itemExplanation} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3" />
                            </div>
                            <div className="mb-[16px]">
                                <h1>가격</h1>
                                <input onChange={onAddModalInputChange} name="itemPrice" value={addModalInputData.itemPrice} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3 " />
                            </div>
                            <div className="mb-[32px]">
                                <h1>수량</h1>
                                <input onChange={onAddModalInputChange} name="itemStock" value={addModalInputData.itemStock} className="w-[100%] rounded-xl h-[40px] bg-orange-100 outline-0 text-[1.3rem] indent-3" />
                            </div>

                            <div className="flex flex-col relative">
                                <form onSubmit={onCreateItem}>
                                    {isError && <div className="text-center text-red-500 absolute top-[-27px] left-[50%] translate-x-[-50%]">모두 입력해주세요</div>}
                                    <button className="w-[100%] bg-orange-300 h-[40px] roundd-xl mb-[16px] text-white rounded-xl hover:bg-orange-500">만들기</button>
                                </form>
                                <button onClick={close} className=" h-[40px] hover:text-white hover:bg-orange-300 rounded-xl hover:bg-orange-500">취소</button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </ModalTemplate>





    )
}