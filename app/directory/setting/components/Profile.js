'use client'
import male from "@/public/male.png"
import female from "@/public/female.png"
import { useState, useMemo } from "react";
import Image from "next/image";
export default function Profile({ profileNickname, profileState, profileUrl }) {

    const [profileContent, setProfileContent] = useState({ nickname: profileNickname, state: profileState })
    const onChange = (e) => {
        const { name, value } = e.target
        setProfileContent({ ...profileContent, [name]: value })
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
                    {useMemo(() => {
                        return (
                            <div className="w-24 rounded-full ring ring-primary cursor-default ring-offset-base-100 ring-offset-2">
                                <img src="https://i.postimg.cc/HLXdVT11/orange.png" width="90" height="90" alt="characther" />
                            </div>
                        )
                    }, [])}

                </div>
                <h2 className="mt-[24px]">프로필 별명</h2>
                <input className="border-2 w-[100%] focus:outline-orange-500" name="nickname" value={profileContent.nickname} onChange={onChange} />
                <h2 className="mt-[24px]">프로필 상태 메시지</h2>
                <textarea className="border-2 w-[100%] focus:outline-orange-500" name="state" value={profileContent.state} onChange={onChange} />
                <form onSubmit={onSubmit}>
                    <button className="btn bg-orange-500 text-white block border-0 mt-[24px] w-[100%]">확인</button>
                </form>
            </div>
        </div>
    )
}