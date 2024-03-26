'use client'

import UseModal from "./useModal"
import { useState } from "react"
export default function Inventory({data, user, teacher}) {
    const [item,setItem] = useState();
    const onClick = (a) => {
        document.getElementById('my_modal_3').showModal()
        console.log(a)
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
                                    <th>{a.name}</th>
                                    <td>{a.price}</td>
                                    <td>1개</td>

                                    <td className="flex justify-center">
                                        <button className="btn bg-red-500 text-white" onClick={()=>onClick(a)}>사용</button>
                                        {/* <button className="btn mr-0 min-[443px]:mr-1 min-[443px]:mb-2 bg-orange-300">수정</button>
                                    <button className="btn bg-red-300">삭제</button> */}
                                    </td>
                                </tr>
                            )
                        })}


                    </tbody>

                </table>
                <UseModal item={item} user={user} teacher={teacher}/>
            </div>
        </div>
    )
}