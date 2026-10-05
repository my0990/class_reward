'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import { useFetchData, LIVE_REFRESH } from "@/hooks/useFetchData";
import QuestCard from "./components/QuestCard";
import AddQuestModal from "./components/modal/AddQuestModal";
import QuestDetailTemplate from "./components/detail/QuestDetailTemplate";

export default function Quest() {
    const params = useParams();
    const classId = params.id;
    const [modalId, setModalId] = useState(null);
    const [isDetail, setIsDetail] = useState(false);
    const [questDetailData, setQuestDetailData] = useState(null);

    const {
        data: questListData,
        isLoading: isQuestListLoading,
        isError: isQuestListError,
    } = useFetchData(
        classId
            ? `/api/fetchQuestList/${classId}`
            : null
    );

    const {
        data: classData,
        isLoading: isClassDataLoading,
        isError: isClassDataError,
    } = useFetchData(
        classId
            ? `/api/classData/${classId}`
            : null
    );

    const {
        data: studentData,
        isLoading: isStudentDataLoading,
        isError: isStudentDataError,
    } = useFetchData(
        classId
            ? `/api/students/${classId}`
            : null,
        LIVE_REFRESH
    );

    const isLoading =
        isQuestListLoading ||
        isClassDataLoading ||
        isStudentDataLoading;

    const isError =
        isQuestListError ||
        isClassDataError ||
        isStudentDataError;

    if (isLoading) {
        return <div>Loading data...</div>;
    }

    if (isError) {
        return <div>Error loading data</div>;
    }

    const questList = Array.isArray(questListData)
        ? questListData
        : [];

    const studentCount = Array.isArray(studentData)
        ? studentData.length
        : 0;

    const currency = {
        name: classData?.currencyName ?? "",
        emoji: classData?.currencyEmoji ?? "",
    };

    const onOpenAddQuestModal = () => {
        setModalId("ADD_QUEST");
    };

    const onOpenQuestDetail = (quest) => {
        setQuestDetailData(quest);
        setIsDetail(true);
    };

    if (isDetail && questDetailData) {
        return (
            <QuestDetailTemplate
                classData={classData}
                studentData={studentData}
                classId={classId}
                role="teacher"
                questDetailData={questDetailData}
                setQuestDetailData={setQuestDetailData}
                setIsDetail={setIsDetail}
            />
        );
    }

    return (
        <main className="flex justify-center">
            <section
                className="
                    my-[32px] flex w-[600px] flex-col
                    items-center justify-center rounded-xl
                    bg-yellow-100 p-[64px] py-[40px]
                    max-[600px]:my-0 max-[600px]:w-full
                    max-[600px]:p-[16px]
                "
            >
                <header
                    className="
                        mr-[8px] flex w-full items-center
                        justify-between text-[2rem]
                        font-bold text-red-900
                    "
                >
                    <span className="border-l-8 border-orange-500 pl-[16px]">
                        임무 목록
                    </span>

                        <button
                            type="button"
                            onClick={onOpenAddQuestModal}
                            aria-label="퀘스트 추가"
                            className="
                                text-orange-400 transition-all
                                hover:scale-[120%]
                                hover:text-orange-500
                                focus:outline-none
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-[40px] w-[40px]"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                                />
                            </svg>
                        </button>
                </header>

                <div className="w-full">
                    {questList.length > 0 ? (
                        questList.map((quest) => (
                            <QuestCard
                                key={quest.questId ?? quest._id}
                                data={quest}
                                classId={classId}
                                studentCount={studentCount}
                                role="teacher"
                                onDetail={onOpenQuestDetail}
                            />
                        ))
                    ) : (
                        <div className="py-[48px] text-center text-red-900">
                            등록된 퀘스트가 없습니다.
                        </div>
                    )}
                </div>
            </section>

            <AddQuestModal
                classId={classId}
                currency={currency}
                modalId={modalId}
                setModalId={setModalId}
            />
        </main>
    );
}