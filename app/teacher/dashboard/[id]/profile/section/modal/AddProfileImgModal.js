'use client'
import ModalTemplate from "@/components/ui/common/ModalTemplate"


export default function AddProfileImgModal({ modalId, setModalId, onChangeProfileImg, onCreateProfileImg, setUrl, url, onAddModalClose }) {


    return (
        <ModalTemplate id="ADD_PROFILE" modalId={modalId} setModalId={setModalId} onClose={()=>setUrl(null)}>
            {({ close }) => (
                <div className="p-[24px] dark:bg-orange-100 flex flex-col bg-orange-100 max-w-[320px] rounded-lg p-6">
                    <div className="flex justify-between items-center mb-[16px]">
                        <h1 className="text-[1.6rem] ">프로필 이미지 등록하기</h1>
                        <a href="https://unique-wildcat-2d5.notion.site/1b327dcf545c80e3afb3d6000b98f3f5" target="_blank" rel="noopener noreferrer" className="rounded-full bg-orange-300 cursor-pointer w-[24px] h-[24px] flex justify-center items-center">
                            ?
                        </a>
                    </div>
                    <div className="w-full flex justify-center">
                        <div className="w-[190px] h-[190px] rounded-full bg-white flex justify-center items-center mb-[12px] overflow-hidden">

                            {url && <img src={url} width="190" height="190" alt="orange" />}

                        </div>
                    </div>
                    <h2 className="opacity-70 text-[1.1rem]">이미지 url 주소를 입력해주세요</h2>
                    <div className="mb-[16px]">
                        <input value={url || ""} onChange={onChangeProfileImg} className="w-full" />
                    </div>

                    <button onClick={onCreateProfileImg} className="btn w-full mb-[8px] bg-orange-300 hover:bg-orange-400">확인</button>

                    <button onClick={onAddModalClose} className="btn w-full bg-gray-300 hover:bg-gray-400">취소</button>
                </div>
            )}
        </ModalTemplate>


    )
}