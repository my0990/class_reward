import EditGroupCard from "./EditGroupCard";
import { fetchData } from "@/hooks/swrHooks";
import { useState, useEffect, useRef } from "react";
import { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";

export default function EditGrouop({ setIsListPage, selectedGroup, setSelectedGroup }) {
    const { data: studentData, isLoading: isStudentLoading, isError: isStudentError } = fetchData('/api/fetchStudentData');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef();
    const spanRef = useRef();
    const [input, setInput] = useState('');


    const groupData = selectedGroup.selectedGroup;

    useEffect(() => {
        setInput(groupData.groupName);
    }, [])

    useEffect(() => {
        if (spanRef.current && inputRef.current) {
            inputRef.current.style.width = `${spanRef.current.offsetWidth + 2}px`;
        }
    }, [input]);



    const onChange = (e) => {
        setInput(e.target.value)
    }

    const onBlur = (e) => {
        console.log('blur')
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            setSelectedGroup(prev => ({ ...prev, selectedGroup: {...selectedGroup.selectedGroup, groupName: input}}))
            fetch("/api/editGroupName", {
                method: "POST",
                body: JSON.stringify({ groupKey: selectedGroup.groupKey, updatedGroupName: input }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {
                            const updatedGroupData = { ...prev.groupData, [selectedGroup.groupKey]: { ...groupData, groupName: input  } }
                            return { ...prev, groupData: updatedGroupData }
                        },
                        false // 서버 요청 없이 즉시 반영
                    );


                }
            })
        }
    }

    const onEdit = (e, newMember, isAdd) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            let updatedGroupData;
            let updatedGroupMember;
            if (isAdd) {
                updatedGroupMember = [...groupData.groupMember, newMember];
                updatedGroupData = { ...groupData, groupMember: updatedGroupMember };
            } else {
                updatedGroupMember = groupData.groupMember.filter((a, i) => a.userId !== newMember.userId);
                updatedGroupData = { ...groupData, groupMember: updatedGroupMember };
            }
            setSelectedGroup(prev => ({ ...prev, selectedGroup: updatedGroupData }))
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
                            const updatedGroupData = { ...prev.groupData, [selectedGroup.groupKey]: { groupName: groupData.groupName, groupColor: groupData.groupColor, groupMember: updatedGroupMember } }
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
            <div className="w-full flex justify-end text-[1.5rem] ">
                <button className="hover:scale-110 transition-all" onClick={() => setIsListPage(true)}>뒤로 가기</button>
            </div>
            <div className="pl-[16px] mb-[16px] flex items-center text-[1.6rem]">
                <div className='w-[32px] h-[32px] bg-red-500 rounded-full mr-[16px] '></div>
                <input onBlur={onBlur} ref={inputRef} className="bg-transparent box-content px-[16px] border-b-4 outline-none hover:cursor-pointer min-w-[12px] border-gray-500" onChange={onChange} value={input} />
                <span ref={spanRef} className="text-[1.6rem]" style={{ visibility: "hidden", position: "absolute", whiteSpace: "pre" }}>
                    {input || " "}
                </span>
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
                                <EditGroupCard key={i} data={a} onEdit={onEdit} isAdd={false} />
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            <div className=" mt-[32px] pl-[16px] text-[1.6rem]">제외</div>
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
                                <EditGroupCard key={i} data={a} onEdit={onEdit} isAdd={true} />
                            </motion.div>

                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}