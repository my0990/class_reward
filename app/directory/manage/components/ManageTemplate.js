'use client'
import character from "@/public/character.jpeg"
import Image from "next/image"
import ResetModal from "./ResetModal"
import { useState } from "react"
export default function ManageTemplate({ data, teacher }) {
    const [picked,setPicked] = useState(null);
    const onClick = (a) => {
        document.getElementById('my_modal_2').showModal();
        setPicked(a)
    }
    return (
        <div>
            <div className="overflow-x-auto flex justify-center">
                <table className="table max-w-[800px]">
                    <thead>

                        <tr className="text-center">
                            <th></th>
                            <th className="p-[8px]">이름</th>
                            <th className="p-[8px]">아이디</th>
                            <th className="p-[8px]"></th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {/* row 1 */}
                        {data.map((a, i) => {
                            return (
                                <tr>
                                    <td className="p-[8px]">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <Image src={character} alt="character" width={180} height={160} priority={true} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-[8px]">
                                        <div className="flex items-center gap-3 justify-center">

                                            <div>
                                                <div className="font-bold">{a.userName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-[8px]">
                                        {a.userId}
                                    </td>
                                    <th className="p-[8px]">
                                        <button onClick={(e) => onClick(a)} className="btn bg-red-500 border-0 text-white text-[0.8rem]">비밀번호<br />초기화</button>
                                    </th>
                                </tr>
                            )
                        })}


                    </tbody>


                </table>
            </div>

            <ResetModal picked={picked} teacher={teacher}/>
        </div>
    )
}