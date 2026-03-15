import ModalTemplate from "@/components/ui/common/ModalTemplate";
export default function TitleModal({ titles, modalId, setModalId, onUpdateTitle }) {



    return (

        <ModalTemplate id="TITLE_SETTING" modalId={modalId} setModalId={setModalId} onClose={() => console.log('close')}>
            {({ close }) => {
                return (
                    <div className="p-6 rounded-lg bg-orange-200 max-w-[800px]">
                        <h1 className="text-[2rem] font-bold mb-[8px]">칭호 선택</h1>
                        <div className="flex flex-wrap">
                            {titles.map((a, i) => {
                                return (
                                    <div key={i} onClick={(e) => onUpdateTitle(a)} className="m-[8px] cursor-pointer hover:scale-105 transition-all py-[4px] px-[32px] text-center text-[1.2rem]  bg-green-400 text-white font-bold rounded-lg">
                                        {a.title}
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