'use client'
import { useFetchData } from "@/hooks/useFetchData";
import ProfileImgModal from "./widget/ProfileImgModal";
import TitleModal from "./widget/TitleModal";
import { useState } from "react";
import usePendingAction from "@/hooks/usePendingAction";
export default function Page({ classId }) {

    const { runAction, isPending } = usePendingAction();
    const {
        data: classData,
        isLoading: isClassLoading,
        isError: isClassError,
        error: classError,
        mutate: mutateClassData,
    } = useFetchData(classId ? `/api/classData/${classId}` : null);

    const {
        data: userData,
        isLoading: isUserLoading,
        isError: isUserError,
        error: userError,
        mutate: mutateUserData,
    } = useFetchData(`/api/user`);
    const [modalId, setModalId] = useState(null);
    const isLoading =
        isClassLoading ||
        isUserLoading


    const isError =
        isClassError ||
        isUserError



    if (isLoading) {
        return <div></div>;
    }

    if (isError) {
        return <div>데이터 로드 실패</div>;
    }



    const { startExp, commonDifference } = classData.expTable;
    const { currencyEmoji } = classData;
    const { exp, titles, money, profileNickname, profileState, profileTitle, profileUrl, classNumber } = userData;
    const findLargestSumUnderTarget = () => {
        if (userData && classData) {
            let k = Math.floor((-2 * startExp + commonDifference + Math.sqrt((2 * startExp - commonDifference) ** 2 + 8 * commonDifference * exp)) / (2 * commonDifference));
            let sumK = (k / 2) * (2 * startExp + (k - 1) * commonDifference);

            if (sumK > exp) {
                return k
            } else {
                return k + 1
            }
        }
    };

    const onUpdateTitle = (a) => {
        runAction("updateTitle", async () => fetch("/api/setProfileTitle", {
            method: "POST",
            body: JSON.stringify({ userId: userData.userId, profileTitle: a.title }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => {
            if (!res.ok) {
                alert('error')


                return;
            }

            return res.json()
        }).then((data) => {

            if (data.result === true) {


                mutate(
                    "/api/fetchUserData",
                    (prevItems) => {

                        return { ...prevItems, profileTitle: a.title };
                    },
                    false // 서버 요청 없이 즉시 반영
                );

            }

        }).catch((error) => {
            alert('error')
        }))
    }

    const onUpdateProfileImg = (e, a) => {
        runAction("updateProfileImg", async () =>
            fetch("/api/setProfileImg", {
                method: "POST",
                body: JSON.stringify({ userId: userData.userId, profileUrl: userData.profileImgStorage[a] }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => {
                if (!res.ok) {
                    alert('error')


                    return;
                }

                return res.json()
            }).then((data) => {

                if (data.result === true) {


                    mutate(
                        "/api/fetchUserData",
                        (prevItems) => {

                            return { ...prevItems, profileUrl: userData.profileImgStorage[a] };
                        },
                        false // 서버 요청 없이 즉시 반영
                    );

                }

            }).catch((error) => {

            })
        )   
    }
    return (

        <div className="flex justify-center py-[100px]">
            <div className="max-w-[352px] flex p-[8px] bg-green-400 justify-center rounded-xl">
                <div className="w-[352px] h-[500px] bg-orange-200 p-[16px] rounded-xl">
                    <div className="flex items-center justify-between">
                        <div >
                            <div className="text-[1.2rem]  flex justify-center items-center font-bold border-b-[6px] px-[4px] border-green-400">lv {findLargestSumUnderTarget()}</div>
                        </div>
                        <div className="bg-white rounded-full py-[8px] px-[16px]">
                            {currencyEmoji} {money}
                        </div>
                    </div>
                    <div className="flex justify-center flex-col items-center my-[16px]">
                        <div onClick={() => setModalId('PROFILE_SETTING')} className="border-[6px] border-white bg-white cursor-pointer transition-all hover:scale-105 w-[165px] h-[165px] mb-[16px] rounded-full bg-green-400 flex justify-center items-center overflow-hidden">
                            <img src={profileUrl} width="165" height="165" alt="orange" />
                        </div>

                        <div className="text-[1.6rem] ">{classNumber}. {profileNickname}</div>

                        <div onClick={() => setModalId('TITLE_SETTING')} className="cursor-pointer hover:scale-105 transition-all py-[4px] px-[32px] text-center text-[1.2rem]  bg-green-400 text-white font-bold rounded-lg">{profileTitle}</div>
                    </div>
                    <div className="w-full h-[134px] bg-white rounded-xl p-[8px]">{profileState}</div>
                </div>
            </div>
            <TitleModal userData={userData} modalId={modalId} setModalId={setModalId} titles={titles} onUpdateTitle={onUpdateTitle} />
            <ProfileImgModal userData={userData} modalId={modalId} setModalId={setModalId} onUpdateProfileImg={onUpdateProfileImg}/>
        </div>

    )
}