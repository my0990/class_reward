

export default function StudentProfileCard({urlData, urlId, setProfileData, profileUrlObj}) {
    const onClick = () => {
        document.getElementById('profileBuy').showModal();
        setProfileData((prev)=> ({...prev, urlData: urlData, urlId: urlId}))
    }

    return (
        profileUrlObj[urlId]
        ?
        <div  className={`transition-all border-[12px]  flex justify-center items-center overflow-hidden w-[300px] h-[300px] m-[8px] rounded-lg`}>
            <img src={urlData.url} width="370" height="370" alt="profileImg" className="opacity-30"/>
            <div className="absolute text-[2rem] text-orange-500 font-bold">
                보유중
            </div>
        </div>
        :
        <div onClick={onClick} className={`hover:scale-105 cursor-pointer transition-all border-[12px]  flex justify-center items-center overflow-hidden w-[300px] h-[300px] m-[8px] rounded-lg`}>
            <img src={urlData.url} width="370" height="370" alt="profileImg" />
        </div>

    )
}