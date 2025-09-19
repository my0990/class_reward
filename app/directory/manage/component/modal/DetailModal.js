import { useState } from "react";
import CardTemplate from "../card/CardTemplate";
import { mutate } from "swr";
import { fetchData } from "@/hooks/swrHooks";

export default function DetailModal({ picked, startExp, commonDifference }) {
    const [rotation, setRotation] = useState(0);

    const userId = picked?.userId;

    const { data: historyData, isLoading: isHistoryLoading, isError: isHistoryError } = fetchData(userId ? `/api/fetchHistory/${userId}` : null);

    const onRefresh = () => {
        setRotation((prev) => prev + 360);
        mutate(`/api/fetchHistory/${userId}`)
    }

    function dateFormat(date) {
        if (!date) {
            return
        }
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        month = month >= 10 ? month : '0' + month;
        day = day >= 10 ? day : '0' + day;
        hour = hour >= 10 ? hour : '0' + hour;
        minute = minute >= 10 ? minute : '0' + minute;
        second = second >= 10 ? second : '0' + second;

        return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    }

    return (
        <div>
            <dialog id="my_modal_4" className="modal">
                <div className="modal-box max-w-[850px] flex justify-between flex-wrap max-[870px]:max-w-[400px]">
                    <div className=" max-w-[352px] flex p-[8px] bg-green-400 justify-center rounded-xl">
                        <CardTemplate picked={picked} startExp={startExp} commonDifference={commonDifference} />
                    </div>
                    <div className="w-[400px] h-[500px] overflow-auto " >
                        <div className="flex justify-between items-center mb-[16px]">
                            <h1 className="text-[1.8rem]  font-bold">화폐 및 아이템 사용 기록</h1>
                            <div onClick={onRefresh} style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.5s ease-in-out" }} className="mr-[16px] cursor-pointer hover:scale-105 transition-all" >
                                <svg width="32px" height="32px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="none" fillRule="evenodd" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" transform="matrix(0 1 1 0 2.5 2.5)"> <path d="m3.98652376 1.07807068c-2.38377179 1.38514556-3.98652376 3.96636605-3.98652376 6.92192932 0 4.418278 3.581722 8 8 8s8-3.581722 8-8-3.581722-8-8-8"></path> <path d="m4 1v4h-4" transform="matrix(1 0 0 -1 0 6)"></path> </g> </g></svg>
                            </div>
                        </div>
                        {isHistoryLoading
                            ? <div>Loading data...</div>
                            : isHistoryError
                                ? <div>Error loading data</div>
                                :
                                <table className="table ">
                                    <thead>
                                        <tr className="text-center">
                                            <th>내용</th>
                                            <th>돈</th>
                                            <th>잔액</th>
                                            <th>날짜</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyData.map((a, i) => {
                                            return (
                                                <tr key={i} className="text-center border-none">
                                                    <td>{a.name}</td>
                                                    <td>
                                                        <span className={`${a.type === 'deposit' ? "text-green-500" : "text-red-500"}`}>
                                                            {a.amount === 0 ? null : a.type === 'deposit' ? "+" : "-"}{a.amount === 0 ? null : a.amount}
                                                        </span>
                                                    </td>
                                                    <td>{a.balance}</td>
                                                    <td>{dateFormat(new Date(a.date))}</td>
                                                </tr>
                                            )
                                        })}

                                    </tbody>
                                </table>
                        }
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}