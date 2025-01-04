'use client'
import male from "@/public/male.png"
import female from "@/public/female.png"
import { useState, useMemo } from "react";
import Image from "next/image";
import ProfileImgSettingModal from "./ProfileImgSettingModal";
import { useRecoilState } from 'recoil';
import { userDataState } from '@/store/atoms';


export default function Profile({ }) {
    const [userData, setUserData] = useRecoilState(userDataState);
    const { profileNickname, profileState, profileUrl, profileUrlObj } = userData;
    console.log(userData)

    const onChange = (e) => {
        const { name, value } = e.target
        setUserData(prev => ({ ...prev, [name]: value }))
    }
    const onSubmit = (e) => {
        e.preventDefault();
        fetch("/api/profileEdit", {
            method: "POST",
            body: JSON.stringify({nickname: profileNickname, state: profileState, profileUrl: profileUrl}),
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

    const onClick = (a) => {

        setUserData(prev => ({ ...prev, profileUrl: a }))
        console.log(userData)
    }
    return (
        <div className="flex p-[20px] min-[600px]:p-[40px] max-[601px]:w-[100%] justify-center">
            <div className="text-[1.1rem] w-[280px]">
                <h1 className="text-[2rem] mb-[24px]">프로필</h1>
                <div className="avatar w-[100%] justify-center">
                    {/* {useMemo(() => {
                        return (
                            <div onClick={() => document.getElementById('profileSetModal').showModal()} className="hover:scale-105 transition-all w-24 rounded-full ring ring-primary cursor-default ring-offset-base-100 ring-offset-2 cursor-pointer">
                                <img src={profileUrl} width="90" height="90" alt="characther" />
                            </div>
                        )
                    }, [])} */}
                    <div onClick={() => document.getElementById('profileSetModal').showModal()} className="hover:scale-105 transition-all w-24 rounded-full ring ring-primary cursor-default ring-offset-base-100 ring-offset-2 cursor-pointer">
                        {profileUrl ? <img src={profileUrl} width="90" height="90" alt="characther" /> : <div></div>}
                    </div>
                </div>
                <h2 className="mt-[24px]">프로필 별명</h2>
                <input className="border-2 w-[100%] focus:outline-orange-500" name="profileNickname" value={profileNickname} onChange={onChange} />
                <h2 className="mt-[24px]">프로필 상태 메시지</h2>
                <textarea className="border-2 w-[100%] focus:outline-orange-500" name="profileState" value={profileState} onChange={onChange} />
                <form onSubmit={onSubmit}>
                    <button className="btn bg-orange-500 text-white block border-0 mt-[24px] w-[100%]">확인</button>
                </form>
            </div>
            <ProfileImgSettingModal profileUrlObj={profileUrlObj} setUserData={setUserData} userData={userData} />
        </div>
    )
}