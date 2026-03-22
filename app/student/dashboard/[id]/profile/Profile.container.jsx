'use client'

import ProfileCard from "./widget/ProfileCard"
import ProfileBuyModal from "./section/ProfileBuyModal";
import { useState, useEffect } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import { useParams } from "next/navigation";
import usePendingAction from "@/hooks/usePendingAction";
import { buyProfileImg } from "@/server-action/actions/profile/profile.action";
import { Toaster, toast } from "react-hot-toast";

export default function ProfileContainer({ }) {
    const params = useParams();
    const classId = params.id;
    const { runAction, isPending } = usePendingAction();
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = useFetchData(`/api/classData/${classId}`);
    const { data: userData, isLoading: isUserLoading, isError: isUserError, mutate: mutateUserData } = useFetchData('/api/user');
    const [modalId, setModalId] = useState(null);
    const [pickedData, setPickedData] = useState({ price: null, url: null });



    if (isClassLoading || isUserLoading) return <div>Loading data...</div>;
    if (isClassError || isUserError) return <div>Error loading data</div>;

    const { currencyName } = classData;
    const { money, userId } = userData;
    if (!classData.profileImgStorage || Object.keys(classData.profileImgStorage).length === 0) {
        return (
            <div className="text-[2rem] text-center mt-[16px]">
                등록된 프로필 이미지가 없습니다.
            </div>
        )
    }

    const onBuyModalOpen = (e, a) => {
        setModalId("BUY_PROFILE")
        const data =  classData?.profileImgStorage[a]
        setPickedData(prev => ({ ...prev, url: data.url, price: data.price, urlId: a }))
    }
    const onBuyModalClose = () => {
        setModalId(null);
        setPickedData({ price: null, url: null })
    }

    const onBuyProfileImg = (e) => {
        if (pickedData.price > money) {
            alert('잔액이 부족합니다')
            return
        }
        runAction("buyProfileImg", async () => {
            const data = await buyProfileImg({
                pickedData: pickedData,
                classId: classId,
                userId: userId,
                balance: pickedData.price - money

            });

            if (!data.result) {
                toast.error(data.message || "프로필 이미지 구입 실패");
                return;
            }

            await mutateUserData?.();
            setModalId(null);
            toast.success("프로필 이미지 구입 완료");
        })
    }

    return (

        <div className="flex flex-wrap justify-center">
            <div className="flex justify-center">
                <div className="min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                    <div className="flex p-[8px] flex-wrap">
                        {Object.keys(classData?.profileImgStorage).map((a, i) => {
                            const owned = userData?.profileImgStorage && userData?.profileImgStorage[a] ? true : false
                            return (
                                < ProfileCard key={i} owned={owned} onClick={e => onBuyModalOpen(e, a)} profileImgData={classData?.profileImgStorage[a]} currencyName={currencyName} />
                            )

                        })}
                    </div>
                    <ProfileBuyModal  {...{ pickedData, onBuyModalClose, currencyName, userId, money, modalId, setModalId, onBuyProfileImg }} />
                </div>
            </div>
            <Toaster position="bottom-right" />
        </div>
    )
}