'use client'

import { useState } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import { useRouter } from "next/navigation";
import { createClass } from "@/server-action/actions/class/createClass";
import { mutate } from "swr";
import AddClassCard from "./_component/components/AddClassCard";
import ClassCard from "./_component/components/ClassCard";
import AddClassModal from "./_component/components/AddClassModal";
import DeleteClassModal from "./_component/components/DeleteClassModal";
import DeletedClassList from "./_component/components/DeletedClassList";
import RenameClassModal from "./_component/components/RenameClassModal";
import { renameClass } from "@/server-action/actions/class/renameClass.action";
import { deleteClass, restoreClass } from "@/server-action/actions/class/classDelete.action";
import usePendingAction from "@/hooks/usePendingAction";
import { Toaster, toast } from "react-hot-toast";
import { signOut } from "next-auth/react";
import Footer from "@/components/ui/common/Footer";
export default function ClassesContainer() {
    const [modalId, setModalId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [renameTarget, setRenameTarget] = useState(null);
    const router = useRouter();
    const { runAction, isPending } = usePendingAction();
    const { data: deletedClasses } = useFetchData('/api/classes/trash');

    const refreshLists = () => Promise.all([mutate('/api/classes'), mutate('/api/classes/trash')]);

    const onDeleteClick = (cls) => {
        setDeleteTarget(cls);
        setModalId("DELETE_CLASS");
    };

    const onDeleteConfirm = (confirmName) => {
        runAction("deleteClass", async () => {
            const res = await deleteClass({ classId: String(deleteTarget._id), confirmName });
            if (!res.result) {
                toast.error(res.message);
                return;
            }
            setModalId(null);
            await refreshLists();
            toast.success(res.message);
        }).catch(() => toast.error("학급 삭제 중 오류가 발생했습니다."));
    };

    const onRenameClick = (cls) => {
        setRenameTarget(cls);
        setModalId("RENAME_CLASS");
    };

    const onRenameConfirm = (className) => {
        runAction("renameClass", async () => {
            const res = await renameClass({ classId: String(renameTarget._id), className });
            if (!res.result) {
                toast.error(res.message);
                return;
            }
            setModalId(null);
            await mutate('/api/classes');
            toast.success(res.message);
        }).catch(() => toast.error("학급 이름 변경 중 오류가 발생했습니다."));
    };

    const onRestore = (cls) => {
        runAction("restoreClass", String(cls._id), async () => {
            const res = await restoreClass({ classId: String(cls._id) });
            if (!res.result) {
                toast.error(res.message);
                return;
            }
            await refreshLists();
            toast.success(res.message);
        }).catch(() => toast.error("학급 복구 중 오류가 발생했습니다."));
    };

    const onCardClick = (id) => {
        router.push(`/teacher/dashboard/${id}`);
    };

    const onCreateClass = async ({ className }) => {
        const res = await createClass({ className }).catch(() => null);
        if (!res?.result) {
            toast.error(res?.message || "학급 생성에 실패했습니다.");
            return;
        }
        await mutate('/api/classes');
        toast.success(res.message);
    };
    const { data: classesData, isLoading: isClassesDataLoading, isError: isClassesDataError } = useFetchData('/api/classes');


    // 불러오는 중에도 같은 주황 배경 + 푸터를 화면 맨 아래에 (흰 공간이 보이지 않게)
    if (isClassesDataLoading || isClassesDataError) {
        return (
            <div className="bg-orange-100 min-h-dvh flex flex-col">
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    {isClassesDataError ? "학급 목록을 불러오지 못했습니다." : "불러오는 중..."}
                </div>
                <Footer className="border-orange-200" />
            </div>
        );
    }
    return (

        <div className="bg-orange-100 min-h-dvh flex flex-col">
          <div className="p-4 flex-1 flex justify-center">
            <div className="w-full max-w-[1024px]">
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
                            <ClassCard key={cls._id} cls={cls} onClick={() => onCardClick(cls._id)} onRename={onRenameClick} onDelete={onDeleteClick} />
                        ))}
                        <AddClassCard onClick={() => setModalId("ADD_CLASS")} />
                    </div>

                    <DeletedClassList
                        classes={deletedClasses}
                        onRestore={onRestore}
                        isRestoring={(id) => isPending("restoreClass", String(id))}
                    />
                </div>
            </div>
          </div>
          <Footer className="border-orange-200" />
            <AddClassModal
                modalId={modalId}
                setModalId={setModalId}
                onCreateClass={onCreateClass} />
            <RenameClassModal
                modalId={modalId}
                setModalId={setModalId}
                target={renameTarget}
                onConfirm={onRenameConfirm}
                isSaving={isPending("renameClass")} />
            <DeleteClassModal
                modalId={modalId}
                setModalId={setModalId}
                target={deleteTarget}
                onConfirm={onDeleteConfirm}
                isDeleting={isPending("deleteClass")} />
            <Toaster position="bottom-right" />
        </div>
    )
}