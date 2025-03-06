'use client'

import StudentProfileCard from "./component/StudentProfileCard"
import ProfileBuyModal from "./component/ProfileBuyModal";
import { useState, useEffect } from "react";
import { fetchData } from "@/hooks/swrHooks";

export default function StudentProfileTemplate({ }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');

    const [pickedData, setPickedData] = useState({});
    const [filterdData,setFilteredData] = useState([]);

    useEffect(()=>{
        console.log('use Effect')
        console.log('use Effect')
        console.log('use Effect')
        console.log('use Effect')
        if(classData && userData){
            const updatedClassItems = Object.keys(classData.profileImgStorage).map(key => {
                const classItem = classData.profileImgStorage[key];
              
                // 유저가 이 아이템을 가지고 있으면, 'owned' 키 추가
                if (userData.profileImgStorage[key]) {
                  return {
                    ...classItem,
                    owned: true, // 유저가 가진 아이템에 "owned" 키를 추가
                    urlId: key
                  };
                } else {
                    return {
                    ...classItem,
                    owned: false,
                    urlId: key
                    }
                }
              
                // 유저가 아이템을 가지고 있지 않으면 원래 아이템 그대로 반환
              });
              console.log(updatedClassItems)
              console.log(updatedClassItems)
              console.log(updatedClassItems)
              console.log(updatedClassItems)
              setFilteredData(updatedClassItems)
        }
    },[userData, classData])


    if (isClassLoading || isUserLoading) return <div>Loading data...</div>;
    if (isClassError || isUserError) return <div>Error loading data</div>;

    const { currencyName } = classData;
    if (Object.keys(classData.profileImgStorage).length === 0) {
        return (
            <div className="text-[2rem] text-center mt-[16px]">
                등록된 프로필 이미지가 없습니다.
            </div>
        )
    }
    


    return (

        <div className="flex flex-wrap justify-center">
            <div className="flex justify-center">
                <div className="min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                    <div className="flex p-[8px] flex-wrap">
                        {filterdData?.map((a, i) => (
                            < StudentProfileCard key = { i } setPickedData = { setPickedData } profileImgData = {a} currencyName={currencyName} />
                        ))}
                    </div>
                    <ProfileBuyModal pickedData={pickedData} currencyName={currencyName} userId={userData.userId} money={userData.money} />
                </div>
            </div>

        </div>
    )
}