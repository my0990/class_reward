

export default function StudentProfileCard({urlData, urlId, setModalData, currencyName, profileUrlObj}) {
    const onClick = () => {
        document.getElementById('profileBuy').showModal();
        setModalData((prev)=> ({...prev, urlData: urlData, urlId: urlId}))
    }
 
    return (
        // profileUrlObj[urlId]
        // ?
        // <div  className={`transition-all border-[12px]  flex justify-center items-center overflow-hidden w-[300px] h-[300px] m-[8px] rounded-lg`}>
        //     <img src={urlData.url} width="370" height="370" alt="profileImg" className="opacity-30"/>
        //     <div className="absolute text-[2rem] text-orange-500 font-bold">
        //         보유중
        //     </div>
        // </div>
        // :
        <div onClick={onClick} className="cursor-pointer hover:scale-110 transition-all m-[16px] w-[192px] h-[300px] flex flex-col justify-center items-center relative bg-orange-200 shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg">
            <div className="w-[160px] h-[160px] border-[8px] border-white rounded-full bg-white flex justify-center items-center mb-[12px] overflow-hidden">
                <img src={urlData.url} width="200" height="200" alt="profileImg" />
            </div>
            <div className="text-[1.4rem] mt-[40px] mr-[24px] flex w-full justify-end">{urlData.price} {currencyName}</div>
        </div>

    )
}