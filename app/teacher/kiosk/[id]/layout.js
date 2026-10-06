// 키오스크 화면에서만 "홈 화면에 추가"를 할 수 있게 manifest를 붙인다 (다른 화면에는 없음)
export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: "키오스크",
    manifest: `/api/kiosk-manifest/${id}`,
    appleWebApp: { capable: true, title: "뀰 키오스크", statusBarStyle: "default" },
  };
}

export default function KioskLayout({ children }) {
  return children;
}
