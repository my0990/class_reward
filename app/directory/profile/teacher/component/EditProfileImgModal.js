import { useEffect, useState, useRef } from "react";
import { mutate } from "swr";
export default function EditProfileImgModal({ modalData, currencyEmoji, isFirstRender, setIsEditModalOpen }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [profilePrice, setProfilePrice] = useState('');
    const [isProfileActive, setIsProfileActive] = useState(false);


    const spanRef = useRef(null);
    const inputRef = useRef(null);

    const onCheckboxChange = (e) => {
        if (isEdited === false) {
            setIsEdited(true)
        }
        setIsProfileActive(e.target.checked)
    }
    const onChange = (e) => {
        if (isEdited === false) {
            setIsEdited(true)
        }
        if (/^[0-9]\d*$/.test(e.target.value) || e.target.value === '') {
            setProfilePrice(e.target.value)
        }

    }

    const onCloseModal = () => {

        document.getElementById('edit').close();
        setIsEditModalOpen(false);

        setTimeout(() => {
            // setProfilePrice(modalData?.price);
            setIsEdited(false);
        }, 250)
    }

    const onDelete= (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/deleteProfileImg", {
                method: "POST",
                body: JSON.stringify({ modalData: modalData, }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    setIsLoading(false);
                    mutate('/api/fetchClassData');
                    document.getElementById('edit').close();
                }
            })
        }

    }
    const onModify = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            fetch("/api/modifyProfileImg", {
                method: "POST",
                body: JSON.stringify({ modalData: modalData, price: profilePrice, isActive: isProfileActive  }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    setIsLoading(false);
                    mutate('/api/fetchClassData');
                    document.getElementById('edit').close();
                }
            })
        }
    }
    useEffect(() => {
        if (modalData) {
            setIsProfileActive(modalData.isActive);
            setProfilePrice(modalData.price);
        }
    }, [modalData])

    useEffect(() => {
        if (spanRef.current && inputRef.current) {
            inputRef.current.style.width = `${spanRef.current.offsetWidth + 20}px`;
        }
    }, [profilePrice]);

    useEffect(()=>{
        inputRef.current.blur();
    },[])

    return (
        <dialog id="edit" className="modal  modal-middle ">
            <div className={`${isProfileActive ? " bg-orange-200 dark:bg-orange-200" : "bg-gray-300 dark:bg-gray-300"} modal-box p-[24px]  flex flex-col bg-orange-100 max-w-[320px] overflow-hidden`}>
                <div className="flex justify-between items-center mb-[16px]">
                    <h1 className="text-[1.6rem] ">프로필 이미지 삭제 및 수정</h1>
                </div>
                <div className="w-full flex justify-center">
                    <div className="w-[190px] h-[190px] rounded-full border-[12px] border-white bg-white flex justify-center items-center mb-[16px] overflow-hidden">
                        {/* <Image src={male}/> */}
                        {modalData?.url && <img src={modalData?.url} width="190" height="190" alt="orange" />}
                        {/* <img src="https://i.postimg.cc/HLXdVT11/orange.png"></img> */}
                    </div>
                </div>
                <div className="text-[1.2rem] mb-[16px]">
                    <div className="flex justify-between mb-[8px] ">
                        <div>가격</div>
                        <div className="flex border-b-4 border-orange-400 cursor-pointer">
                            <div>{currencyEmoji} </div>
                            <input ref={inputRef} tabIndex="-1" className="bg-transparent  outline-none min-w-[32px] text-center max-w-[200px]" value={profilePrice || 0} onChange={onChange} />
                        </div>
                        <span ref={spanRef} style={{ visibility: "hidden", position: "absolute", whiteSpace: "pre" }}>
                            {profilePrice || " "}
                        </span>
                    </div>
                    <div className="flex justify-between" >
                        공개 <input type="checkbox" className={`toggle toggle-success ${isFirstRender ? "transition-none" : "transition"}`} checked={isProfileActive || false} onChange={onCheckboxChange } />
                    </div>
                </div>
                {isEdited
                    ? <form onSubmit={onModify}>
                        <button className="btn w-full border-0 mb-[8px] bg-orange-400 hover:bg-orange-500">수정</button>
                    </form>
                    : <form onSubmit={onDelete}>
                        <button className="btn w-full border-0 mb-[8px] bg-orange-400 hover:bg-orange-500">삭제</button>
                    </form>}

                <button className="btn w-full border-0 bg-gray-300 hover:bg-gray-400">취소</button>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCloseModal}>
                <button>close</button>
            </form>
        </dialog>

    )
}