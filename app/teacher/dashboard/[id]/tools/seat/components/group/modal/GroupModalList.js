import GroupCard from "./GroupCard";
import { useState } from "react";
import { fetchData } from "@/hooks/swrHooks";
import { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupModalList({ setIsListPage, setSelectedGroup }) {
    const { data: classData, isLoading: isClassLoading, isError: isClassError } = fetchData('/api/fetchClassData');
    const [isLoading, setIsLoading] = useState(false);

    const groupNames = [
        // 과일 테마
        "딸기쨈즈",
        "복숭아콩",
        "파인애플즈",
        "멜론몽",
        "체리팡팡",

        // 동물 테마
        "토끼단",
        "햄찌즈",
        "냥냥이들",
        "멍멍팡",
        "다람쥐즈",

        // 성격/느낌 테마
        "반짝반짝즈",
        "꾸러기단",
        "몽글몽글즈",
        "살랑이들",
        "수줍단",

        // 색깔 테마
        "민트초코즈",
        "핑꾸핑꾸",
        "라벤더몽",
        "주황팡",
        "파랑펑크",

        // 간식/음식 테마
        "쿠키단",
        "젤리몽",
        "아이스크림즈",
        "마카롱팡",
        "감자튀김즈"
    ];


    const onSubmit = (e) => {
        e.preventDefault();
        if (isLoading) {
            return
        } else {
            setIsLoading(true);
            const randomName = groupNames[Math.floor(Math.random() * groupNames.length)];
            const groupColor = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
            fetch("/api/addGroup", {
                method: "POST",
                body: JSON.stringify({ groupName: randomName, groupColor: groupColor }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {
                if (data.result === true) {
                    setIsLoading(false);
                    mutate(
                        "/api/fetchClassData",
                        (prev) => {
                            const prevData = prev.groupData
                            return { ...prev, groupData: {...prevData, [data.groupId]: {groupName: randomName, groupColor: groupColor, groupMember: []}}}
                        },
                        false // 서버 요청 없이 즉시 반영
                    );
                }
            })
        }
    }

    if (isClassLoading) return <div>Loading data...</div>;
    if (isClassError) return <div>Error loading data</div>;
    return (
        <div className="flex  w-full p-[24px] flex-col  bg-gray-100 items-center">
            <div className="flex justify-between items-center w-full px-[18px] mb-[16px]">
                <h1 className="text-[1.8rem] font-bold">
                    그룹 설정하기
                </h1>
                <button className="text-[1rem] btn bg-orange-300" onClick={onSubmit}>새로운 그룹 생성하기</button>
            </div>
            <div className="w-full flex flex-wrap">
                {/* {classData.groupData && classData.groupData.map((a, i) => {
                    return (
                        <GroupCard setIsListPage={setIsListPage} key={i} groupData={a} />
                    )
                })} */}
                <AnimatePresence>
                    {classData.groupData && Object.keys(classData?.groupData).map((groupKey, index) => (
                        <motion.div
                            key={groupKey}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        // className="bg-white p-3 rounded-xl shadow"
                        >
                            <GroupCard setIsListPage={setIsListPage} key={index} groupData = {classData?.groupData[groupKey]} gridData={classData?.gridData} groupKey={groupKey} setSelectedGroup={setSelectedGroup} />
                        </motion.div>
                    ))}
                </AnimatePresence>

            </div>
        </div>
    )
}