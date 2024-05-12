'use client'

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
export default function Profile({profileNickname,profileState}) {
        
    const [profileContent,setProfileContent] = useState({nickname: profileNickname, state: profileState})
    const onChange = (e) => {
        const {name,value} = e.target
        setProfileContent({...profileContent, [name]: value })
    }
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/profileEdit", {
            method: "POST",
            body: JSON.stringify(profileContent),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json()).then((data) => {
            if (data.result === true) {
                alert('수정하였습니다')
                location.reload();
            }
        })
    }
    return (
        <div className="flex p-[20px] min-[600px]:p-[40px] max-[601px]:w-[100%] justify-center">
            <div className="text-[1.1rem] w-[280px]">
                <h1 className="text-[2rem] mb-[24px]">프로필</h1>
                <div className="avatar w-[100%] justify-center cursor-pointer">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                    </div>
                </div>
                <h2 className="mt-[24px]">프로필 별명</h2>
                <input className="border-2 w-[100%] focus:outline-orange-500" name="nickname" value={profileContent.nickname} onChange={onChange}/>
                <h2 className="mt-[24px]">프로필 상태 메시지</h2>
                <textarea className="border-2 w-[100%] focus:outline-orange-500" name="state" value={profileContent.state} onChange={onChange}/>
                <form onSubmit={onSubmit}>
                    <button className="btn bg-orange-500 text-white block border-0 mt-[24px] w-[100%]">확인</button>
                </form>
            </div>
        </div>
    )
}