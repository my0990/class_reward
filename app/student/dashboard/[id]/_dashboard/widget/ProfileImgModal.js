import ModalTemplate from "@/components/ui/common/ModalTemplate";
export default function ProfileImgModal({ userData, modalId, setModalId, onClick }) {


    return (


        <ModalTemplate id="PROFILE_SETTING" modalId={modalId} setModalId={setModalId} onClose={() => console.log('close')}>
            {({ close }) => {
                return (
                    <div className="p-6 rounded-lg bg-orange-200 max-w-[772px] max-[842px]:w-[595px] max-[643px]:w-[420px] ">
                        <h1 className="text-[2rem] font-bold mb-[8px]">프로필 이미지 선택</h1>
                        <div className="flex flex-wrap">
                            {Object.keys(userData.profileImgStorage).length === 0 ?
                                <div className="text-[1.4rem]">선택가능한 프로필 이미지가 없습니다</div>
                                : userData && Object.keys(userData.profileImgStorage).map((a, i) => {
                                return (
                                    <div key={i} onClick={(e) => { onClick(e, a) }} className="m-[8px] border-8 bg-white border-white cursor-pointer transition-all hover:scale-105 w-[165px] h-[165px] mb-[16px] rounded-full  flex justify-center items-center overflow-hidden">
                                        <img src={userData.profileImgStorage[a]} width="165" height="165" alt="orange" className="object-fill" />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            }}
        </ModalTemplate>

    )
}