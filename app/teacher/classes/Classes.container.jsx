'use client'
import ClassesView from "./_component/Classes.view";
import { useState } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import { useRouter } from "next/navigation";
import { createClass } from "@/server-action/actions/class/createClass";
import { mutate } from "swr";
export default function ClassesContainer() {
    const [modalId, setModalId] = useState(null);
    const router = useRouter();

    const handleCardClick = (id) => {
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
        <>
            <ClassesView
                modalId={modalId}
                setModalId={setModalId}
                classesData={classesData}
                onCardClick={handleCardClick}
                onCreateClass={onCreateClass} />
        </>
    )
}