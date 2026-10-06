import Footer from "@/components/ui/common/Footer";

// 로그인·회원가입 화면 아래에 푸터 (개인정보처리방침 링크)
export default function AuthLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
