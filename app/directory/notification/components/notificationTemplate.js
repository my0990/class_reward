'use client'

import { useState } from "react"
import NotificationModal from "./notificationModal";
import { useRouter } from "next/navigation";
export default function NotificationTemplate({ data, userId }) {
    const router = useRouter();
    const [item, setItem] = useState();
    const onClick = (a) => {
        document.getElementById('my_modal_3').showModal()
        setItem(a)
    }
    const onSubmit = (e,a) => {
        e.preventDefault();
        fetch("/api/deleteNotification  ", {
            method: "POST",
            body: JSON.stringify({ item: a }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            console.log(data)
            if (data.result === true) {


                // const newItemList = itemList.map((a,i)=> a.id === buyList.id ? console.log(a.quantity) : null)



                router.refresh();
            }
        })
    }
    return (
        <div className=" flex justify-center">
            <div className="overflow-x-auto w-[1024px]">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr>
                            <th className="max-[443px]:hidden"></th>
                            <th>아이템 <br></br>이름</th>
                            <th>사용자</th>
                            <th className="flex justify-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((a, i) => {
                            return (
                                <tr className="hover" key={i}>
                                    <th className="max-[443px]:hidden">{i}</th>
                                    <th>{a.itemName}</th>
                                    <td>{a.userName}</td>
                                    <td className="flex justify-center">
                                        {a.state === '대기중'
                                            ? <button className="btn bg-green-500 text-white" onClick={() => onClick(a)}>승인</button>
                                            :
                                            <form onSubmit={(e) => onSubmit(e,a)}>
                                                <button className="btn bg-red-500 text-white">삭제</button>
                                            </form>
                                        }
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <NotificationModal item={item} userId={userId} />

            </div>
        </div>
    )
}