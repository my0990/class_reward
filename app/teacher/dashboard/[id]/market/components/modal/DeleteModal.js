import ModalTemplate from "@/components/ui/common/ModalTemplate";

export default function DeleteModal({ onStockChange, modalId, isEdited, setModalId, pickedItem, onSetItemStock, itemStock, price, currencyEmoji, onItemPriceChange, onDeleteModalClose, onDeleteItem}) {



    return (
        <ModalTemplate
            id="DELETE_ITEM"
            modalId={modalId}
            setModalId={setModalId}
            onClose={onDeleteModalClose}
            className="w-[520px]"
        >
            {({ close }) => (
                <div className="relative max-w-[520px] min-[600px]:p-[24px] p-[16px] dark:bg-orange-200">
                    <button
                        type="button"
                        onClick={close}
                        className="absolute top-3 right-3 text-[1.2rem] cursor-pointer leading-none hover:bg-gray-300 hover:rounded-full w-[34px] h-[34px] flex justify-center items-center"
                    >
                        x
                    </button>

                    <div className="flex items-center mb-[8px]">
                        <h1 className="text-[1.5rem] font-bold outline-none" tabIndex={99}>
                            {pickedItem.itemName}
                        </h1>
                    </div>

                    <div className="text-[160px] leading-none text-center mt-[32px] mb-[16px]">
                        {pickedItem.emoji}
                    </div>

                    <div className="text-gray-500 mb-[8px]">
                        {pickedItem.itemExplanation}
                    </div>

                    <div className="mb-[32px]">
                        <div className="rounded-2xl p-4">
                            <p className="mb-2 text-sm font-bold text-orange-700">
                                재고
                            </p>

                            <div className="flex items-center border-2 border-orange-200 rounded-2xl bg-white px-4 shadow-sm">
                                <input
                                    className="w-full py-3 text-right text-2xl cursor-pointer font-extrabold text-gray-800 outline-none"
                                    onChange={onStockChange}
                                    value={itemStock}
                                    inputMode="numeric"
                                    placeholder="0"
                                />

                                <span className="ml-2 shrink-0 text-lg font-bold text-orange-500">
                                    개
                                </span>
                            </div>
                        </div>

                        <div className="rounded-2xl px-4">
                            <p className="mb-2 text-sm font-bold text-orange-700">
                                가격
                            </p>

                            <div className="flex items-center border-2 border-orange-200 rounded-2xl bg-white px-4 shadow-sm">
                                <input
                                    className="w-full py-3 text-right cursor-pointer text-2xl font-extrabold text-gray-800 outline-none"
                                    onChange={onItemPriceChange}
                                    value={price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    inputMode="numeric"
                                    placeholder="0"
                                />

                                <span className="ml-2 shrink-0 text-lg font-bold text-orange-500">
                                    {currencyEmoji}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                        {isEdited ? (
                            <form
                                onSubmit={onSetItemStock}
                                className="w-[48%] max-[600px]:w-[100%]"
                            >
                                <button className="w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">
                                    수정
                                </button>
                            </form>
                        ) : (
                            <form
                                onSubmit={onDeleteItem}
                                className="w-[48%] max-[600px]:w-[100%]"
                            >
                                <button className="w-[100%] bg-red-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] hover:bg-red-500">
                                    삭제
                                </button>
                            </form>
                        )}

                        <button
                            type="button"
                            className="w-[48%] max-[600px]:w-[100%] bg-gray-200 hover:bg-gray-300 rounded-[5px] py-[8px]"
                            onClick={close}
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}
        </ModalTemplate>
    )
}