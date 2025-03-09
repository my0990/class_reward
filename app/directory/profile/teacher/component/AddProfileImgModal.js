'use client'
import { useState } from "react";
import { mutate } from "swr";


export default function AddProfilImgModal() {
    const [url, setUrl] = useState(null);

    const onCloseModal = () => {
        document.getElementById('addProfileImg').close()
        setUrl("");
    }
    const onChange = (e) => {
        setUrl(e.target.value)
    }


    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = (e) => {
        e.preventDefault();
        if (url === null) {
            alert('url을 입력해주세요')
            return
        }
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/addProfileImg", {
                method: "POST",
                body: JSON.stringify({ data: url }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    document.getElementById('addProfileImg').close()
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {
                            const updatedProfileImgObj = {...prev.profileImgStorage, [data.itemId]: {price: 99999, url: url}}

                            return { ...prev, profileImgStorage: updatedProfileImgObj }
                        },
                        false // 서버 요청 없이 즉시 반영
                    );
                    setUrl("");
                } else {
                    alert('error!!')
                }
                setIsLoading(false)
            },
            )
        }

    }

    return (
        <dialog id="addProfileImg" className="modal  modal-middle ">
            <div className="modal-box p-[24px] dark:bg-orange-100 flex flex-col bg-orange-100 max-w-[320px]">
                <div className="flex justify-between items-center mb-[16px]">
                    <h1 className="text-[1.6rem] ">프로필 이미지 등록하기</h1>
                    <a href="https://www.notion.so/example-guide" target="_blank" rel="noopener noreferrer" className="rounded-full bg-orange-300 cursor-pointer w-[24px] h-[24px] flex justify-center items-center">
                        ?
                    </a>
                </div>
                <div className="w-full flex justify-center">
                    <div className="w-[190px] h-[190px] rounded-full bg-white flex justify-center items-center mb-[12px] overflow-hidden">
                        {/* <Image src={male}/> */}
                        {url && <img src={url} width="190" height="190" alt="orange" />}
                        {/* <img src="https://i.postimg.cc/HLXdVT11/orange.png"></img> */}
                    </div>
                </div>
                <h2 className="opacity-70 text-[1.1rem]">이미지 url 주소를 입력해주세요</h2>
                <div className="mb-[16px]">
                    <input value={url || ""} onChange={onChange} className="w-full" />
                    {/* <button className="border-b-4 " onClick={onClick}>입력</button> */}
                </div>
                <form onSubmit={onSubmit}>
                    <button className="btn w-full mb-[8px] bg-orange-300 hover:bg-orange-400">확인</button>
                </form>
                <button onClick={onCloseModal} className="btn w-full bg-gray-300 hover:bg-gray-400">취소</button>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>

    )
}