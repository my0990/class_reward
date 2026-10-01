'use client'
import DeleteModal from "./components/modal/DeleteModal";
import DetailModal from "./components/modal/DetailModal";
import CreateModal from "./components/modal/CreateModal";
import ResetModal from "./components/modal/ResetModal";
import { useState, useMemo, useEffect, useCallback } from "react";
import CreateUniqueNickname from "./components/CreateUniqueNickname";
import { useFetchData } from "@/hooks/useFetchData";

import { useParams } from "next/navigation";
import StudentGrid from "./components/studentGrid";
import usePendingAction from "@/hooks/usePendingAction";
import { Toaster, toast } from "react-hot-toast";
import { ManageProvider } from "./components/ManageContext";

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
        mutate: mutateClassData,
    } = useFetchData(classId ? `/api/classData/${classId}` : null);

    const {
        data: studentsData = [],
        isLoading: isStudentsLoading,
        isError: isStudentsError,
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
            // 아이디(별명+번호)와 "생성됨" 표시는 서버가 정한다.
            const data = await createStudentAccount({ accountArr, classId });

            if (!data.result) {
                toast.error(data.message || "생성 실패");
                await mutateClassData?.();
                return;
            }

            await mutateClassData?.();
            await mutateStudentsData?.();
            setModalId(null)
            toast.success(data.message || "생성 완료");
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
    // ✅ 로딩/에러 둘 다 아니어도 classData 자체가 없을 수 있음(예: 학급이 삭제된 경우) —
    // 방어 없이 바로 destructure하면 여기서 렌더링이 통째로 크래시남
    if (!classData) return <div>학급 정보를 찾을 수 없습니다.</div>;

    const { currencyEmoji, currencyName, expTable } = classData;
    const { startExp, commonDifference } = expTable;

    // ✅ manage 트리 전체(StudentGrid + 모달 4개)가 공유하는 상태/액션을 한 곳에 모음.
    // 각 자식은 이제 이 중 필요한 것만 useManageContext()로 꺼내 쓰고, 컨테이너는
    // 모달마다 다른 조합의 props를 일일이 릴레이하지 않는다.
    const manageContextValue = {
        modalId,
        setModalId,
        picked,
        studentArr,
        nums,
        currencyEmoji,
        currencyName,
        startExp,
        commonDifference,
        studentsData,
        isPending,
        onAccountToggle,
        onAccountCreate,
        onAccountDelete,
        onPwdReset,
        onResetClick,
        onDetailClick,
        onDeleteClick,
    };

    return (
        <ManageProvider value={manageContextValue}>
            <div>
                <div>
                    <div>
                        {classData?.uniqueNickname
                            ? <div className="overflow-x-auto">
                                <div className="text-end">
                                    <button className="border-2 bg-orange-300 rounded-lg p-[8px] cursor-pointer border-none font-bold hover:bg-orange-400" onClick={onCreateAccountclick}>계정 생성</button>
                                </div>
                                <StudentGrid />
                            </div>
                            : <CreateUniqueNickname classId={classId} />}
                    </div>
                </div>
                <CreateModal />
                <DeleteModal />
                <ResetModal />
                <DetailModal />
                <Toaster position="bottom-right" />
            </div>
        </ManageProvider>
    )
}
