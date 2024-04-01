'use client'

import { useState } from "react"
import NotificationModal from "./notificationModal";
export default function NotificationTemplate({data, userId}) {
    const [item,setItem] = useState();
    const onClick = (a) => {
        document.getElementById('my_modal_3').showModal()
        setItem(a)
    }
    return (
        <div className=" flex justify-center">
            <div className="overflow-x-auto w-[1024px]">
                <table className="table">
                    {/* head */}
                    <thead>
                        <tr >
                            <th className="max-[443px]:hidden"></th>
                            <th>아이템 <br></br>이름</th>
                            <th>사용자</th>
                            <th></th>
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
                                        {a.state === '대기중' ? <button className="btn bg-red-500 text-white" onClick={()=>onClick(a)}>승인</button> :
                            <button className="btn btn-disabled">사용 완료</button>
                        }
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <NotificationModal item={item} userId={userId}/>
            </div>
        </div>
    )
}