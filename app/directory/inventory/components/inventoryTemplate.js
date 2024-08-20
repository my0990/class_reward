'use client'

import UseModal from "./useModal"
import { useState } from "react"
export default function Inventory({data, userId, teacher, userName, userMoney}) {
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
                            <th className="max-[443px]:hidden dark:text-white"></th>
                            <th className="dark:text-white">아이템 <br></br>이름</th>
                            <th className="dark:text-white">가격</th>
                            <th className="dark:text-white">남은 <br></br>수량</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((a, i) => {
                            return (
                                <tr className="hover:bg-gray-400" key={i}>
                                    <th className="max-[443px]:hidden dark:text-white">{i}</th>
                                    <th className="dark:text-white">{a.itemName}</th>
                                    <td className="dark:text-white">{a.itemPrice}</td>
                                    <td className="dark:text-white">1개</td>
                                    <td className="flex justify-center">
                                        <button className="btn bg-red-500 text-white border-0" onClick={()=>onClick(a)}>사용</button>
                                    </td>
                                </tr>
                            )
                        })}


                    </tbody>

                </table>
                <UseModal item={item} userId={userId} teacher={teacher} userName={userName} userMoney={userMoney}/>
            </div>
        </div>
    )
}