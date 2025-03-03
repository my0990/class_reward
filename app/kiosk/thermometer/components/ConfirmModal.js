'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function ConfirmModal({requestData}) {

    const route = useRouter();


    return (
        <dialog id="confirmModal" className="modal  modal-middle ">
            <div className="modal-box p-0 dark:bg-orange-200 p-[32px] flex flex-col bg-orange-100 max-w-[600px] ">
                <div className=" rounded-xl bg-orange-100 border-0 p-[16px] ">
                    <h1 className="text-[2rem]">기부하였습니다 </h1>
                    <div className="flex justify-between flex-col mt-[16px]">
                        <button className="bg-red-500  rounded-lg font-semibold hover:text-white transition-all text-black py-[16px] text-[1.4rem]" onClick={() => route.push('/kiosk')}>확인</button>
                    </div>
                </div>
            </div>

        </dialog>

    )
}