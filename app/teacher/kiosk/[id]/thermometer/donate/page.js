"use client";
// 온도계 기부: 학생 선택(잔액 0이면 막기 + 비밀번호) → 기부 수량 입력
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import StudentPicker from "../../_components/StudentPicker";
import { kioskHome } from "../../_components/KioskHeader";
import DonateAmount from "./DonateAmount";

export default function DonatePage() {
  const { id: classId } = useParams();
  const router = useRouter();
  const [picked, setPicked] = useState(null); // { user, kioskToken }

  return (
    <>
      {picked ? (
        <DonateAmount classId={classId} user={picked.user} kioskToken={picked.kioskToken} />
      ) : (
        <StudentPicker
          classId={classId}
          title="학급 온도계 기부"
          onBack={() => router.push(`${kioskHome(classId)}/thermometer`)}
          check={(user) => (user.money <= 0 ? "빈털털이입니다" : null)}
          onPicked={setPicked}
        />
      )}
      <Toaster position="bottom-right" />
    </>
  );
}
