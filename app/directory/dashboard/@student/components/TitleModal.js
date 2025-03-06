import { useState } from "react"
import { mutate } from "swr";

export default function TitleModal({ userData }) {
    console.log(userData)
    const [isLoading,setIsLoading] = useState(false);
    const onSubmit = (a) => {

        console.log(a)
        console.log(a)
        console.log(a)
        console.log(a.title)
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/setProfileTitle", {
                method: "POST",
                body: JSON.stringify({ userId: userData.userId, profileTitle: a.title}),
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
                console.log('error occured')
                console.log(error)
            })

        }
        document.getElementById('profileTitleModal').close();
        setIsLoading(false)
    }
    return (


        <dialog id="profileTitleModal" className="modal">
            <div className="modal-box bg-orange-200 max-w-[800px]">
                <h1 className="text-[2rem] font-bold mb-[8px]">칭호 선택</h1>
                <div className="flex flex-wrap">
                    {userData.titles.map((a, i) => {
                        return (
                            // <div className="w-[165px] h-[165px] mb-[16px] rounded-full bg-green-400 flex justify-center items-center overflow-hidden">
                            //     <img src={userData.profileImgStorage[a]} width="150" height="150" alt="orange" className=""/>
                            // </div>
                            <div onClick={(e)=>onSubmit(a)} className="m-[8px] cursor-pointer hover:scale-105 transition-all py-[4px] px-[32px] text-center text-[1.2rem]  bg-green-400 text-white font-bold rounded-lg">
                                {a.title}
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