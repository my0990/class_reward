
export default function ProfileCard({ urlData, currencyName, setModalData, urlId, setIsEditModalOpen }) {

    const onClick = () => {
        document.getElementById('edit').showModal();
        setIsEditModalOpen(true)
        setModalData((prev)=>({
            ...prev,
            isActive: urlData.isActive,
            price: urlData.price,
            urlId: urlId,
            url: urlData.url
        }))
    }
    
    return (
        <div onClick={onClick} className={`cursor-pointer hover:scale-110 transition-all m-[16px] w-[192px] h-[300px] flex flex-col justify-center items-center relative ${urlData.isActive ? "bg-orange-200" : "bg-gray-100"} shadow-[4.4px_4.4px_1.2px_rgba(0,0,0,0.15)] rounded-lg`}>
            <div className="w-[160px] h-[160px] border-[8px] border-white rounded-full bg-white flex justify-center items-center mb-[12px] overflow-hidden">
                <img src={urlData.url} width="200" height="200" alt="profileImg" />
            </div>
            <div className="text-[1.4rem] mt-[40px] mr-[24px] flex w-full justify-end">{urlData.price} {currencyName}</div>
        </div>

    )
}