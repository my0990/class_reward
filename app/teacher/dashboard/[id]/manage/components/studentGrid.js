"use client";

import { useManageContext } from "./ManageContext";

// PC·태블릿: 표 / 휴대폰(640px 미만): 학생마다 카드
export default function StudentGrid() {
    const { currencyEmoji, currencyName, studentsData, onDetailClick, onResetClick, onDeleteClick } = useManageContext();

    const ActionButtons = ({ student, compact }) => (
        <div className={`flex justify-center ${compact ? "gap-[6px]" : "gap-[8px]"}`}>
            <button
                onClick={() => onResetClick(student)}
                className={`btn border-0 bg-green-500 text-white ${compact ? "btn-sm text-[0.75rem]" : "text-[0.8rem]"}`}
            >
                비밀번호<br />초기화
            </button>
            <button
                onClick={() => onDeleteClick(student)}
                className={`btn border-0 bg-red-500 text-white ${compact ? "btn-sm text-[0.75rem]" : "text-[0.8rem]"}`}
            >
                계정<br />삭제
            </button>
        </div>
    );

    return (
        <>
            {/* PC·태블릿 */}
            <div className="hidden overflow-x-auto sm:block">
                <table className="table text-[1.1rem] lg:text-[1.2rem]">
                    <thead>
                        <tr className="text-center text-[1.1rem] lg:text-[1.2rem]">
                            <th>아이디</th>
                            <th>닉네임</th>
                            <th>{currencyEmoji} 소지{currencyName}</th>
                            <th>계정 관리</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {studentsData?.map((a) => (
                            <tr key={a.userId}>
                                <td onClick={() => onDetailClick(a)} className="cursor-pointer rounded-xl transition-all hover:bg-orange-200">{a.userId}</td>
                                <td>{a.profileNickname}</td>
                                <td>{a.money}{currencyName}</td>
                                <td className="p-[8px]">
                                    <ActionButtons student={a} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 휴대폰 */}
            <ul className="mt-[8px] flex flex-col gap-[10px] sm:hidden">
                {studentsData?.map((a) => (
                    <li key={a.userId} className="flex items-center justify-between gap-[8px] rounded-xl bg-white p-[12px] shadow-sm">
                        <button type="button" onClick={() => onDetailClick(a)} className="min-w-0 flex-1 text-left">
                            <div className="truncate font-bold text-orange-600">{a.userId}</div>
                            <div className="truncate text-[0.85rem] text-gray-500">{a.profileNickname}</div>
                            <div className="text-[0.9rem]">{currencyEmoji} {a.money}{currencyName}</div>
                        </button>
                        <ActionButtons student={a} compact />
                    </li>
                ))}
            </ul>
        </>
    )
}
