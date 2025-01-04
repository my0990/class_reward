

export default function ProfileCard({ urlData, setModalData, urlId}) {

    const onClick = () => {
        document.getElementById('profileSet').showModal();
        setModalData((prev)=>({
            ...prev,
            isActive: urlData.isActive,
            price: urlData.price,
            urlId: urlId,
            url: urlData.url
        }))
    }
    return (
        <div onClick={onClick} style={{borderColor: urlData.isActive ? '#00b51a' : 'lightgray'}} className={`hover:scale-105 cursor-pointer transition-all border-[12px]  flex justify-center items-center overflow-hidden w-[300px] h-[300px] m-[8px] rounded-lg`}>
            <img src={urlData.url} width="370" height="370" alt="profileImg" />
        </div>

    )
}