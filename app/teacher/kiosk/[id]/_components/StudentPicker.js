"use client";
// 키오스크 학생 선택 (구매·사용·기부 공용)
// 학생 카드를 누르면 → check(학생)로 막을지 확인 → 비밀번호 키패드 → onPicked({ user, kioskToken })
import { useEffect, useState } from "react";
import { mutate } from "swr";
import { useFetchData, LIVE_REFRESH } from "@/hooks/useFetchData";
import KioskPasswordDialog, { KIOSK_PWD_DIALOG_ID } from "@/components/kiosk/KioskPasswordDialog";
import KioskHeader from "./KioskHeader";
import StudentCard from "./StudentCard";
export { notEnoughMessage } from "./kioskUtils";

/**
 * @param {{
 *   classId: string, title: string, guide?: string, onBack?: () => void,
 *   check?: (user, classData) => string | null,   // 막을 이유(문구)를 돌려주면 alert로 보여주고 멈춘다
 *   onPicked: ({ user, kioskToken }) => void,
 *   children?: React.ReactNode,                    // 제목 아래에 보여줄 내용 (예: 고른 아이템)
 * }} props
 */
export default function StudentPicker({ classId, title, guide = "계정을 선택하세요", onBack, check, onPicked, children }) {
  const studentsKey = `/api/students/${classId}`;
  const { data: classData, isLoading: l1, isError: e1 } = useFetchData(`/api/classData/${classId}`);
  const { data: students, isLoading: l2, isError: e2 } = useFetchData(studentsKey, LIVE_REFRESH);
  const [picked, setPicked] = useState(null);

  // 키오스크는 오래 켜 두므로, 이 화면에 들어올 때마다 최신 잔액을 다시 가져온다.
  useEffect(() => {
    mutate(studentsKey);
  }, [studentsKey]);

  if (l1 || l2) return <div className="p-8">불러오는 중...</div>;
  if (e1 || e2) return <div className="p-8">데이터 로드 실패</div>;

  const { currencyEmoji, expTable = {} } = classData;

  const onCardClick = (user) => {
    const reason = check?.(user, classData);
    if (reason) {
      alert(reason);
      return;
    }
    setPicked(user);
    document.getElementById(KIOSK_PWD_DIALOG_ID)?.showModal();
  };

  return (
    <div className="mx-auto w-full max-w-[1410px] px-4 pb-8">
      <KioskHeader classId={classId} title={title} onBack={onBack} onRefresh={() => mutate(studentsKey)} />
      {children}
      <div className="ml-[8px] mt-[16px] text-[2rem] text-red-500">{guide}</div>
      <div className="mt-2 grid grid-cols-[repeat(auto-fill,160px)] justify-center gap-4">
        {students.map((user) => (
          <StudentCard
            key={user.userId}
            user={user}
            currencyEmoji={currencyEmoji}
            startExp={expTable.startExp}
            commonDifference={expTable.commonDifference}
            onClick={() => onCardClick(user)}
          />
        ))}
      </div>
      <KioskPasswordDialog userData={picked} onSuccess={(kioskToken) => onPicked({ user: picked, kioskToken })} />
    </div>
  );
}

