import { useState } from "react";
import { mutate } from "swr";
export default function ProfileImgModal({ userData }) {
    // console.log(userDat)
    const [isLoading,setIsLoading] = useState(false);
    const onSubmit = (e, a) => {
        e.preventDefault();

        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/setProfileImg", {
                method: "POST",
                body: JSON.stringify({  userId: userData.userId, profileUrl: userData.profileImgStorage[a]}),
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

                            return {... prevItems, profileUrl: userData.profileImgStorage[a]};
                        },
                        false // 서버 요청 없이 즉시 반영
                    );
    
                }

            }).catch((error) => {
                console.log('error occured')
                console.log(error)
            })
        }
        document.getElementById('profileImgModal').close();
        setIsLoading(false)
    }
    return (
        //     <div onClick={()=>document.getElementById('profileImgModal')?.showModal()} className="cursor-pointer transition-all hover:scale-105 w-[165px] h-[165px] mb-[16px] rounded-full bg-green-400 flex justify-center items-center overflow-hidden">
        //     <img src={userData.profileUrl} width="150" height="150" alt="orange" className="rounded-full"/>
        // </div>

        <dialog id="profileImgModal" className="modal">
            <div className="modal-box bg-orange-200 max-w-[772px] max-[842px]:w-[595px] max-[643px]:w-[420px] ">
                <h1 className="text-[2rem] font-bold mb-[8px]">프로필 이미지 선택</h1>
                <div className="flex flex-wrap">
                    {userData && Object.keys(userData.profileImgStorage).map((a, i) => {
                        return (
                            // <div className="w-[165px] h-[165px] mb-[16px] rounded-full bg-green-400 flex justify-center items-center overflow-hidden">
                            //     <img src={userData.profileImgStorage[a]} width="150" height="150" alt="orange" className=""/>
                            // </div>
                            <div onClick={(e)=>{onSubmit(e,a)}} className="m-[8px] border-8 bg-white border-white cursor-pointer transition-all hover:scale-105 w-[165px] h-[165px] mb-[16px] rounded-full  flex justify-center items-center overflow-hidden">
                                <img src={userData.profileImgStorage[a]} width="165" height="165" alt="orange" className="object-fill" />
                            </div>
                        )
                    })}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

    )
}