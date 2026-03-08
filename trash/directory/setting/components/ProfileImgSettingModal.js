

'use client'
import { useState, useEffect } from "react"
export default function ProfileImgSettingModal({ profileUrlObj, setUserData, userData }) {

    // const onSubmit = (e) => {
    //     e.preventDefault();
    //     fetch("/api/addQuest", {
    //         method: "POST",
    //         body: JSON.stringify(quest),
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     }).then((res) => res.json()).then((data) => {
    //         if (data.result === true) {
    //             alert('등록하였습니다')
    //             location.reload();
    //         }
    //     })
    // }
    useEffect(()=>{
        setUserData(prev => ({...prev, profileUrlObj: {"0000": "https://i.postimg.cc/HLXdVT11/orange.png", ...prev.profileUrlObj, }}))
    },[])
    const onClick = (a) => {

        setUserData(prev=> ({...prev, profileUrl: a}))
        document.getElementById('profileSetModal').close()
    }

    return (
        <dialog id="profileSetModal" className="modal  w-[100%]">

            <div className="modal-box max-w-[740px] p-[32px] border-0  text-red-900 text-[1.2rem]">
                <div className="flex  flex-col ">
                    <h1 className="mb-[16px] text-orange-500  text-[1.5rem]">사용할 프로필 이미지를 선택해주세요</h1>
                    <div className="flex flex-wrap justify-center">
                        {Object.values(profileUrlObj).map((a, i) => {
                            return (
                                <div  key={i} >
                                    <img onClick={() => onClick(a)} src={a} width="200" height="200" alt="profileImg" className="cursor-pointer m-[10px] rounded-lg hover:scale-105 transition-all"/>
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={() => document.getElementById('profileSetModal').close()} className="btn mt-[16px] text-[1.2rem] w-[100%] bg-white border-0 shadow-transparent focus:outline-none hover:bg-orange-500 hover:text-white text-orange-500 m-auto">취소</button>
                </div>
            </div>


            <form method="dialog" className="modal-backdrop" onClick={() => document.getElementById('profileSetModal').close()}>
                <button>close</button>
            </form>
        </dialog>
    )
}