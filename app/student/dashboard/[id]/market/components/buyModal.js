import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mutate } from "swr";
import { buyItem } from "@/server-action/actions/market/market.action";
import ModalTemplate from "@/components/ui/common/ModalTemplate";

export default function BuyModal({ buyList, money, currencyName, currencyEmoji, classId, modalId, setModalId }) {
    const router = useRouter();


    const [isLoading, setIsLoading] = useState(false);
    const left = (money - buyList?.itemPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const onSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (money < buyList.itemPrice) {
            toast.error('돈이 모자랍니다');
            setModalId(null);
            return;
        }

        setIsLoading(true);

        try {
            // 학생 로그인 세션 기준으로 본인만 구매된다 (서버에서 확인).
            const data = await buyItem({ itemId: buyList?.itemId });

            if (data.result === true) {
                toast.success('구매완료');

                mutate(
                    `/api/classData/${classId}`
                );
                mutate(
                    "/api/user",
                );
            } else {
                toast.error(data.message);
                if (data.message === '잔액부족') {
                    mutate(
                        "/api/user"
                    );
                } else {
                    mutate(
                        `/api/classData/${classId}`
                    );
                }
            }
        } catch (error) {
            toast.error('구매 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
            setModalId(null);
        }
    }


    const itemPrice = buyList?.itemPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const currentMoney = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return (
        <ModalTemplate id="BUY" modalId={modalId} setModalId={setModalId} className="w-[calc(100%-32px)] max-w-[520px]">
            {() => (
            <div className="p-[24px] min-[600px]:p-[48px] dark:bg-orange-200">
                <div className="flex justify-end">
                    <div className="w-[20px] h-[20px] mr-[8px]">
                    </div>
                    <div className="text-[0.9rem]">보유 {currencyName}: {currentMoney} {currencyEmoji} </div>
                </div>
                <div className="flex items-center">
                    <h1 className="text-[1.5rem] font-bold">{buyList?.itemName}</h1>
                    <div className="mx-[8px]">-</div>
                    <div className="text-[1.1rem] ">{itemPrice} {currencyName}</div>
                </div>
                <div>
                    <div className="text-[10rem] leading-none text-center my-[32px]">{buyList?.emoji}</div>
                </div>
                <div className="text-gray-500 mb-[32px]">
                    {buyList?.itemExplanation}
                </div>
                <div className="mb-[8px]">남는{currencyName}: </div>
                <div className="flex mb-[32px] flex-wrap">
                    <div>{currentMoney}{currencyName}</div>
                    <div className="mx-[8px]">-</div>
                    <div>{itemPrice}{currencyName}</div>
                    <div className="mx-[8px]">=</div>
                    {money - buyList?.itemPrice >= 0 ?
                        <div className="text-green-500">{left}{currencyName}</div> :
                        <div className="text-red-500">{left}{currencyName}</div>}
                </div>
                <div className={`mb-[32px] ${buyList?.itemStock < 3 ? "text-red-500 font-bold" : null}`}>남은 수량: {buyList?.itemStock}</div>
                <div className="text-[1rem] flex justify-between max-[600px]:flex-col">
                    <form onSubmit={onSubmit} className="w-[48%] max-[600px]:w-[100%]">
                        <button disabled={isLoading} className="w-[100%] max-[600px]:w-[100%] bg-orange-400 rounded-[5px] py-[8px] text-white max-[600px]:mb-[8px] outline-none hover:bg-orange-500 disabled:opacity-50">{isLoading ? "처리 중..." : "구입"}</button>
                    </form>
                    <button className="w-[48%] max-[600px]:w-[100%] bg-gray-200 rounded-[5px] py-[8px] hover:bg-gray-300" type="button" onClick={() => setModalId(null)}>취소</button>
                </div>
            </div>
            )}
        </ModalTemplate>

    )
}