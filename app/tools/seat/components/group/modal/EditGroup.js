import EditGroupCard from "./EditGroupCard";
import { fetchData } from "@/hooks/swrHooks";
import { useState } from "react";
import { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";

export default function EditGrouop({ setIsListPage, selectedGroup, setSelectedGroup }) {
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const [isLoading, setIsLoading] = useState(false);
    const groupData = selectedGroup.selectedGroup;
    console.log(selectedGroup)
    console.log(groupData)
    const onEdit = (e, newMember, isAdd) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            let updatedGroupData;
            let updatedGroupMember;
            if(isAdd){
                updatedGroupMember = [...groupData.groupMember, newMember];
                updatedGroupData = { ...groupData, groupMember: updatedGroupMember };
            } else {
                updatedGroupMember = groupData.groupMember.filter((a,i)=> a.userId !== newMember.userId);
                updatedGroupData = {...groupData, groupMember: updatedGroupMember};
            }
            console.log(updatedGroupData)
            setSelectedGroup(prev => ({...prev, selectedGroup: updatedGroupData}))
            fetch("/api/editGroupMember", {
                method: "POST",
                body: JSON.stringify({ updatedGroupData: updatedGroupData, groupKey: selectedGroup.groupKey }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                
                if (data.result === true) {
                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {
                            console.log(prev)
                            // const updatedGroupData = {...prev.groupData, groupMember: [...prev.groupData.groupMember, newMember]}
                            // const updatedGroupData = prev.groupData.map((group) => group.groupId === groupData.groupId ? { ...group, groupMember: updatedGroupMember } : group)
                            console.log(updatedGroupMember)
                            const updatedGroupData = {...prev.groupData, [selectedGroup.groupKey]: {groupName: groupData.groupName, groupColor: groupData.groupColor, groupMember: updatedGroupMember}}
                            console.log(updatedGroupData)
                            return { ...prev, groupData: updatedGroupData }
                        },
                        false // 서버 요청 없이 즉시 반영
                    );


                }
            })
        }

    }
    if (isStudentLoading) return <div>Loading data...</div>;
    if (isStudentError) return <div>Error loading data</div>;


    return (
        <div className="flex flex-col w-full h-[564px] ">
            <div className="w-full flex justify-end text-[1.5rem]">
                <button onClick={() => setIsListPage(true)}>뒤로 가기</button>
            </div>
            <div className="pl-[16px] mb-[16px] flex items-center ">
                <h1 className="border-b-4 border-gray-400 inline-block">{groupData.groupName}</h1>
                <div className='w-[32px] h-[32px] bg-red-500 rounded-full ml-[16px] cursor-pointer'></div>
            </div>
            <div className="flex flex-wrap bg-orange-100 rounded-xl">
                <AnimatePresence>
                    {groupData.groupMember.map((a, i) => {
                        return (
                            <motion.div
                                key={a.userId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}>
                                <EditGroupCard key={i} data={a} onEdit={onEdit} isAdd={false}/>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            <div className=" mt-[32px] pl-[16px]">제외</div>
            <div className="flex flex-wrap  rounded-xl">
                <AnimatePresence>
                    {studentData.filter(user => !(new Set(groupData.groupMember.map(user => user.userId))).has(user.userId)).map((a, i) => {

                        return (
                            <motion.div
                                key={a.userId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}>
                                <EditGroupCard key={i} data={a} onEdit={onEdit} isAdd={true}/>
                            </motion.div>

                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}