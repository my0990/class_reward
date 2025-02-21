import { useState, useEffect } from "react";
import CardTemplate from "../card/CardTemplate";

import { fetchData } from "@/hooks/swrHooks";

export default function DetailModal({ picked }) {


    const userId = picked?.userId;

    const { data: historyData, isLoading: isHistoryLoading, isError: isHistoryError } = fetchData(userId ? `/api/fetchHistory/${userId}` : null);

    // useEffect(() => {
    //     if(isDetailClicked === false){
    //         return
    //     }
    //     const fetchData = async () => {
    //         const response = await fetch('/api/fetchHistory', {
    //             method: "POST",
    //             body: JSON.stringify({ userId: userId }),
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //         })
    //         const result = await response.json();

    //         if (result.result) {
    //             setData(result.data)
    //         }
    //     };
    //     fetchData();
    // }, [picked]);

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
                        <CardTemplate picked={picked} />
                    </div>
                    <div className="w-[400px] h-[500px] overflow-auto" >
                        <h1 className="text-[1.8rem] mb-[16px] font-bold">화폐 및 아이템 사용 기록</h1>
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