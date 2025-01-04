'use client'
import ProfileSetModal from "./ProfileSetModal"
import ProfileCard from "./profileCard"
import { userDataState } from "@/store/atoms";
import { useRecoilState } from "recoil";
import { useState, useEffect } from 'react';
export default function ProfileTemplate({ urlObj }) {
    const [userData, setUserData] = useRecoilState(userDataState);
    const [url, setUrl] = useState([]);
    const [modalData, setModalData] = useState({ isActive: null, price: null, url: null });
    useEffect(() => {
        let tmpUrlObj = urlObj;
        console.log(tmpUrlObj)
        if (userData.profileUrlObj !== undefined) {
            let tmpUrlArr = Object.keys(userData.profileUrlObj)
            for (let index = 0; index < tmpUrlArr.length; index++) {
                tmpUrlObj[tmpUrlArr[index]].isActive = userData.profileUrlObj[tmpUrlArr[index]].isActive;
                tmpUrlObj[tmpUrlArr[index]].price = userData.profileUrlObj[tmpUrlArr[index]].price;
            }

        }
        setUrl(tmpUrlObj)
    }, [userData])


    return (
        <div className="flex flex-wrap justify-center">
            {Object.keys(url).map((a, i) => {
                return (
                    <ProfileCard key={i} urlData={url[a]} urlId={a} setModalData={setModalData} />
                )
            })}
            <ProfileSetModal modalData={modalData} setModalData={setModalData} setUrl={setUrl} url={url}/>
        </div>
    )
}