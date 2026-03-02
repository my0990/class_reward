'use client';

import PointModal from './widget/PointModal';
import StudentInfoCard from './widget/StudentInfoCard';
import { toast, Toaster } from "react-hot-toast";
export default function ClassView({
    studentData = [],
    isStudentActive,     // 🔥 boolean 함수
    toggleStudent,
    selectAll,
    clearAll,
    onSend,
    onTake,
    isSelectedAll,
    hasSelectedStudent,
    currencyEmoji,
    currencyName,
    isSend,
    levelMap,
    modalId,
    setModalId,
    display,
    actions,
    activeIds,
    handleClose
}) {
    const handleToggleAll = () => {
        isSelectedAll ? clearAll() : selectAll();
    };

    return (
        <div className="pt-0 flex justify-center">
            <div className="w-[1410px] max-[1410px]:w-[1235px] max-[1235px]:w-[1060px] max-[1060px]:w-[885px] max-[885px]:w-[710px] max-[710px]:w-[535px] max-[535px]:w-[360px]">

                {/* Header */}
                <div className="flex py-[16px] mr-[8px] justify-between">
                    <button
                        className="btn bg-orange-500 text-white ml-[8px]"
                        onClick={handleToggleAll}
                        disabled={studentData.length === 0}
                    >
                        {isSelectedAll ? '모두 해제' : '모두 선택'}
                    </button>

                    <div>
                        <button
                            className="btn btn-success text-white mr-[16px]"
                            onClick={onSend}
                            disabled={!hasSelectedStudent}
                        >
                            {currencyName} 보내기
                        </button>

                        <button
                            className="btn bg-red-500 text-white"
                            onClick={onTake}
                            disabled={!hasSelectedStudent}
                        >
                            {currencyName} 빼앗기
                        </button>
                    </div>
                </div>

                {/* Student Cards */}
                <div className="flex flex-wrap">
                    {studentData.map((student) => {
                        const level = levelMap?.[student.userId] ?? 1
                        return (
                            <StudentInfoCard
                                key={student.userId}
                                data={student}
                                level={level}
                                currencyemoji={currencyEmoji}
                                isActive={isStudentActive(student)}
                                onClick={() => toggleStudent(student)}

                            />
                        )
                    })}
                </div>
            </div>
            <PointModal id="HANDLE_POINT" toast={toast} clearAll={clearAll} isSend={isSend} handleClose={handleClose} activeIds={activeIds} modalId={modalId} setModalId={setModalId} display={display} actions={actions} />
            <Toaster position="bottom-right" />
        </div>
    );
}