"use client";
// 선생님이 키오스크 설정에서 숨긴 메뉴면, 주소로 직접 들어와도 내용을 보여주지 않는다
import Link from "next/link";
import { useFetchData } from "@/hooks/useFetchData";
import { isKioskMenuOn } from "@/util/kiosk/kioskMenus";

export default function KioskMenuGuard({ classId, menuKey, children }) {
  const { data: classData, isLoading } = useFetchData(`/api/classData/${classId}`);
  if (isLoading && !classData) return null;
  if (classData && !isKioskMenuOn(classData, menuKey)) {
    return (
      <div className="flex min-h-[100vh] flex-col items-center justify-center gap-6 bg-orange-100 p-6 text-center">
        <div className="text-[1.8rem] font-bold text-orange-950">지금은 쓸 수 없는 메뉴예요.</div>
        <Link href={`/teacher/kiosk/${classId}`} className="rounded-xl bg-orange-500 px-8 py-4 text-[1.4rem] font-bold text-white">
          처음으로
        </Link>
      </div>
    );
  }
  return children;
}
