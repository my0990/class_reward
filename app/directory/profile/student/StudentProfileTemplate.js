'use client'
import { userDataState } from "@/store/atoms";
import { useRecoilState } from "recoil";
import StudentProfileCard from "./component/StudentProfileCard"
import ProfileBuyModal from "./component/ProfileBuyModal";
import { useState, useEffect } from "react";
export default function StudentProfileTemplate({data}) {
    const [userData, setUserData] = useRecoilState(userDataState);
    const [profileData,setProfileData] = useState({urlData: undefined, urlId: undefined});

    const {profileUrlObj} = userData;
    console.log('student template')
    console.log('student template')
    console.log('student template')
    console.log('student template')
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