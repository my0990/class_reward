// 비회원 타이머: 로그인 없이 바로 (설정·판서는 이 브라우저에만 저장)
import TimerTool from "@/components/tools/timer/TimerTool";

const description = "가입 없이 바로 쓰는 수업 타이머. 전체 화면, 판서판, 소음 측정, 끝날 때 알림음까지.";

export const metadata = {
  title: "수업 타이머",
  description,
  alternates: { canonical: "/tools/timer" },
  openGraph: { title: "수업 타이머 | 뀰", description, url: "/tools/timer" },
};

export default function GuestTimerPage() {
  return <TimerTool />;
}
