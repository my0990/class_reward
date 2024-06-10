'use client'

import AddModal from "./addModal"
import BuyModal from "./buyModal"
import DeleteModal from "./deleteModal"
import { useState, useRef } from "react"
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';

export default function MarketTemplate({ data, role, money }) {

    const onDelete = (picked) => {
        setDeleteId(picked.itemId)
        setBuyList(picked)
        document.getElementById('my_modal_3').showModal()

    }
    const onBuy = (picked) => {
        document.getElementById('my_modal_3').showModal()
        setBuyList(picked)

    }

    const [deleteId, setDeleteId] = useState();
    const [itemList, setItemList] = useState([...data]);
    const [buyList, setBuyList] = useState();
    const nodeRef = useRef();
    return (
        <div className="flex justify-center">
            <div className="overflow-x-auto w-[1024px]">
                <TransitionGroup noderef={nodeRef} className="flex p-[8px] flex-wrap">
                    {itemList?.map((a, i) =>
                    (
                        <CSSTransition
                            key={a.itemId}
                            timeout={600}
                            classNames="item"
                        >
                            <div className="m-[16px] flex justify-center items-center relative bg-orange-100  rounded-lg" ref={nodeRef}>
                                {role === 'teacher' ? <>
                                    <button className="text-[1.2rem] cursor-pointer p-[16px]" onClick={() => onDelete(a)}>{a.itemName}</button></> :
                                    <button className="text-[1.2rem] cursor-pointer p-[16px]" onClick={() => onBuy(a)}>{a.itemName}</button>}
                            </div>
                        </CSSTransition>
                    )
                    )}
                </TransitionGroup>

                {role === 'teacher' ? <div className="h-[73px] dark:bg-gray-700  w-full flex justify-center items-center bg-white  cursor-pointer" onClick={() => document.getElementById('my_modal_2').showModal()}>
                    <div ><svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path style={{fill:"orange"}} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" /></svg></div>
                </div> : null}
                <AddModal itemList={itemList} setItemList={setItemList} />
                {role === 'teacher' ? <DeleteModal deleteId={deleteId} itemList={itemList} setItemList={setItemList} buyList={buyList} /> : <BuyModal buyList={buyList} setItemList={setItemList} itemList={itemList} money={money} />}
            </div>

        </div>
    )
}