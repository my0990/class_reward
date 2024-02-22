'use client'

import AddModal from "./components/addModal"
import BuyModal from "./components/buyModal"
export default function Market() {
    let data = [{ name: '자리바꾸기', price: 5000 }, { name: '급식 1등으로 가기', price: 300 }, { name: '사탕 1개', price: 30 }]
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
                        {data.map((a, i) => {
                            return (
                                <tr className="hover" key={i}>
                                    <th className="max-[443px]:hidden">{i}</th>
                                    <th>{a.name}</th>
                                    <td>{a.price}</td>
                                    <td>1개</td>

                                    <td className="flex justify-center">
                                        <button className="btn bg-orange-300" onClick={()=>document.getElementById('my_modal_3').showModal()}>구입</button>
                                        {/* <button className="btn mr-0 min-[443px]:mr-1 min-[443px]:mb-2 bg-orange-300">수정</button>
                                    <button className="btn bg-red-300">삭제</button> */}
                                    </td>
                                </tr>
                            )
                        })}


                    </tbody>

                </table>
                <div className="h-[73px] w-full flex justify-center items-center hover:bg-gray-100 cursor-pointer" onClick={()=>document.getElementById('my_modal_2').showModal()}>
                    <div ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" /></svg></div>
                </div>
                <AddModal />
                <BuyModal />
            </div>
        </div>
    )
}