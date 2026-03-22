'use client'

import { useState } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import { useRouter } from "next/navigation";
import { createClass } from "@/server-action/actions/class/createClass";
import { mutate } from "swr";
import AddClassCard from "./_component/widget/AddClassCard";
import ClassCard from "./_component/widget/ClassCard";
import AddClassModal from "./_component/widget/AddClassModal";
import { signOut } from "next-auth/react";
export default function ClassesContainer() {
    const [modalId, setModalId] = useState(null);
    const router = useRouter();

    const onCardClick = (id) => {
        router.push(`/teacher/dashboard/${id}`);
    };

    const onCreateClass = async ({ className }) => {
        try {
            await createClass({ className });
            mutate('/api/classes')

        } catch (err) {
            alert(err.message)
        }
        // 🔥 캐시 무효화
    };
    const { data: classesData, isLoading: isClassesDataLoading, isError: isClassesDataError } = useFetchData('/api/classes');


    if (isClassesDataLoading) return <div>Loading data...</div>;
    if (isClassesDataError) return <div>Error loading data</div>;
    return (

        <div className="p-4 bg-orange-100 h-dvh flex justify-center ">
            <div className="w-[1024px]">
                <div>
                    <div className="flex justify-between items-center mt-4 mb-8">
                        <h1 className="font-bold text-[1.6rem] flex items-center">학급 선택</h1>
                        <button onClick={() => signOut({ callbackUrl: `${window.location.origin}/` })} className="bg-orange-500 text-white rounded-lg px-[16px] py-[8px] hover:scale-110 transition-all">로그아웃</button>
                    </div>
                    <div className="
                                        grid gap-4
                                        grid-cols-1
                                        sm:grid-cols-2
                                        md:grid-cols-3
                                        xl:grid-cols-4
                                        ">
                        {classesData.map(cls => (
                            <ClassCard key={cls._id} cls={cls} onClick={() => onCardClick(cls._id)} />
                        ))}
                        <AddClassCard onClick={() => setModalId("ADD_CLASS")} />
                    </div>
                </div>
            </div>
            <AddClassModal
                modalId={modalId}
                setModalId={setModalId}
                onCreateClass={onCreateClass} />
        </div>
    )
}