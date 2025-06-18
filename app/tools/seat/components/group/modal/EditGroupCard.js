
export default function EditGroupCard({data, onEdit, isAdd}) {
    return (
        <div className="flex bg-white p-[16px] w-[280px] m-[16px] rounded-2xl cursor-pointer " onClick={(e) => onEdit(e,data,isAdd)}>
            <div className="avatar">
                <div className="w-14 rounded-full">
                    <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                </div>
            </div>
            <div className="ml-[24px] ">
                <div className="text-[1.4rem] truncate overflow-hidden">{data.classNumber}. {data.profileNickname}</div>
                <div className="text-[1.1rem] text-gray-400">{data.profileTitle}</div>
            </div>
        </div>
    )
}