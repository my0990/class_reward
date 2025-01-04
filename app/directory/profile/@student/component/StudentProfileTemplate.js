'use client'
import { userDataState } from "@/store/atoms";
import { useRecoilState } from "recoil";
import StudentProfileCard from "./StudentProfileCard"
import ProfileBuyModal from "./ProfileBuyModal";
import { useState, useEffect } from "react";
export default function StudentProfileTemplate({data}) {
    const [userData, setUserData] = useRecoilState(userDataState);
    const [profileData,setProfileData] = useState({urlData: undefined, urlId: undefined});

    const {profileUrlObj} = userData;
    console.log(userData)
    return(
        <div className="flex flex-wrap justify-center">
            {Object.keys(data).map((a,i)=>{
                return(
                <StudentProfileCard key={i} profileUrlObj={profileUrlObj} urlData={data[a]} urlId={a} setProfileData={setProfileData}/>
                )
            })}
            <ProfileBuyModal profileData={profileData} setUserData={setUserData}/>
        </div>
    )
}