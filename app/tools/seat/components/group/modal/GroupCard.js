export default function GroupCard({setIsListPage, groupData, setSelectedGroup, groupKey}) {
    const onClick = () => {
        setSelectedGroup({groupKey: groupKey, selectedGroup: groupData});
        setIsListPage(false)
    } 
    return (
        <div className="w-[190px] h-[160px] bg-white flex flex-col cursor-pointer justify-between rounded-lg p-[16px] m-[16px]" onClick={onClick}>
            <div className="flex justify-between items-center">
                <h1 className="text-[1.4rem]">{groupData.groupName}</h1>
                <div className="rounded-full bg-orange-500 w-[24px] h-[24px]"></div>
            </div>
            <div>
                <div className="avatar-group -space-x-6">
                    <div className="avatar">
                        <div className="w-8">
                            <img src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
                        </div>
                    </div>
                    <div className="avatar">
                        <div className="w-8">
                            <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                        </div>
                    </div>
                    <div className="avatar">
                        <div className="w-8">
                            <img src="https://img.daisyui.com/images/profile/demo/averagebulk@192.webp" />
                        </div>
                    </div>
                    <div className="avatar">
                        <div className="w-8">
                            <img src="https://img.daisyui.com/images/profile/demo/wonderperson@192.webp" />
                        </div>
                    </div>


                    
                    
                </div>
            </div>

        </div>
    )
}