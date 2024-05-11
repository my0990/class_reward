'use client'
import Password from "./Password";
import Profile from "./Profile"
import { useState } from "react"
export default function SettingTemplate() {
    const [isProfile, setIsProfile] = useState(true);
    return (
        <div className="flex ">
            <div className="flex flex-wrap justify-center ">
                <div className="w-[160px] m-[20px] min-[600px]:m-[40px] min-[602px]:border-r-2 max-[601px]:border-b-2 max-[601px]:w-[280px] max-[601px]:justify-center">
                    <h1 className={`text-[1.5rem] font-bold`}>Settings</h1>
                    <h2 onClick={()=>setIsProfile(true)} className={`cursor-pointer text-[1.1rem] mt-[32px]`}><span className={`${isProfile ? "border-b-4 border-orange-500" : null}`}>Profile</span></h2>
                    <h2 onClick={()=>setIsProfile(false)} className={`cursor-pointer text-[1.1rem] mt-[16px] max-[600px]:mb-[40px] `}><span className={`${!isProfile ? "border-b-4 border-orange-500" : null}`}>Account</span></h2>
                </div>
                <div className="max-[561px]:w-[100%] flex justify-center">
                    {isProfile ? <Profile /> : <Password />}

                </div>
            </div>
        </div>
    )
}