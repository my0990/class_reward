'use client'

import AddModal from "./addModal"
import BuyModal from "./buyModal"
import DeleteModal from "./deleteModal"
import { useState, useRef } from "react"
import {
    CSSTransition,
    TransitionGroup,
  } from 'react-transition-group';

export default function MarketTemplate({data, role}) {
    const nodeRef = useRef();
    const onDelete = (id) => {
        document.getElementById('my_modal_3').showModal()
        setDeleteId(id)
    }
    const onBuy = (picked) => {
        document.getElementById('my_modal_3').showModal()
        setBuyList(picked)
        console.log(picked)
    }
    const [deleteId,setDeleteId] = useState();
    const [itemList, setItemList] = useState([...data]);
    const [buyList,setBuyList] = useState();
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


                    <TransitionGroup component="tbody">
                        {itemList?.map((a, i) => 
                             (

                                <CSSTransition
                                    key={a.id}
                                    timeout={600}
                                    classNames="item"
                                    >

                                <tr className="hover" >
                                    <th className="max-[443px]:hidden">{i}</th>
                                    <th>{a.name}</th>
                                    <td>{a.price}</td>
                                    <td>{a.quantity}개</td>
                                    <td className="flex justify-center">
                                        
                                        {role === 'teacher' ? <>
                                        {/* <button className="btn mr-0 min-[443px]:mr-1 min-[443px]:mb-2 bg-orange-300">수정</button> */}
                                    <button className="btn bg-red-500 text-white" onClick={() => onDelete(a.id)}>삭제</button></> :  <button className="btn bg-orange-300" onClick={() => onBuy(a)}>구입</button>}
                                    
                                    </td>
                                </tr>

                                </CSSTransition>

                            )
                        )}


                    </TransitionGroup>
                </table>

                {role === 'teacher' ?  <div className="h-[73px] w-full flex justify-center items-center hover:bg-gray-100 cursor-pointer" onClick={()=>document.getElementById('my_modal_2').showModal()}>
                    <div ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" /></svg></div>
                </div> : null}
                <AddModal itemList={itemList} setItemList={setItemList}/>
                {role==='teacher' ? <DeleteModal deleteId={deleteId} itemList={itemList} setItemList={setItemList}/> : <BuyModal buyList={buyList} setItemList={setItemList} itemList={itemList}/>}
            </div>

        </div>
    )
}