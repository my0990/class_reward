'use client'
import DeleteModal from "./section/modal/DeleteModal";
import DetailModal from "./section/modal/DetailModal";
import CreateModal from "./section/modal/CreateModal";
import ResetModal from "./section/modal/ResetModal";
import { useState, useMemo, useEffect, useCallback } from "react";
import CreateUniqueNickname from "./section/CreateUniqueNickname";
import { useFetchData } from "@/hooks/useFetchData";

import { useParams } from "next/navigation";
import StudentGrid from "./section/studentGrid";
import usePendingAction from "@/hooks/usePendingAction";
import { Toaster, toast } from "react-hot-toast";

import { createStudentAccount, deleteStudentAccount, resetPwd } from "@/server-action/actions/account/account.action";
export default function ManageContainer() {
    const params = useParams();
    const classId = params.id;

    const [modalId, setModalId] = useState(null);
    const [picked, setPicked] = useState(null);
    const [studentArr, setStudentArr] = useState({});

    // 1~40 고정 렌더
    const nums = useMemo(() => Array.from({ length: 40 }, (_, i) => i + 1), []);




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


    useEffect(() => {
        if (classData?.studentAccounts) {
            setStudentArr({ ...classData.studentAccounts });
        }
    }, [classData?.studentAccounts]);



    const { runAction, isPending } = usePendingAction();



    const onAccountToggle = useCallback((num) => {
        setStudentArr((prev) => {
            // "생성됨"은 토글 불가
            if (prev[num] === "생성됨") return prev;
            return { ...prev, [num]: prev[num] === true ? false : true };
        });
    }, []);

    const onAccountCreate = () => {
        const accountArr = nums.filter((n) => studentArr[n] === true);
        if (accountArr.length === 0) return; // 아무것도 선택 안 했으면 중단(원하면 메시지)

        runAction("create", async () => {
            const updatedStudentArr = Object.fromEntries(
                Object.entries(studentArr).map(([key, value]) => [
                    key,
                    value === true ? "생성됨" : value,
                ])
            );


            const data = await createStudentAccount({
                accountArr,
                updatedStudentArr,
                uniqueNickname: classData?.uniqueNickname,
                classId,
            });

            if (!data.result) {
                toast.error(data.message || "생성 실패");
                return;
            }

            await mutateClassData?.();
            await mutateStudentsData?.();
            setModalId(null)
            toast.success("생성 완료");
        })
    }
    const onAccountDelete = () => {
        runAction("delete", async () => {
            const data = await deleteStudentAccount({
                student: picked.userId, classNumber: picked.classNumber, classId: classId
            });

            if (!data.result) {
                toast.error(data.message || "삭제 실패");
                return;
            }

            await mutateClassData?.();
            await mutateStudentsData?.();
            setModalId(null)
            toast.success("삭제 완료");
        })

    }

    const onPwdReset = (e) => {

        runAction("reset", async () => {
            const data = await resetPwd({
                 student: picked.userId,
                 classId: classId,
                })

            if (!data.result) {
                toast.error(data.message || "초기화 실패");
                return;
            }

            await mutateClassData?.();
            await mutateStudentsData?.();
            setModalId(null)
            toast.success("비밀번호를 12345678로 초기화하였습니다");
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
            <CreateModal {...{ modalId, setModalId, onAccountToggle, onAccountCreate, isPending, nums, studentArr }} />
            <DeleteModal {...{ picked, modalId, setModalId, onAccountDelete, isPending }} />
            <ResetModal {...{ picked, modalId, setModalId, onPwdReset }} />
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