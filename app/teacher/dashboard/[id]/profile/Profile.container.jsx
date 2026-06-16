'use client'
import UpdateProfileImgModal from "./section/modal/UpdateProfileImgModal";
import AddProfileImgModal from "./section/modal/AddProfileImgModal";
import ProfileCard from "./widget/profileCard";
import { useState, useRef, useEffect } from 'react';
import { useParams } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
import { Toaster, toast } from "react-hot-toast";
import usePendingAction from "@/hooks/usePendingAction";
import { createProfileImg, updateProfileImg, deleteProfileImg } from "@/server-action/actions/profile/profile.action";

export default function ProfileContainer() {
    const params = useParams();
    const classId = params.id;
    const { runAction, isPending } = usePendingAction();
    const { data: classData, isLoading: isClassDataLoading, isError: isClassDataError, mutate: mutateClassData, } = useFetchData(`/api/classData/${classId}`);
    // const { data: studentsData, isLoading: isStudentsDataLoading, isError: isStudentsDataError } = useFetchData(`/api/students/${classId}`);
    // const { data: userData, isLoading: isUserDataLoading, isError: isUserDataError } = useFetchData(`/api/user`);

    const [modalData, setModalData] = useState({ isActive: null, price: null, url: null, urlId: null });
    const [modalId, setModalId] = useState(null);


    const [url, setUrl] = useState(null);

    const onAddModalClose = () => {
        setModalId(null);
        setUrl("");
    }
    const onChangeProfileImg = (e) => {
        setUrl(e.target.value)
    }


    const onCreateProfileImg = () => {
        if (url === null) {
            alert('url을 입력해주세요')
            return
        }
        runAction("createProfileUrl", async () => {
            const data = await createProfileImg({
                createdProfileImgUrl: url,
                classId: classId
            });

            if (!data.result) {
                toast.error(data.message || "프로필 이미지 등록 실패");
                return;
            }

            await mutateClassData?.();
            setModalId(null)
            setUrl(null);
            toast.success("프로필 이미지 등록 완료");
        })

    }

    const [isEdited, setIsEdited] = useState(false);






    const onPriceChange = (e) => {
        if (isEdited === false) {
            setIsEdited(true)
        }
        if (/^[0-9]\d*$/.test(e.target.value) || e.target.value === '') {
            setModalData(prev => ({ ...prev, price: e.target.value }))
        }

    }

    const onUpdateModalClose = () => {

        setModalId(null)

        setTimeout(() => {
            // setProfilePrice(modalData?.price);
            setIsEdited(false);
        }, 250)
    }

    const onUpdateProfileImg = (e) => {
        runAction("updateProfileUrl", async () => {
            if (!modalData.price) {

                toast.error("가격을 입력해주세요");
                return;
            }
            const data = await updateProfileImg({
                url: modalData.url,
                classId: classId,
                price: modalData.price,
                urlId: modalData.urlId
            });

            if (!data.result) {
                toast.error(data.message || "프로필 이미지 수정 실패");
                return;
            }


            await mutateClassData?.();
            setModalId(null);
            setIsEdited(false);
            toast.success("프로필 이미지 수정 완료");
        })
    }

    const onDeleteProfileImg = async (e) => {
        runAction("deleteProfileUrl", async () => {
            const data = await deleteProfileImg({
                urlId: modalData.urlId,
                classId: classId
            });

            if (!data.result) {
                toast.error(data.message || "프로필 이미지 삭제 실패");
                return;
            }

            await mutateClassData?.();
            setModalId(null)
            toast.success("프로필 이미지 삭제 완료");
        })
    }



    const onCardClick = (e, urlData, urlId) => {
        console.log(urlId)
        setModalId('UPDATE_PROFILE')
        setModalData((prev) => ({
            ...prev,
            ...urlData,
            urlId: urlId
        }))
    }

    const isLoading =
        isClassDataLoading


    const isError =
        isClassDataError


    if (isLoading) {
        return <div>불러오는 중...</div>;
    }

    if (isError) {
        return <div>데이터 로드 실패</div>;
    }
    const { currencyName, currencyEmoji } = classData;
    return (
        <div className="flex flex-wrap justify-center">
            <div className="flex justify-center">
                <div className=" min-[1136px]:w-[1136px] min-[912px]:w-[912px] min-[688px]:w-[688px] min-[464px]:w-[464px] w-[240px]">
                    <div className="flex p-[8px] flex-wrap">
                        {classData?.profileImgStorage && Object.keys(classData?.profileImgStorage)?.map((a, i) => {
                            const urlData = classData?.profileImgStorage[a]
                            return (
                                <div key={a}>
                                    <ProfileCard onClick={e => onCardClick(e, urlData, a)} urlData={urlData} urlId={a} currencyName={currencyName} />
                                </div>
                            )
                        }


                        )}
                        <div className="p-[16px] w-[192px] h-[300px] justify-center items-center flex cursor-pointer font-bold rounded-lg m-[16px]  relative bg-orange-100 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg hover:scale-110 transition-all" onClick={() => setModalId("ADD_PROFILE")}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path style={{ fill: "orange" }} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <AddProfileImgModal {...{ modalId, setModalId, onChangeProfileImg, onCreateProfileImg, url, onAddModalClose, setUrl }} />
            <UpdateProfileImgModal {...{ setIsEdited, modalData, currencyEmoji, modalId, setModalId, onPriceChange, onUpdateProfileImg, onDeleteProfileImg, onUpdateModalClose, isEdited }} />
            <Toaster position="bottom-right" />
        </div>
    )
}