// 비회원 도구: 로그인 없이 쓰는 타이머 등 (proxy.js 검사 대상이 아님)
import GuestHeader from "@/components/tools/GuestHeader";

export default function GuestToolsLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <GuestHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
