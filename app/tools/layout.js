// 비회원 도구: 로그인 없이 쓰는 타이머 등 (proxy.js 검사 대상이 아님)
// 헤더 없이 도구만 화면 가득. 각 도구 왼쪽 위에 뀰 아이콘(첫 화면으로)
export default function GuestToolsLayout({ children }) {
  return <div className="min-h-dvh">{children}</div>;
}
