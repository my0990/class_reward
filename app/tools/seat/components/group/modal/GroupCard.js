import { useState } from "react";
import { mutate } from "swr";
export default function GroupCard({ setIsListPage, groupData, setSelectedGroup, groupKey, gridData }) {
    const [isLoading, setIsLoading] = useState(false);

    const onClick = () => {
        setSelectedGroup({ groupKey: groupKey, selectedGroup: groupData });
        setIsListPage(false)
    }


    const onDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) {
            return
        } else {
            setIsLoading(true)
            // const updatedGrid = gridData.map(row =>
            //     row.map(desk =>

            //         desk.group === target ? { ...desk, group: null } : desk
            //     )
            // );
            const updatedGrid = gridData.map(row =>
                row.map(desk =>{
                    const updatedGroupData = desk.group.filter((data) => data !== groupKey)
                    return (
                        {
                            ...desk,
                            group: updatedGroupData
                        }
                    )
                }
                )
            );
            console.log(updatedGrid)

            fetch("/api/deleteGroup", {
                method: "POST",
                body: JSON.stringify({ groupKey: groupKey, updatedGrid: updatedGrid }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {


                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {
                            console.log('mutate')
                            const { [groupKey]: _, ...rest } = prev.groupData;
                            return { ...prev, groupData: rest, gridData: updatedGrid }
                        },
                        false // 서버 요청 없이 즉시 반영
                    );

                }
            })
        }

    }
    return (
        <div className="w-[190px] h-[160px] bg-white flex flex-col cursor-pointer justify-between rounded-lg p-[16px] m-[16px]" onClick={onClick}>
            <div className="flex justify-between items-center">
                <div className="flex  items-center">
                    <div className="rounded-full  w-[24px] h-[24px] mr-[8px] " style={{ backgroundColor: groupData.groupColor }}></div>
                    <h1 className="text-[1.1rem]  w-[100px] overflow-hidden whitespace-nowrap text-ellipsis">{groupData.groupName}</h1>
                </div>
                <div onClick={onDelete} className="hover:scale-110 transition-all">
                    <svg className="w-[24px] h-[24px] size-6 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </div>
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