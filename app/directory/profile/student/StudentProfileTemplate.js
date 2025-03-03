'use client'

import StudentProfileCard from "./component/StudentProfileCard"
import ProfileBuyModal from "./component/ProfileBuyModal";
import { useState, useEffect } from "react";
import { fetchData } from "@/hooks/swrHooks";

export default function StudentProfileTemplate({ }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');

    const [modalData, setModalData] = useState({ urlData: undefined, urlId: undefined });

    // const {profileUrlObj} = userData;
    if (isClassLoading || isUserLoading) return <div>Loading data...</div>;
    if (isClassError || isUserError) return <div>Error loading data</div>;

    const { currencyName, currencyEmoji } = classData;
    if (!classData.profileImgStorage || Object.keys(classData.profileImgStorage).length === 0) {
        return (
            <div className="text-[2rem] text-center mt-[16px]">
                등록된 프로필 이미지가 없습니다.
            </div>
        )
    }
    return (
        // <div className="flex flex-wrap justify-center">
        //     {Object.keys(classData.profileImgStorage).map((a,i)=>{
        //         return(
        //         <StudentProfileCard key={i}  urlData={classData.profileImgStorage[a]} urlId={a} setProfileData={setProfileData}/>
        //         )
        //     })}
        //     {/* <ProfileBuyModal profileData={profileData} setUserData={setUserData}/> */}
        // </div>
        <div className="flex flex-wrap justify-center">
            <div className="flex justify-center">
                <div className="min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                    <div className="flex p-[8px] flex-wrap">
                        {classData?.profileImgStorage && Object.keys(classData?.profileImgStorage)?.map((a, i) =>
                        (
                            <StudentProfileCard key={i} setModalData={setModalData} urlData={classData?.profileImgStorage[a]} urlId={a} currencyName={currencyName} />
                        )
                        )}

                    </div>
                    <ProfileBuyModal modalData={modalData} currencyName={currencyName} userId={userData.userId} money={userData.money}/>
                </div>
            </div>
        </div>
    )
}