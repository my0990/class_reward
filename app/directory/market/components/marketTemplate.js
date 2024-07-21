'use client'

import AddModal from "./addModal"
import BuyModal from "./buyModal"
import DeleteModal from "./deleteModal"
import { useState, useRef } from "react"
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import ItemCard from "./ItemCard"
export default function MarketTemplate({ userData, role, itemListInit, currencyName, currencyEmoji }) {
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
    const [itemList, setItemList] = useState(itemListInit);
    const [buyList, setBuyList] = useState();
    const nodeRef = useRef();
    return (
        <div className="flex justify-center">
            {/* 1136  912 688 464 240*/}
            <div className=" min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                <TransitionGroup noderef={nodeRef} className="flex p-[8px] flex-wrap">
                    {itemList?.map((a, i) =>
                    (
                        <CSSTransition
                            key={a.itemId}
                            timeout={600}
                            classNames="item"
                        >
                            <div className="m-[16px] w-[192px]   flex justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg hover:scale-110 transition-all" ref={nodeRef}>
                                {/* {role === 'teacher' ? <>
                                    <button className="text-[1.2rem] cursor-pointer p-[16px]" onClick={() => onDelete(a)}>{a.itemName}</button></> :
                                    <button className="text-[1.2rem] cursor-pointer p-[16px]" onClick={() => onBuy(a)}>{a.itemName}</button>} */}
                                {role === 'teacher'
                                    ? <ItemCard data={a} currencyName={currencyName} onClick={onDelete} />
                                    : <ItemCard data={a} currencyName={currencyName} onClick={onBuy} />}

                            </div>
                            {/* box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px; */}
                        </CSSTransition>
                    )
                    )}
                    {role === 'teacher'
                        ? <div className="p-[16px] w-[192px] justify-center items-center flex cursor-pointer font-bold rounded-lg m-[16px]  relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg hover:scale-110 transition-all" onClick={() => document.getElementById('my_modal_2').showModal()}>

                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path style={{ fill: "orange" }} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
                                </svg>
                                

                        </div>
                        : null}
                </TransitionGroup>

                {/* {role === 'teacher' ? <div className="h-[73px] dark:bg-gray-700  w-full flex justify-center items-center bg-white  cursor-pointer" onClick={() => document.getElementById('my_modal_2').showModal()}>
                    <div ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path style={{ fill: "orange" }} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" /></svg></div>
                </div> : null} */}
                <AddModal itemList={itemList} setItemList={setItemList} />
                {role === 'teacher'
                    ? <DeleteModal deleteId={deleteId} itemList={itemList} setItemList={setItemList} buyList={buyList} currencyName={currencyName} />
                    : <BuyModal buyList={buyList} setItemList={setItemList} itemList={itemList} money={userData?.money} currencyName={currencyName} currencyEmoji={currencyEmoji} />}
            </div>

        </div>
    )
}