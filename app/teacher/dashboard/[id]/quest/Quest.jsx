'use client';

import LoadError from "@/components/ui/common/LoadError";
import { useEffect, useState } from "react";
import { mutate } from "swr";
import SortableList from "@/components/sortable/SortableList";
import useReorder from "@/hooks/useReorder";
import { reorderQuests } from "@/server-action/actions/quest/quest.action";

const getQuestId = (quest) => String(quest.questId ?? quest._id);
import { useParams } from "next/navigation";
import { useFetchData } from "@/hooks/useFetchData";
import { useLiveStudents } from "@/hooks/useLiveStudents";
import QuestCard from "./components/QuestCard";
import AddQuestModal from "./components/modal/AddQuestModal";
import QuestDetailTemplate from "./components/detail/QuestDetailTemplate";
import { groupByRepeat, REPEAT_COLORS } from "@/util/quest/questRepeat";
import { useDetailParam } from "@/hooks/useDetailParam";

export default function Quest() {
    const params = useParams();
    const classId = params.id;
    const [modalId, setModalId] = useState(null);
    // 상세는 주소(?id=퀘스트)로: 뒤로가기 → 목록, 새로고침해도 상세 유지
    const detail = useDetailParam("id");
    const [questDetailData, setQuestDetailData] = useState(null);

    const {
        data: questListData,
        isLoading: isQuestListLoading,
        isError: isQuestListError,
    } = useFetchData(
        classId
            ? `/api/fetchQuestList/${classId}`
            : null,
        // 승인 센터(다른 기기 포함)에서 승인하면 완료 명단이 바뀌므로 화면에 들어올 때마다 새로 받는다
        { revalidateOnMount: true, revalidateIfStale: true }
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
    } = useLiveStudents(classId) /* 바뀌었을 때만 다시 불러옴 */;

    const isLoading =
        isQuestListLoading ||
        isClassDataLoading ||
        isStudentDataLoading;

    const isError =
        isQuestListError ||
        isClassDataError ||
        isStudentDataError;

    // 드래그로 순서 바꾸기 (편집 모드에서만) — 훅은 조기 return보다 위에 있어야 한다
    const [isReordering, setIsReordering] = useState(false);
    const { ordered: orderedQuests, onReorder, isSaving: isSavingOrder } = useReorder(
        Array.isArray(questListData) ? questListData : [],
        getQuestId,
        (orderedIds) => reorderQuests({ classId, orderedIds }),
        () => mutate(`/api/fetchQuestList/${classId}`)
    );

    // 주소의 퀘스트 id에 맞춰 상세 데이터를 채운다 (새로고침·앞으로가기로 들어온 경우). 없는 퀘스트면 목록으로
    useEffect(() => {
        if (!detail.value || !Array.isArray(questListData)) return;
        if (questDetailData && getQuestId(questDetailData) === detail.value) return;
        const found = questListData.find((q) => getQuestId(q) === detail.value);
        if (found) setQuestDetailData(found);
        else detail.close();
    }, [detail.value, questListData]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) {
        return <div>Loading data...</div>;
    }

    if (isError) {
        return <LoadError />;
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

    // 종류별로 나눈 목록. 한 종류 안에서 순서를 바꾸면 전체 순서(일일 → 주간 → 일반)로 합쳐서 저장한다
    const sections = groupByRepeat(orderedQuests);
    const onReorderSection = (key, sectionIds) => {
        const all = sections.flatMap((sec) => (sec.key === key ? sectionIds : sec.items.map(getQuestId)));
        onReorder(all);
    };

    const onOpenAddQuestModal = () => {
        setModalId("ADD_QUEST");
    };

    const onOpenQuestDetail = (quest) => {
        setQuestDetailData(quest);
        detail.open(getQuestId(quest));
    };

    if (detail.value && questDetailData && getQuestId(questDetailData) === detail.value) {
        return (
            <QuestDetailTemplate
                classData={classData}
                studentData={studentData}
                classId={classId}
                role="teacher"
                questDetailData={questDetailData}
                setQuestDetailData={setQuestDetailData}
                // 상세의 '뒤로'·퀘스트 삭제 후: 뒤로가기와 똑같이 목록으로
                setIsDetail={(v) => {
                    if (!v) detail.close();
                }}
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
                    {questList.length > 1 && (
                        <div className="mt-[12px] flex items-center justify-end gap-[8px]">
                            {isReordering && (
                                <span className="text-[0.8rem] text-red-900/60">
                                    {isSavingOrder ? "저장 중..." : "끌어서 순서 바꾸기 (태블릿은 길게 눌러서)"}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsReordering((v) => !v)}
                                className={`rounded-full px-[12px] py-[4px] text-[0.85rem] font-bold transition ${
                                    isReordering ? "bg-orange-500 text-white" : "bg-white text-orange-500 ring-1 ring-orange-300 hover:bg-orange-50"
                                }`}
                            >
                                {isReordering ? "완료" : "↕ 순서 바꾸기"}
                            </button>
                        </div>
                    )}

                    {questList.length > 0 ? (
                        // 일일 → 주간 → 일반 순서로 나눠서. 순서 바꾸기는 같은 종류 안에서만
                        sections.map((sec) => (
                            <div key={sec.key} className="mt-[28px] first:mt-[16px]">
                                <h3 className={`flex items-baseline gap-[8px] border-b-2 pb-[4px] text-[1.3rem] font-bold ${REPEAT_COLORS[sec.key].title} ${REPEAT_COLORS[sec.key].line}`}>
                                    {sec.title}
                                    <span className="text-[0.85rem] font-medium opacity-70">
                                        {sec.items.length}개 · {sec.hint}
                                    </span>
                                </h3>
                                <SortableList
                                    items={sec.items}
                                    getId={getQuestId}
                                    onReorder={(ids) => onReorderSection(sec.key, ids)}
                                    enabled={isReordering}
                                    layout="vertical"
                                    renderItem={(quest) => (
                                        <QuestCard
                                            data={quest}
                                            classId={classId}
                                            studentCount={studentCount}
                                            role="teacher"
                                            onDetail={onOpenQuestDetail}
                                        />
                                    )}
                                />
                            </div>
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