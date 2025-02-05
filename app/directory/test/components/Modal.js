import { useState, useEffect } from "react";


import { fetchData } from "@/hooks/swrHooks";

export default function DetailModal({ picked, isDetailClicked }) {

    const [data, setData] = useState([]);
    const userId = picked?.userId;

    const { data: historyData, isLoading: isHistoryLoading, isError: isHistoryError } = fetchData(`/api/fetchUserData/test`);
    console.log('historyData: ', historyData)
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

                  
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}