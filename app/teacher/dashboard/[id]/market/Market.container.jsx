

'use client';

import { useFetchData } from "@/hooks/useFetchData";
import AddModal from "./components/modal/AddModal";
import DeleteModal from "./components/modal/DeleteModal";
import { useState, useRef } from "react";
import ItemCard from "./components/ItemCard";
import { useParams } from "next/navigation";
import { mutate } from "swr";
import { createItem, deleteItem, updateItem } from "@/server-action/actions/market/market.action";
import usePendingAction from "@/hooks/usePendingAction";
import { Toaster, toast } from "react-hot-toast";

export default function MarketContainer() {
    const params = useParams();
    const classId = params.id;

    const { runAction } = usePendingAction();

    const {
        data: classData,
        isLoading: isClassDataLoading,
        isError: isClassDataError,
    } = useFetchData(classId ? `/api/classData/${classId}` : null);

    const [pickedItem, setPickedItem] = useState(null);
    const [modalId, setModalId] = useState(null);

    const nodeRef = useRef();

    const [isError, setIsError] = useState(false);
    const [emoji, setEmoji] = useState(null);

    const [addModalInputData, setAddModalInputData] = useState({
        itemName: "",
        itemPrice: "",
        itemStock: "",
        itemExplanation: "",
        emoji: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isEdited, setIsEdited] = useState(false);

    const onAddModalInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "itemName" || name === "itemExplanation") {
            setAddModalInputData((prev) => ({
                ...prev,
                [name]: value,
            }));

            return;
        }

        const numberValue = value
            .replace(/,/g, "")
            .replace(/\D/g, "");

        setAddModalInputData((prev) => ({
            ...prev,
            [name]:
                numberValue === ""
                    ? ""
                    : String(Number(numberValue)),
        }));
    };

    const onCreateItem = (e) => {
        e.preventDefault();

        runAction("createItem", async () => {
            if (
                addModalInputData.itemName === "" ||
                addModalInputData.itemPrice === "" ||
                addModalInputData.itemStock === "" ||
                addModalInputData.itemExplanation === ""
            ) {
                setIsError(true);
                return;
            }

            const data = await createItem({
                ...addModalInputData,
                emoji,
                classId,
            });

            if (!data.result) {
                toast.error(data.message || "아이템 생성 실패");
                return;
            }

            await mutate(`/api/classData/${classId}`);

            setModalId(null);

            setAddModalInputData({
                itemName: "",
                itemPrice: "",
                itemStock: "",
                itemExplanation: "",
                emoji: "",
            });

            setEmoji(null);
            setIsError(false);

            toast.success("아이템을 생성하였습니다");
        });
    };

    const onAddModalClose = () => {
        setModalId(null);

        setAddModalInputData({
            itemName: "",
            itemPrice: "",
            itemStock: "",
            itemExplanation: "",
            emoji: "",
        });

        setEmoji(null);
        setIsError(false);
    };



    const onStockChange = (e) => {
        const value = e.target.value;

        if (!/^\d*$/.test(value)) {
            return;
        }

        setIsEdited(true);

        setPickedItem((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                itemStock:
                    value === ""
                        ? ""
                        : String(Number(value)),
            };
        });
    };

    const onItemPriceChange = (e) => {
        const value = e.target.value
            .replace(/,/g, "")
            .replace(/\D/g, "");

        setIsEdited(true);

        setPickedItem((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                itemPrice:
                    value === ""
                        ? ""
                        : String(Number(value)),
            };
        });
    };
    const onDeleteModalOpen = (item) => {
        /*
         * itemList 원본 객체가 직접 변경되지 않도록
         * 새로운 객체로 복사해서 pickedItem에 저장합니다.
         */
        setPickedItem({
            ...item,
            itemStock: String(item.itemStock ?? ""),
            itemPrice: String(item.itemPrice ?? ""),
        });

        setIsEdited(false);
        setModalId("DELETE_ITEM");
    };
    const onDeleteModalClose = () => {
        setModalId(null);
        setIsEdited(false);

        /*
         * 모달 닫힘 애니메이션 중 데이터가 사라지는 것을 막기 위해
         * 애니메이션이 끝난 뒤 선택 아이템을 초기화합니다.
         */
        setTimeout(() => {
            setPickedItem(null);
        }, 250);
    };

    const onDeleteItem = (e) => {
        e.preventDefault();

        if (!pickedItem) return;

        const itemId = pickedItem.itemId;

        runAction(
            "deleteItem",
            itemId,
            async () => {
                const data = await deleteItem({
                    itemId,
                    classId,
                });

                if (!data.result) {
                    throw new Error(
                        data.message || "아이템 삭제에 실패했습니다."
                    );
                }

                await mutate(`/api/classData/${classId}`);

                setModalId(null);
                setPickedItem(null);
                setIsEdited(false);

                return data;
            },
            {
                onSuccess: (data) => {
                    toast.success(
                        data.message || "아이템을 삭제하였습니다."
                    );
                },
                onError: (error) => {
                    console.error(error);
                    toast.error(
                        error.message ||
                        "아이템 삭제 중 오류가 발생했습니다."
                    );
                },
            }
        ).catch(() => { });
    };

    const onSetItemStock = (e) => {
        e.preventDefault();
    
        if (!pickedItem) return;
    
        if (
            pickedItem.itemStock === "" ||
            pickedItem.itemPrice === ""
        ) {
            toast.error("가격과 재고를 입력해 주세요.");
            return;
        }
    
        const itemId = pickedItem.itemId;
    
        runAction(
            "updateItem",
            itemId,
            async () => {
                const data = await updateItem({
                    classId,
                    itemId,
                    updatedItemStock: pickedItem.itemStock,
                    updatedItemPrice: pickedItem.itemPrice,
                });
    
                if (!data.result) {
                    throw new Error(
                        data.message || "아이템 수정에 실패했습니다."
                    );
                }
    
                await mutate(`/api/classData/${classId}`);
    
                setModalId(null);
                setPickedItem(null);
                setIsEdited(false);
    
                return data;
            },
            {
                onSuccess: (data) => {
                    toast.success(data.message);
                },
                onError: (error) => {
                    console.error(error);
                    toast.error(
                        error.message ||
                            "아이템 수정 중 오류가 발생했습니다."
                    );
                },
            }
        ).catch(() => {});
    };



    if (isClassDataLoading) {
        return <div>Loading data...</div>;
    }

    if (isClassDataError) {
        return <div>Error loading data</div>;
    }

    const {
        currencyName,
        itemList,
        currencyEmoji,
    } = classData;

    return (
        <div className="flex justify-center">
            <div className="w-[240px] min-[464px]:w-[464px] min-[688px]:w-[688px] min-[912px]:w-[912px] min-[1136px]:w-[1136px]">
                <div
                    ref={nodeRef}
                    className="flex flex-wrap p-[8px]"
                >
                    {itemList?.map((item) => (
                        <div
                            key={item.itemId}
                            className={`
                                relative m-[16px] flex w-[192px]
                                items-center justify-center rounded-lg
                                bg-orange-200
                                shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)]
                                ${item?.itemQuantity <= 0
                                    ? "cursor-default"
                                    : "cursor-pointer transition-all hover:scale-110"
                                }
                            `}
                        >
                            <ItemCard
                                data={item}
                                currencyName={currencyName}
                                onClick={onDeleteModalOpen}
                            />
                        </div>
                    ))}

                    <div
                        className="
                            relative m-[16px] flex h-[300px] w-[192px]
                            cursor-pointer items-center justify-center
                            rounded-lg bg-orange-200 p-[16px] font-bold
                            shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)]
                            transition-all hover:scale-110
                        "
                        onClick={() => setModalId("CREATE_ITEM")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                style={{ fill: "orange" }}
                                d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"
                            />
                        </svg>
                    </div>
                </div>

                <AddModal
                    emoji={emoji}
                    setEmoji={setEmoji}
                    modalId={modalId}
                    setModalId={setModalId}
                    onAddModalInputChange={onAddModalInputChange}
                    onAddModalClose={onAddModalClose}
                    addModalInputData={addModalInputData}
                    onCreateItem={onCreateItem}
                    isError={isError}
                />

                <DeleteModal
                    modalId={modalId}
                    setModalId={setModalId}
                    pickedItem={pickedItem}
                    itemStock={pickedItem?.itemStock ?? ""}
                    price={pickedItem?.itemPrice ?? ""}
                    currencyEmoji={currencyEmoji}
                    isEdited={isEdited}
                    isLoading={isLoading}
                    onStockChange={onStockChange}
                    onItemPriceChange={onItemPriceChange}
                    onSetItemStock={onSetItemStock}
                    onDeleteModalClose={onDeleteModalClose}
                    onDeleteItem={onDeleteItem}
                />

                <Toaster position="bottom-right" />
            </div>
        </div>
    );
}