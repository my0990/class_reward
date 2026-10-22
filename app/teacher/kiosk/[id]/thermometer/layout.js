"use client";
import { useParams } from "next/navigation";
import KioskMenuGuard from "@/components/kiosk/KioskMenuGuard";

// 선생님이 키오스크 설정에서 이 메뉴를 숨겼으면 들어올 수 없다
export default function Layout({ children }) {
  const { id } = useParams();
  return (
    <KioskMenuGuard classId={id} menuKey="thermometer">
      {children}
    </KioskMenuGuard>
  );
}
