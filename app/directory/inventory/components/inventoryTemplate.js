'use client'

import UseModal from "./useModal"
import { useState } from "react"
export default function Inventory({data, userId, teacher, userName}) {
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
                            <th>가격</th>
                            <th>남은 <br></br>수량</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((a, i) => {
                            return (
                                <tr className="hover" key={i}>
                                    <th className="max-[443px]:hidden">{i}</th>
                                    <th>{a.itemName}</th>
                                    <td>{a.itemPrice}</td>
                                    <td>1개</td>
                                    <td className="flex justify-center">
                                        {a.state === "사용 가능"?
                                        <button className="btn bg-red-500 text-white" onClick={()=>onClick(a)}>사용</button>
                                    :<button className={`${a.state === "대기중" ? "bg-green-500 hover:bg-green-400 cursor-default" : 'btn-disabled'} btn `}>{a.state}</button>
                                }

                                    </td>
                                </tr>
                            )
                        })}


                    </tbody>

                </table>
                <UseModal item={item} userId={userId} teacher={teacher} userName={userName}/>
            </div>
        </div>
    )
}