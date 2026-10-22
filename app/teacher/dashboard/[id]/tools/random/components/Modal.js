"use client";
// 번호뽑기: 지급/회수 금액 키패드 창
// 대시보드 화폐 지급 창(PointModalBody·DialPad·usePointInput)을 그대로 같이 쓴다.
// - 키패드 입력은 창이 열려 있을 때만 받는다 (usePointInput을 창 안쪽에서 쓰기 때문)
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import ModalTemplate from "@/components/ui/common/ModalTemplate";
import usePointInput from "@/hooks/dashboard/usePointInput";
import { handlePoint } from "@/server-action/actions/class/handlePoint";
import { PointModalBody } from "@/app/teacher/dashboard/[id]/_dashboard/components/point-modal/PointModal";
import { PointInputProvider } from "@/app/teacher/dashboard/[id]/_dashboard/components/point-modal/PointInputContext";

export const POINT_MODAL_ID = "HANDLE_POINT";

export default function Modal({ modalId, setModalId, ...props }) {
    return (
        <ModalTemplate id={POINT_MODAL_ID} modalId={modalId} setModalId={setModalId}>
            {({ close }) => <PointKeypad {...props} close={close} />}
        </ModalTemplate>
    );
}

function PointKeypad({ studentArr, currencyName, targetStudent, clearAll, isSend, setStudentArr, classId, close }) {
    const labels = useMemo(
        () =>
            targetStudent.map((s) => {
                const nickname = s.profileNickname || s.userId;
                return { userId: s.userId, classNumber: s.classNumber, label: s.classNumber != null ? `${s.classNumber}번 ${nickname}` : nickname };
            }),
        [targetStudent]
    );

    // 실패하면 throw → DialPad가 에러 토스트, 입력값은 그대로 / 성공하면 입력값은 자동으로 비워짐
    const handleConfirm = useCallback(
        async (value) => {
            if (!value) throw new Error("숫자를 입력해주세요");
            if (targetStudent.length === 0) throw new Error("학생을 선택해주세요");

            // 서버 쪽 권한/검증 로직(server action)만 신뢰: 학생 목록은 userId/money만 최소로 전달
            const payload = targetStudent.map((s) => ({ userId: s.userId, money: s.money }));
            const res = await handlePoint({ classId, targetStudent: payload, point: value, isSend });
            if (!res?.result) throw new Error(res?.message || "처리 중 오류가 발생했습니다.");

            const names = targetStudent.map((s) => s.userId).join(", ");
            toast.success(
                isSend
                    ? `${names}에게 ${value}${currencyName ?? ""}를(을) 지급하였습니다.`
                    : `${names}에게서 ${value}${currencyName ?? ""}를(을) 회수하였습니다.`
            );

            const activeIds = new Set(targetStudent.map((s) => s._id));
            const delta = (isSend ? 1 : -1) * Number(value);
            clearAll();
            setStudentArr(
                studentArr.map((s) => (activeIds.has(s._id) ? { ...s, money: Number(s.money) + delta, isactive: false } : s))
            );
            mutate(
                `/api/students/${classId}`,
                (prev) => prev?.map((s) => (activeIds.has(s._id) ? { ...s, money: Number(s.money) + delta } : s)),
                false // 서버 요청 없이 즉시 반영 (자동 새로고침이 곧 서버 값으로 맞춤)
            );
            close();
        },
        [targetStudent, classId, isSend, currencyName, clearAll, setStudentArr, studentArr, close]
    );

    const { display, actions } = usePointInput({ onEnter: handleConfirm });

    return (
        <PointInputProvider display={display} actions={actions}>
            <PointModalBody isSend={isSend} currencyName={currencyName} activeStudentLabels={labels} />
        </PointInputProvider>
    );
}
