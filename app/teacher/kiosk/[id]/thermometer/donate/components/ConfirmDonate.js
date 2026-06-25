
import { useState } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { donate } from "@/server-action/actions/thermometer/thermometer.action";
import usePendingAction from "@/hooks/usePendingAction";
import { Toaster, toast } from "react-hot-toast";
export default function ConfirmDonate({ requestData, setRequestData, classId }) {
    const {
        data: classData,
        isLoading: isClassDataLoading,
        isError: isClassDataError,
        mutate: mutateClassData,
    } = useFetchData(`/api/classData/${classId}`);

    const {
        data: thermometerData,
        isLoading: isThermometerDataLoading,
        isError: isThermometerDataError,
        mutate: mutateThermometerData,
    } = useFetchData(`/api/thermometer/${classId}`);
    const { data: studentData, isLoading: isStudentDataLoading, isError: isStudentDataError, mutate: mutateStudentData, } = useFetchData(`/api/students/${classId}`);
    const { runAction, isPending } = usePendingAction();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const { userData } = requestData;

    const [donateCookie, setDonateCookie] = useState("");

    const isDataLoading = isClassDataLoading || isThermometerDataLoading;
    const isError = isClassDataError || isThermometerDataError;

    if (isDataLoading) return <div>불러오는 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;
    const { userId, money } = requestData.userData;

    const { currencyName = "호박", currencyEmoji = "🎃" } = classData;

    const donateAmount = Number(donateCookie || 0);
    const balance = money - donateAmount;
    const isEmpty = donateAmount <= 0;
    const addNumber = (num) => {
        setDonateCookie((prev) => {
            const next = prev === "" || prev === "0" ? String(num) : prev + num;
            const nextNumber = Number(next);

            if (nextNumber > money) {
                return String(money);
            }

            return String(nextNumber);
        });
    };

    const removeNumber = () => {
        setDonateCookie((prev) => prev.slice(0, -1));
    };

    const clearNumber = () => {
        setDonateCookie("");
    };

    const handleDonateConfirm = async ({ userId, amount, money, classId, degree }) => {

        runAction("handleDonateConfirm", async () => {
            const data = await donate({ userId, amount, money, classId, degree });

            if (!data.result) {
                toast.error(data.message || "수정 실패");
                return;
            }
            alert('기부하였습니다')
            clearNumber();
            await mutateThermometerData?.();
            await mutateStudentData?.();
            router.push(`/teacher/kiosk/${classId}`);


        })

    }


    const keyList = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <div className="min-h-screen   overflow-y-auto p-[8px]">
            <div className="w-full max-w-[650px] mx-auto">
                <div className="flex justify-between items-center mb-[6px]">
                    <div>
                        <div className="text-[1.2rem] font-bold text-orange-500 leading-tight">
                            {userData.profileNickname} ({userData.userId})
                        </div>
                    </div>

                    <Link href={`/teacher/kiosk/${classId}`}>
                        <div className="cursor-pointer text-[1.2rem] font-bold bg-white px-[12px] py-[5px] rounded-full ">
                            처음으로
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-[20px] mt-[8px]  p-[12px]">
                    <div className="flex flex-col">
                        <div className="text-[1.5rem] font-extrabold text-gray-800 text-center">
                            기부할 {currencyName} 입력
                        </div>
                        <div className="w-full bg-orange-50 rounded-[16px] py-[24px] px-[12px] text-center mb-[10px]">
                            <div className="text-[2.8rem]  font-black text-red-500 leading-none">
                                {currencyEmoji} {donateAmount.toLocaleString()}
                            </div>
                            <div className="text-gray-500 mt-[8px]">
                                학급 온도 {((donateAmount / thermometerData.requireCurrency)).toFixed(3)}도 상승
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-[5px] mb-[10px]">
                            {keyList.map((num) => (
                                <button
                                    key={num}
                                    onPointerUp={() => addNumber(num)}
                                    className="h-[58px] bg-orange-100 text-orange-700 rounded-[14px] text-[1.7rem] font-black active:scale-95"
                                >
                                    {num}
                                </button>
                            ))}

                            <button
                                onPointerUp={clearNumber}
                                className="h-[58px] bg-gray-100 text-gray-500 rounded-[14px] text-[0.85rem] font-black active:scale-95"
                            >
                                전체삭제
                            </button>

                            <button
                                onPointerUp={() => addNumber(0)}
                                className="h-[58px] bg-orange-100 text-orange-700 rounded-[14px] text-[1.7rem] font-black active:scale-95"
                            >
                                0
                            </button>

                            <button
                                onPointerUp={removeNumber}
                                className="h-[58px] bg-gray-100 flex justify-center items-center text-gray-500 rounded-[14px] text-[0.85rem] font-black active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>

                            </button>
                        </div>
                        <div className="w-full text-[1.5rem] mt-[16px] mb-[10px]">
                            <div className="flex justify-between mb-[4px]">
                                <div>보유 금액</div>
                                <div>
                                    {money.toLocaleString()} {currencyName}
                                </div>
                            </div>

                            <div className="flex justify-between border-b border-gray-300 pb-[4px] mb-[4px]">
                                <div>기부 금액</div>
                                <div className="text-red-500 font-bold">
                                    -{donateAmount.toLocaleString()} {currencyName}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>잔액</div>

                                <div className="text-[1.5rem] font-black text-orange-500">
                                    {balance.toLocaleString()} {currencyName}
                                </div>
                            </div>
                        </div>

                        <button
                            onPointerUp={() =>
                                handleDonateConfirm({
                                    userId,
                                    amount: donateAmount,
                                    money,
                                    classId,
                                    degree: ((donateAmount / thermometerData.requireCurrency)).toFixed(3)
                                })
                            }
                            disabled={isLoading || isEmpty}
                            className={`w-full rounded-full py-[11px] text-[1.2rem] font-extrabold text-white ${isLoading || isEmpty
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 active:scale-95"
                                }`}
                        >
                            {isLoading ? "기부 중..." : "기부하기"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}