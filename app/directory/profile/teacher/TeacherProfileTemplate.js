'use client'
import AddProfileImgModal from "./component/AddProfileImgModal"
import ProfileCard from "./component/profileCard"
import { useState, useEffect, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { fetchData } from "@/hooks/swrHooks";
import EditProfileImgModal from "./component/EditProfileImgModal";


export default function TeacherProfileTemplate({ urlObj }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = fetchData('/api/fetchUserData');

    const [url, setUrl] = useState([]);
    const [modalData, setModalData] = useState({ isActive: null, price: null, url: null, urlId: null });




    const nodeRef = useRef();
    // useEffect(() => {
    //     let tmpUrlObj = urlObj;
    //     console.log(tmpUrlObj)
    //     if (userData.profileUrlObj !== undefined) {
    //         let tmpUrlArr = Object.keys(userData.profileUrlObj)
    //         for (let index = 0; index < tmpUrlArr.length; index++) {
    //             tmpUrlObj[tmpUrlArr[index]].isActive = userData.profileUrlObj[tmpUrlArr[index]].isActive;
    //             tmpUrlObj[tmpUrlArr[index]].price = userData.profileUrlObj[tmpUrlArr[index]].price;
    //         }

    //     }
    //     setUrl(tmpUrlObj)
    // }, [userData])

    if (isClassLoading || isUserLoading) return <div>Loading data...</div>;
    if (isClassError || isUserError) return <div>Error loading data</div>;
    const { currencyName, currencyEmoji } = classData;
    return (
        <div className="flex flex-wrap justify-center">
            {/* {Object.keys(url).map((a, i) => {
                return (
                    <ProfileCard key={i} urlData={url[a]} urlId={a} setModalData={setModalData} />
                )
            })} */}
            <div className="flex justify-center">
                <div className=" min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                    <div className="flex p-[8px] flex-wrap">
                        {classData?.profileImgStorage && Object.keys(classData?.profileImgStorage)?.map((a, i) =>
                        (
                            <ProfileCard setModalData={setModalData} urlData={classData?.profileImgStorage[a]} urlId={a} currencyName={currencyName} />
                        )
                        )}
                        <div className="p-[16px] w-[192px] h-[300px] justify-center items-center flex cursor-pointer font-bold rounded-lg m-[16px]  relative bg-orange-100 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg hover:scale-110 transition-all" onClick={() => document.getElementById('addProfileImg').showModal()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path style={{ fill: "orange" }} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
                            </svg>
                        </div>
                    </div>

                    {/* <DeleteModal pickedItem={pickedItem} currencyName={currencyName} /> */}
                </div>
            </div>
            <AddProfileImgModal />
            <EditProfileImgModal modalData={modalData} currencyEmoji={currencyEmoji} />
            {/* <ProfileSetModal modalData={modalData} setModalData={setModalData} setUrl={setUrl} url={url} /> */}
        </div>
    )
}