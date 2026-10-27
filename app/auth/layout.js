import Footer from "@/components/ui/common/Footer";

// 로그인·회원가입·비밀번호 찾기 화면 아래에 푸터 (개인정보처리방침 링크)
// 화면 높이 전체를 세로로 나눠서, 내용이 짧아도 푸터는 맨 아래에 붙고 (늘어나지 않고) 제 높이만 차지한다
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer className="shrink-0" />
    </div>
  );
}
