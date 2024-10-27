'use client'

import AddModal from "../components/addModal"
import DeleteModal from "../components/deleteModal"
import { useState, useRef } from "react"
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import ItemCard from "../components/ItemCard"
import { userDataState, sessionDataState } from '@/store/atoms';
import { useRecoilState } from "recoil";





export default function MarketTemplate() {
    const [userData, setUserData] = useRecoilState(userDataState);
    const [sessionData, setSessionData] = useRecoilState(sessionDataState);
    const { role } = sessionData.user
    const { currencyEmoji, currencyName } = userData.classData;
    const onDelete = (picked) => {
        setDeleteId(picked.itemId)
        setBuyList(picked)
        document.getElementById('delete').showModal()
    }
    const onBuy = (picked) => {
        document.getElementById('buy').showModal()
        setBuyList(picked)

    }

    const [deleteId, setDeleteId] = useState();
    const [itemList, setItemList] = useState(userData.itemList);
    const [buyList, setBuyList] = useState();
    const nodeRef = useRef();

    return (
        <div className="flex justify-center">
            <div className=" min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                <TransitionGroup noderef={nodeRef} className="flex p-[8px] flex-wrap">
                    {itemList?.map((a, i) =>
                    (
                        <CSSTransition
                            key={a.itemId}
                            timeout={600}
                            classNames="item"
                        >
                            <div className={`m-[16px] w-[192px] flex justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg ${a.itemQuantity <= 0 ? "cursor-default" : "hover:scale-110 transition-all cursor-pointer"}`} ref={nodeRef}>
                                {role === 'teacher'
                                    ? <ItemCard data={a} currencyName={currencyName} onClick={onDelete} />
                                    : <ItemCard data={a} currencyName={currencyName} onClick={a.itemQuantity <= 0 ? () => alert('품절되었습니다') : onBuy} />}

                            </div>

                        </CSSTransition>
                    )
                    )}
                    {role === 'teacher'
                        ? <div className="p-[16px] w-[192px] h-[300px] justify-center items-center flex cursor-pointer font-bold rounded-lg m-[16px]  relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg hover:scale-110 transition-all" onClick={() => document.getElementById('add').showModal()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path style={{ fill: "orange" }} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
                            </svg>
                        </div>
                        : null}
                </TransitionGroup>
                <AddModal itemList={itemList} setItemList={setItemList} />
                <DeleteModal deleteId={deleteId} itemList={itemList} setItemList={setItemList} buyList={buyList} currencyName={currencyName} />

            </div>
        </div>
    )
}