'use client'
import DeleteModal from "./widzet//modal/DeleteModal";
import DetailModal from "./widzet//modal/DetailModal";
import CreateModal from "./widzet/modal/CreateModal";
import ResetModal from "./widzet/modal/ResetModal";
import { useState } from "react";
import CreateUniqueNickname from "./section/CreateUniqueNickname";
import { useFetchData } from "@/hooks/useFetchData";

import { useParams } from "next/navigation";
import StudentGrid from "./section/studentGrid";
import usePendingAction from "@/hooks/usePendingAction";
import { Toaster, toast } from "react-hot-toast";
export default function ManageContainer() {
    const params = useParams();
    const classId = params.id;

    const [modalId, setModalId] = useState(null);
    const [picked, setPicked] = useState(null);

    const {
        data: classData,
        isLoading: isClassLoading,
        isError: isClassError,
        error: classError,
        mutate: mutateClassData,
    } = useFetchData(classId ? `/api/classData/${classId}` : null);

    const {
        data: studentsData = [],
        isLoading: isStudentsLoading,
        isError: isStudentsError,
        error: studentsError,
        mutate: mutateStudentsData,
    } = useFetchData(classId ? `/api/students/${classId}` : null);






    const { runAction, isPending } = usePendingAction();

    const onAccountDelete = () => {
        runAction("delete", async () => {
            fetch("/api/deleteAccount", {
                method: "POST",
                body: JSON.stringify({ student: picked.userId, classNumber: picked.classNumber, classId: classId }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()).then((data) => {

                if (data.result === true) {
                    results.classData.mutate();
                    results.studentsData.mutate();
                    setModalId(null);
                    toast.success('삭제완료')

                }
            })
        })

    }





    const openModal = (modalId, data = null) => {
        setModalId(modalId);
        if (data) setPicked(data);
    };

    const onResetClick = (a) => openModal("RESET_ACCOUNT", a);
    const onDetailClick = (a) => openModal("DETAIL_ACCOUNT", a);
    const onDeleteClick = (a) => openModal("DELETE_ACCOUNT", a);
    const onCreateAccountclick = () => openModal("CREATE_ACCOUNT");
    const isLoading =
        isClassLoading || isStudentsLoading

    const isError =
        isClassError || isStudentsError
    if (isLoading) return <div>불러오는 중...</div>;
    if (isError) return <div>데이터 로드 실패</div>;


    const { currencyEmoji, currencyName, expTable } = classData;
    const { startExp, commonDifference } = expTable;
    return (
        <div>
            <div>
                <div>
                    {classData?.uniqueNickname
                        ? <div className="overflow-x-auto">
                            <div className="text-end">
                                <button className="border-2 bg-orange-300 rounded-lg p-[8px] cursor-pointer border-none font-bold hover:bg-orange-400" onClick={onCreateAccountclick}>계정 생성</button>
                            </div>
                            <StudentGrid {...{ currencyEmoji, currencyName, studentsData, onDetailClick, onResetClick, onDeleteClick }} />
                        </div>
                        : <CreateUniqueNickname classId={classId} />}
                </div>
            </div>
            <CreateModal {...{ modalId, setModalId, classData, classId }} />
            <DeleteModal {...{ picked, modalId, setModalId, onAccountDelete, isPending }} />
            <ResetModal {...{ picked, modalId, setModalId }} />
            <DetailModal {...{
                picked,
                startExp,
                commonDifference,
                modalId,
                setModalId,
            }} />
            <Toaster position="bottom-right" />
        </div>
    )
}