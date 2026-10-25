import TimerDoneWatcher from "@/components/timer/TimerDoneWatcher";

// 키오스크 화면에서만 "홈 화면에 추가"를 할 수 있게 manifest를 붙인다 (다른 화면에는 없음)
export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: "키오스크",
    manifest: `/api/kiosk-manifest/${id}`,
    appleWebApp: { capable: true, title: "뀰 키오스크", statusBarStyle: "default" },
  };
}

export default async function KioskLayout({ children, params }) {
  const { id } = await params;
  return (
    <>
      {/* 선생님이 타이머를 켜 둔 채 같은 탭에서 키오스크로 왔을 때, 끝나면 토스트 */}
      <TimerDoneWatcher classId={id} />
      {children}
    </>
  );
}
