"use client";

import { useManageContext } from "./ManageContext";
import RepToggle from "./RepToggle";

// 비밀번호 초기화·계정 삭제 버튼
// 컴포넌트 안에서 만들면 목록이 새로 그려질 때마다(대표 지정 등) 버튼이 새로 생겨서
// daisyUI 버튼의 등장 애니메이션 때문에 떨리는 것처럼 보인다 → 밖에 둔다
function ActionButtons({ student, compact, onResetClick, onDeleteClick }) {
    return (
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
}

// PC·태블릿: 표 / 휴대폰(640px 미만): 학생마다 카드
export default function StudentGrid() {
    const { currencyEmoji, currencyName, studentsData, onDetailClick, onResetClick, onDeleteClick } = useManageContext();

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
                            <th title="대표는 친구에게 화폐 지급·회수를 신청할 수 있어요 (승인 센터에서 확인)">⭐ 대표</th>
                            <th>계정 관리</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {studentsData?.map((a) => (
                            <tr key={a.userId}>
                                <td onClick={() => onDetailClick(a)} className="cursor-pointer rounded-xl transition-all hover:bg-orange-200">{a.userId}</td>
                                <td>{a.profileNickname}</td>
                                <td>{a.money}{currencyName}</td>
                                <td>
                                    <RepToggle student={a} />
                                </td>
                                <td className="p-[8px]">
                                    <ActionButtons student={a} onResetClick={onResetClick} onDeleteClick={onDeleteClick} />
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
                        <div className="flex flex-col items-end gap-[8px]">
                            <RepToggle student={a} compact />
                            <ActionButtons student={a} compact onResetClick={onResetClick} onDeleteClick={onDeleteClick} />
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}
