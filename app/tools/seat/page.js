// 비회원 자리 바꾸기: 로그인 없이 바로 (학생 이름은 서버로 보내지 않음)
import GuestSeat from "./GuestSeat";

const description = "가입 없이 바로 쓰는 자리 바꾸기 프로그램. 책상 배치, 떨어뜨리기·그룹 조건, 지난 짝 피하기, 인쇄까지.";

export const metadata = {
  title: "자리 바꾸기",
  description,
  alternates: { canonical: "/tools/seat" },
  openGraph: { title: "자리 바꾸기 | 뀰", description, url: "/tools/seat" },
};

export default function GuestSeatPage() {
  return <GuestSeat />;
}
